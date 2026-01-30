import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/question_type.dart';
import 'package:mobile_client/constants/styles/colors/colors.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/game/game_manager_service.dart';
import 'package:mobile_client/services/game/game_state_service.dart';
import 'package:mobile_client/services/game/player_review_snackbar_service.dart';
import 'package:mobile_client/services/game/submit_manager_service.dart';
import 'package:mobile_client/widgets/game/answer_types/drawing_answer/drawing_answer.dart';
import 'package:mobile_client/widgets/game/answer_types/estimation_answer.dart';
import 'package:mobile_client/widgets/game/answer_types/multiple_choice_answer.dart';
import 'package:mobile_client/widgets/game/answer_types/open_ended_answer.dart';
import 'package:mobile_client/widgets/game/power_up_indicator.dart';
import 'package:mobile_client/widgets/game/standard_game_timer.dart';
import 'package:mobile_client/widgets/image_viewer.dart';
import 'package:multi_value_listenable_builder/multi_value_listenable_builder.dart';

class GamePannel extends StatefulWidget {
  const GamePannel({super.key});

  @override
  GamePannelState createState() => GamePannelState();
}

class GamePannelState extends State<GamePannel> {
  final GameStateService gameStateService = locator.get<GameStateService>();
  final SubmitManagerService submitManagerService =
      locator.get<SubmitManagerService>();
  final GameManagerService gameManagerService =
      locator.get<GameManagerService>();
  final PlayerReviewSnackbarService playerReviewSnackbarService =
      locator.get<PlayerReviewSnackbarService>();

  @override
  void initState() {
    super.initState();
    playerReviewSnackbarService.setupListener();
  }

  @override
  void dispose() {
    playerReviewSnackbarService.removeListener();
    super.dispose();
  }

  void Function()? submit(bool isSubmitted, bool isEliminated) {
    return !isSubmitted &&
            !isEliminated &&
            submitManagerService.answerIsChosen(gameStateService.questionType)
        ? () => gameManagerService.submitAnswer()
        : null;
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.only(top: 12, right: 12, bottom: 0, left: 12),
        child: ValueListenableBuilder(
            valueListenable: gameStateService.currentQuestion,
            builder: (context, currentQuestion, child) {
              return Column(
                spacing: 20,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: MyColors.lightBlack,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const StandardGameTimer(),
                      ),
                      PowerUpIndicator(),
                      Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: MyColors.lightBlack,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: ConstrainedBox(
                            constraints: const BoxConstraints(
                              minWidth: 140,
                            ),
                            child: Center(
                              child: ValueListenableBuilder(
                                  valueListenable: gameStateService.playerScore,
                                  builder: (_, playerScore, __) {
                                    return Text(
                                      '$playerScore pts',
                                      style: const TextStyle(
                                        fontSize: 40,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    );
                                  }),
                            ),
                          )),
                    ],
                  ),
                  Expanded(
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: MyColors.lightBlack,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        spacing: 18,
                        children: [
                          Column(
                            spacing: 10,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                '${currentQuestion?.text}',
                                style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white),
                                textAlign: TextAlign.center,
                              ),
                              Text(
                                '${currentQuestion?.points} points',
                                style: const TextStyle(
                                    fontSize: 18,
                                    fontStyle: FontStyle.italic,
                                    color: Colors.white),
                              ),
                            ],
                          ),
                          if (currentQuestion != null &&
                              currentQuestion.imageUrl.isNotEmpty)
                            Container(
                              constraints:
                                  BoxConstraints(maxHeight: 100, maxWidth: 100),
                              child: ImageViewer(
                                  imageUrl:
                                      '${currentQuestion.imageUrl}?${DateTime.now()}'),
                            ),
                        ],
                      ),
                    ),
                  ),
                  MultiValueListenableBuilder(
                      valueListenables: [
                        gameStateService.isEliminated,
                        gameStateService.isSubmitted,
                      ],
                      builder: (_, values, __) {
                        final isEliminated = values.elementAt(0) as bool;
                        final isSubmitted = values.elementAt(1) as bool;
                        final canAnswer = !isEliminated && !isSubmitted;
                        return ListenableBuilder(
                            listenable: submitManagerService,
                            builder: (_, __) {
                              return Column(
                                spacing: 20,
                                children: [
                                  switch (gameStateService.questionType) {
                                    QuestionType.multiChoice =>
                                      MultipleChoiceAnswer(
                                          canAnswer: canAnswer),
                                    QuestionType.openEnded =>
                                      OpenEndedAnswer(canAnswer: canAnswer),
                                    QuestionType.estimation =>
                                      EstimationAnswerWidget(
                                          canAnswer: canAnswer),
                                    QuestionType.drawing =>
                                      DrawingAnswerWidget()
                                  },
                                  SizedBox(
                                    width: 400,
                                    height: 50,
                                    child: ElevatedButton.icon(
                                      icon: Icon(Icons.check),
                                      onPressed:
                                          submit(isSubmitted, isEliminated),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Theme.of(context)
                                            .colorScheme
                                            .secondary,
                                      ),
                                      label: const Text(
                                        'Soumettre la réponse',
                                        style: TextStyle(
                                            fontSize: 18, color: Colors.white),
                                      ),
                                    ),
                                  ),
                                ],
                              );
                            });
                      }),
                ],
              );
            }),
      ),
    );
  }
}
