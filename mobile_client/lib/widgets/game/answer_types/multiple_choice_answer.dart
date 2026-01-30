import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:mobile_client/constants/game_constants.dart';
import 'package:mobile_client/constants/styles/colors/colors.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/models/multi_choice.dart';
import 'package:mobile_client/services/game/game_state_service.dart';
import 'package:mobile_client/services/game/submit_manager_service.dart';
import 'package:mobile_client/services/power_up_service.dart';
import 'package:mobile_client/services/room_service.dart';

class MultipleChoiceAnswer extends StatefulWidget {
  final bool canAnswer;
  final bool showAnswers;
  final double buttonWidth;
  final double buttonHeight;

  const MultipleChoiceAnswer(
      {super.key,
      required this.canAnswer,
      this.showAnswers = false,
      this.buttonWidth = 180,
      this.buttonHeight = 150});

  @override
  State<MultipleChoiceAnswer> createState() => _MultipleChoiceAnswerState();
}

class _MultipleChoiceAnswerState extends State<MultipleChoiceAnswer> {
  final GameStateService gameStateService = locator.get<GameStateService>();
  final PowerUpService powerUpService = locator.get<PowerUpService>();
  final SubmitManagerService submitManagerService =
      locator.get<SubmitManagerService>();
  final RoomService roomService = locator.get<RoomService>();

  late StreamSubscription<void> _cheatingSubscription;

  @override
  void initState() {
    super.initState();
    if (!roomService.arePowerUpsEnabled) return;
    _cheatingSubscription =
        powerUpService.cheatingPowerUpActivated$.listen((_) {
      _applyCheatingPowerUp();
    });
  }

  @override
  void dispose() {
    _cheatingSubscription.cancel();
    super.dispose();
  }

  void _applyCheatingPowerUp() {
    List<int> wrongAnswerIndexes = [];

    for (int i = 0; i < gameStateService.questionChoices.length; i++) {
      if (powerUpService.cheatingContent
          .contains(gameStateService.questionChoices[i].text)) {
        wrongAnswerIndexes.add(i);
      }
    }

    if (wrongAnswerIndexes.isNotEmpty) {
      final randomIndex = wrongAnswerIndexes[
          (wrongAnswerIndexes.length * Random().nextDouble()).toInt()];
      submitManagerService.disabledAnswerChoices.add(randomIndex);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content:
              Text('Tricheur: aucune mauvaise réponse disponible à désactiver'),
          duration: Duration(seconds: 3),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<List<MultiChoice>>(
      valueListenable: powerUpService.confusionQuestionChoices,
      builder: (_, confusedChoices, __) {
        final choices = confusedChoices.isNotEmpty
            ? confusedChoices
            : gameStateService.questionChoices;

        return ValueListenableBuilder<List<int>>(
            valueListenable: powerUpService.tornadoShuffledIndexes,
            builder: (_, shuffledIndexes, __) {
              final displayOrder = shuffledIndexes.isEmpty
                  ? List.generate(choices.length, (i) => i)
                  : shuffledIndexes;

              return Row(
                mainAxisAlignment: MainAxisAlignment.center,
                spacing: 20,
                children: [
                  for (final index in displayOrder)
                    InkWell(
                      onTap: widget.canAnswer &&
                              !submitManagerService.disabledAnswerChoices
                                  .contains(index)
                          ? () => submitManagerService.buttonWasClicked(index)
                          : null,
                      child: ListenableBuilder(
                        listenable: submitManagerService,
                        builder: (_, __) {
                          final isDisabled = submitManagerService
                              .disabledAnswerChoices
                              .contains(index);
                          final multipleChoice = choices[index];

                          return Container(
                            width: widget.buttonWidth,
                            height: widget.buttonHeight,
                            decoration: buttonDecoration(
                              submitManagerService.buttonsAreActive[index],
                              widget.showAnswers && multipleChoice.isCorrect,
                              isDisabled,
                              context,
                            ),
                            alignment: Alignment.center,
                            child: MultiChoiceText(
                              index: index + 1,
                              text: multipleChoice.text,
                              icon: buttonIcons[index],
                              isDisabled: isDisabled,
                            ),
                          );
                        },
                      ),
                    ),
                ],
              );
            });
      },
    );
  }

  BoxDecoration buttonDecoration(bool isSelected, bool showAnswers,
      bool isDisabled, BuildContext context) {
    final theme = Theme.of(context).colorScheme;
    return BoxDecoration(
      color: isDisabled
          ? Colors.grey[400]
          : showAnswers
              ? const Color(0xFF43A047)
              : isSelected
                  ? theme.secondary.withAlpha(128)
                  : Colors.grey[200],
      borderRadius: BorderRadius.circular(10),
      border: isSelected && !isDisabled
          ? Border.all(color: theme.secondary, width: 2)
          : null,
    );
  }
}

class MultiChoiceText extends StatelessWidget {
  const MultiChoiceText(
      {super.key,
      required this.index,
      required this.text,
      required this.icon,
      this.isDisabled = false});

  final int index;
  final String text;
  final IconData icon;
  final bool isDisabled;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon,
            size: 40,
            color: isDisabled ? Colors.grey[600] : MyColors.lightBlack),
        const SizedBox(width: 12),
        Text(
          '$index. $text',
          style: TextStyle(
            fontSize: 16,
            color: isDisabled ? Colors.grey[600] : Colors.black,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
