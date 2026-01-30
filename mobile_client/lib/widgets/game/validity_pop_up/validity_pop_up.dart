import 'package:flutter/material.dart';
import 'package:mobile_client/constants/socket_events/game_event.dart';
import 'package:mobile_client/constants/styles/colors/colors.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/models/game/question_answer.dart';
import 'package:mobile_client/services/websocket_service.dart';
import 'package:mobile_client/utils/app_navigator.dart';
import 'package:mobile_client/widgets/game/validity_pop_up/validity_pop_up_icon.dart';
import 'package:mobile_client/widgets/game/validity_pop_up/validity_pop_up_icon_title.dart';
import 'package:mobile_client/widgets/game/validity_pop_up/validity_pop_up_percentage.dart';
import 'package:mobile_client/widgets/game/validity_pop_up/validity_pop_up_points_gained.dart';
import 'package:mobile_client/widgets/game/validity_pop_up/validity_pop_up_right_answers.dart';

class ValidityPopUp extends StatelessWidget {
  const ValidityPopUp(
      {super.key,
      required BaseQuestionAnswer questionAnswer,
      required this.isEliminated})
      : _questionAnswer = questionAnswer;
  final QuestionAnswer _questionAnswer;
  final bool isEliminated;

  void closePopup(BuildContext context) {
    if (_questionAnswer is DrawingAnswer) {
      locator.get<WebSocketService>().send(GameEvent.getDrawings.name);
    }
    AppNavigator.pop(context);
  }

  ButtonStyle _buttonStyle(bool isPartial) => ElevatedButton.styleFrom(
        backgroundColor: isPartial
            ? Colors.orangeAccent
            : _questionAnswer.pointsGained > 0
                ? MyColors.green
                : MyColors.red,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      );

  @override
  Widget build(BuildContext context) {
    bool isPartial = false;
    if (_questionAnswer is OpenEndedAnswer) {
      isPartial = _questionAnswer.percentageGiven == 0.5;
    }

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: 10,
          children: [
            if (_questionAnswer is QuestionAnswerBonus) ...[
              if (!isEliminated)
                ValidityPopUpIcon(pointsGained: _questionAnswer.pointsGained),
              ValidityPopUpIconTitle(
                  pointsGained: _questionAnswer.pointsGained,
                  isEliminated: isEliminated),
              ValidityPopUpRightAnswers(answers: _questionAnswer.answers),
            ],
            if (_questionAnswer is OpenEndedAnswer) ...[
              ValidityPopUpPercentage(
                  percentageGiven: _questionAnswer.percentageGiven),
              ValidityPopUpIconTitle(
                  pointsGained: _questionAnswer.pointsGained,
                  isPartial: isPartial,
                  isEliminated: isEliminated),
            ],
            if (_questionAnswer is DrawingAnswer) ...[
              ValidityPopUpPercentage(
                  percentageGiven: _questionAnswer.percentageGiven),
              ValidityPopUpIconTitle(
                pointsGained: _questionAnswer.pointsGained,
                isPartial: isPartial,
                isEliminated: isEliminated,
              ),
            ],
            ValidityPopUpPointsGained(questionAnswer: _questionAnswer),
            ElevatedButton(
              onPressed: () => closePopup(context),
              style: _buttonStyle(isPartial),
              child: const Text('Ok', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}
