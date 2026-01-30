import 'package:flutter/material.dart';
import 'package:mobile_client/models/game/question_answer.dart';

class ValidityPopUpPointsGained extends StatelessWidget {
  const ValidityPopUpPointsGained(
      {super.key, required BaseQuestionAnswer questionAnswer})
      : _questionAnswer = questionAnswer;

  final QuestionAnswer _questionAnswer;

  @override
  Widget build(BuildContext context) => Column(children: [
        if (_questionAnswer.pointsGained > 0)
          Text('+ ${_questionAnswer.pointsGained} points',
              style: const TextStyle(fontSize: 16)),
        if (_questionAnswer is QuestionAnswerBonus &&
            _questionAnswer.bonusPointsGained > 0)
          Text('+ ${_questionAnswer.bonusPointsGained} points BONUS',
              style: const TextStyle(fontSize: 16, color: Colors.blue)),
      ]);
}
