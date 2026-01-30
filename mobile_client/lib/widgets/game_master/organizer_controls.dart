import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/question_type.dart';
import 'package:mobile_client/constants/enum/timer_type.dart';
import 'package:mobile_client/constants/game_constants.dart';
import 'package:mobile_client/constants/socket_events/game_event.dart';
import 'package:mobile_client/constants/styles/colors/colors.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/game/game_state_service.dart';
import 'package:mobile_client/services/game/timer_service.dart';
import 'package:mobile_client/services/websocket_service.dart';
import 'package:mobile_client/widgets/game/answer_types/multiple_choice_answer.dart';
import 'package:mobile_client/widgets/image_viewer.dart';
import 'package:multi_value_listenable_builder/multi_value_listenable_builder.dart';

class OrganizerControls extends StatefulWidget {
  const OrganizerControls({super.key});

  @override
  State<OrganizerControls> createState() => _OrganizerControlsState();
}

class _OrganizerControlsState extends State<OrganizerControls> {
  final TimerService _timerService = locator.get<TimerService>();
  final WebSocketService _webSocketService = locator.get<WebSocketService>();
  final GameStateService _gameStateService = locator.get<GameStateService>();

  bool isAnswerDuration = true;
  bool isProcessing = false;

  @override
  void initState() {
    super.initState();
    _setupAllPlayersSubmitted();
    _timerService.timerEnded.addListener(_onEndTimer);
    _timerService.timerStarted.addListener(_onStartTimer);
  }

  @override
  void dispose() {
    _timerService.timerEnded.removeListener(_onEndTimer);
    _timerService.timerStarted.removeListener(_onStartTimer);
    _webSocketService.removeAllListeners(GameEvent.sendAnswers.name);
    super.dispose();
  }

  void _onEndTimer() {
    if (mounted) {
      setState(() {
        isAnswerDuration = false;
      });
    }
  }

  void _onStartTimer() {
    if (_timerService.currentType == TimerType.answerDuration) {
      if (mounted) {
        setState(() {
          isAnswerDuration = true;
          isProcessing = false;
        });
      }
    }
  }

  void loadNextQuestion() {
    setState(() {
      isProcessing = true;
    });
    if (_gameStateService.questionType == QuestionType.drawing) {
      _gameStateService.playersAwsKeys = [];
    }
    _webSocketService.send(GameEvent.nextQuestion.name);
  }

  disablePanicTimer(int time, bool isPanicMode) {
    final enoughTimeToActivate = switch (_gameStateService.questionType) {
      QuestionType.multiChoice ||
      QuestionType.estimation =>
        time >= panicActivationCutoff,
      QuestionType.openEnded ||
      QuestionType.drawing =>
        time >= panicActivationCutoff,
    };
    return isPanicMode || !isAnswerDuration || !enoughTimeToActivate;
  }

  void _setupAllPlayersSubmitted() {
    _webSocketService.on(GameEvent.sendAnswers.name, (_) {
      if (mounted) {
        setState(() {
          isAnswerDuration = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      spacing: 12,
      children: [
        Container(
          width: double.infinity,
          padding: EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            color: MyColors.lightBlack,
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              Positioned(
                top: 0,
                left: 0,
                child: CustomText(
                    text:
                        "Question ${_gameStateService.currentQuestionIndex} / ${_gameStateService.questionsLength}",
                    fontSize: 24),
              ),
              Positioned(
                top: 0,
                right: 0,
                child: ValueListenableBuilder<int>(
                  valueListenable: _timerService.time,
                  builder: (context, time, child) =>
                      CustomText(text: '$time s', fontSize: 24, bold: true),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: 50),
                child: Column(
                  spacing: 16,
                  children: [
                    CustomText(
                        fontSize: 30,
                        text:
                            '${_gameStateService.currentQuestion.value?.text}'),
                    if (_gameStateService.currentQuestion.value != null &&
                        _gameStateService
                            .currentQuestion.value!.imageUrl.isNotEmpty)
                      Container(
                        width: 100,
                        height: 100,
                        constraints:
                            BoxConstraints(maxHeight: 100, maxWidth: 100),
                        child: ImageViewer(
                            imageUrl:
                                '${_gameStateService.currentQuestion.value?.imageUrl}?${DateTime.now()}'),
                      ),
                    switch (_gameStateService.questionType) {
                      QuestionType.multiChoice => MultipleChoiceAnswer(
                          canAnswer: false,
                          showAnswers: true,
                          buttonWidth: 160,
                          buttonHeight: 120,
                        ),
                      QuestionType.estimation => CustomText(
                          bold: true,
                          fontSize: FontSize.l,
                          text:
                              'Réponse: ${_gameStateService.currentQuestion.value?.answer} ± ${_gameStateService.currentQuestion.value?.precision}',
                        ),
                      _ => Container(),
                    }
                  ],
                ),
              ),
            ],
          ),
        ),
        Row(
          spacing: 10,
          children: [
            Expanded(
              child: ValueListenableBuilder<bool>(
                valueListenable: _timerService.isTimerActivated,
                builder: (context, isTimerActivated, child) {
                  return ActionButton(
                    onPressed: isAnswerDuration
                        ? (isTimerActivated
                            ? _timerService.pauseCountdown
                            : _timerService.resumeCountdown)
                        : null,
                    icon: isTimerActivated ? Icons.pause : Icons.play_arrow,
                    text: isTimerActivated ? "Arrêter" : "Reprendre",
                  );
                },
              ),
            ),
            Expanded(
                child: MultiValueListenableBuilder(
                    valueListenables: [
                  _timerService.isPanicMode,
                  _timerService.time,
                ],
                    builder: (_, values, __) {
                      final isPanicMode = values.elementAt(0) as bool;
                      final time = values.elementAt(1) as int;
                      return ActionButton(
                        onPressed: disablePanicTimer(time, isPanicMode)
                            ? null
                            : _timerService.enterPanicMode,
                        icon: Icons.speed,
                        text: "Mode panique",
                      );
                    })),
          ],
        ),
        // Next Question Button
        SizedBox(
            width: double.infinity,
            child: ActionButton(
              onPressed:
                  isAnswerDuration || isProcessing ? null : loadNextQuestion,
              icon: Icons.navigate_next,
              text: _gameStateService.currentQuestionIndex ==
                      _gameStateService.questionsLength
                  ? "Afficher les résultats"
                  : "Prochaine question",
              isPrimary: false,
            )),
      ],
    );
  }
}

class ActionButton extends StatelessWidget {
  const ActionButton(
      {super.key,
      required this.onPressed,
      required this.icon,
      required this.text,
      this.isPrimary = true});

  final void Function()? onPressed;
  final IconData icon;
  final String text;
  final bool isPrimary;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context).colorScheme;
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, color: theme.surface, size: 30),
      label: CustomText(text: text, fontSize: 18),
      style: ElevatedButton.styleFrom(
        padding: isPrimary
            ? EdgeInsets.symmetric(vertical: 16, horizontal: 24)
            : EdgeInsets.symmetric(vertical: 32, horizontal: 24),
        backgroundColor: isPrimary ? theme.primary : theme.secondary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }
}

class CustomText extends StatelessWidget {
  const CustomText(
      {super.key,
      required this.text,
      required this.fontSize,
      this.bold = false});
  final String text;
  final double fontSize;
  final bool bold;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: TextStyle(
          fontSize: fontSize,
          fontWeight: bold ? FontWeight.bold : FontWeight.normal,
          color: Theme.of(context).colorScheme.surface),
    );
  }
}
