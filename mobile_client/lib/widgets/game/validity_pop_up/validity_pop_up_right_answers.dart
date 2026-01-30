import 'package:flutter/material.dart';

class ValidityPopUpRightAnswers extends StatelessWidget {
  const ValidityPopUpRightAnswers({super.key, required this.answers});
  final List<String> answers;

  @override
  Widget build(BuildContext context) => Column(spacing: 5, children: [
        Text(
            answers.length <= 1
                ? 'La bonne réponse est:'
                : 'Les bonnes réponses sont:',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        for (var answer in answers)
          Text(answer, style: const TextStyle(fontSize: 16)),
      ]);
}
