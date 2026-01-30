import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/game_mode.dart';
import 'package:mobile_client/constants/enum/question_type.dart';
import 'package:mobile_client/constants/list_wrapper.dart';
import 'package:mobile_client/constants/socket_events/game_event.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/models/environment.dart';
import 'package:mobile_client/models/game/player_answer_for_review.dart';
import 'package:mobile_client/models/game/review_answer_score.dart';
import 'package:mobile_client/services/game/game_state_service.dart';
import 'package:mobile_client/services/room_service.dart';
import 'package:mobile_client/services/websocket_service.dart';
import 'package:mobile_client/utils/app_navigator.dart';

class PlayerReviewPopUp extends StatefulWidget {
  final List<PlayerAnswerForReview> answers;

  const PlayerReviewPopUp({super.key, required this.answers});

  @override
  PlayerReviewPopUpState createState() => PlayerReviewPopUpState();
}

class PlayerReviewPopUpState extends State<PlayerReviewPopUp> {
  final WebSocketService _webSocketService = locator.get<WebSocketService>();
  final RoomService _roomService = locator.get<RoomService>();
  final GameStateService _gameStateService = locator.get<GameStateService>();

  int answerIndex = 0;
  List<ReviewedAnswerScore> reviewedAnswerScore = [];

  @override
  void initState() {
    super.initState();
    if (widget.answers.firstOrNull?.questionType == QuestionType.drawing) {
      _gameStateService.playersAwsKeys =
          widget.answers.map((answer) => answer.answer).toList();
    }
  }

  void saveScore(double score) {
    setState(() {
      reviewedAnswerScore.add(ReviewedAnswerScore(
        percentageGiven: score,
        name: widget.answers[answerIndex].name,
      ));
      answerIndex++;

      if (answerIndex == widget.answers.length) {
        sendScoreToPlayers();
      }
    });
  }

  void sendScoreToPlayers() {
    _webSocketService.send(
        GameEvent.sendReviews.name, ListWrapper(reviewedAnswerScore));
    reviewedAnswerScore = [];
    answerIndex = 0;
    AppNavigator.pop(context); // Close dialog
  }

  @override
  Widget build(BuildContext context) {
    final currentAnswer = widget.answers[answerIndex];
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Container(
        width: 500,
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _roomService.gameMode == GameMode.team
                ? Text(
                    "Réponse",
                    style: Theme.of(context).textTheme.headlineSmall,
                  )
                : Text.rich(
                    TextSpan(
                      text: 'Réponse de: ',
                      style: Theme.of(context).textTheme.headlineSmall,
                      children: [
                        TextSpan(
                          text: currentAnswer.name,
                          style: Theme.of(context)
                              .textTheme
                              .headlineSmall
                              ?.copyWith(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
            const SizedBox(height: 10),
            currentAnswer.questionType == QuestionType.drawing
                ? Container(
                    decoration:
                        BoxDecoration(borderRadius: BorderRadius.circular(10)),
                    child: Image.network(
                      '${Environment.s3BucketUrl}${currentAnswer.answer}',
                      fit: BoxFit.contain,
                      width: 750,
                    ))
                : Text(
                    currentAnswer.answer,
                    style: const TextStyle(fontSize: 16),
                    textAlign: TextAlign.center,
                  ),
            Column(
              children: [
                const Text("Note:",
                    style:
                        TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton(
                      onPressed: () => saveScore(0),
                      child: const Text("0%"),
                    ),
                    ElevatedButton(
                      onPressed: () => saveScore(0.5),
                      child: const Text("50%"),
                    ),
                    ElevatedButton(
                      onPressed: () => saveScore(1),
                      child: const Text("100%"),
                    ),
                  ],
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}
