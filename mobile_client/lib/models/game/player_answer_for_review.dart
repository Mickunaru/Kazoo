import 'package:mobile_client/constants/enum/question_type.dart';

class PlayerAnswerForReview {
  final String name;
  final String answer;
  final QuestionType questionType;

  PlayerAnswerForReview(
      {required this.name, required this.answer, required this.questionType});

  factory PlayerAnswerForReview.fromJson(Map<String, dynamic> json) {
    return PlayerAnswerForReview(
      questionType: QuestionType.fromString(json['questionType']),
      name: json['name'] as String,
      answer: json['answer'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'questionType': questionType.toJson(),
      'name': name,
      'answer': answer,
    };
  }
}
