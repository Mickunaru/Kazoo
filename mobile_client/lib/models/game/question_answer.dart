import 'package:mobile_client/constants/enum/question_type.dart';

abstract class BaseQuestionAnswer {
  final int pointsGained;
  final int score;

  BaseQuestionAnswer({required this.pointsGained, required this.score});

  factory BaseQuestionAnswer.fromJson(Map<String, dynamic> json) {
    final questionType = QuestionType.fromString(json['questionType']);
    switch (questionType) {
      case QuestionType.multiChoice:
        return MultiChoiceAnswer.fromJson(json);
      case QuestionType.openEnded:
        return OpenEndedAnswer.fromJson(json);
      case QuestionType.estimation:
        return EstimationAnswer.fromJson(json);
      case QuestionType.drawing:
        return DrawingAnswer.fromJson(json);
    }
  }
}

mixin QuestionAnswerBonus on BaseQuestionAnswer {
  int get bonusPointsGained;
  List<String> get answers;
}

class MultiChoiceAnswer extends BaseQuestionAnswer with QuestionAnswerBonus {
  @override
  final int bonusPointsGained;
  @override
  final List<String> answers;
  final QuestionType questionType = QuestionType.multiChoice;

  MultiChoiceAnswer({
    required super.pointsGained,
    required super.score,
    required this.bonusPointsGained,
    required this.answers,
  });

  factory MultiChoiceAnswer.fromJson(Map<String, dynamic> json) {
    return MultiChoiceAnswer(
      pointsGained: json['pointsGained'],
      score: json['score'],
      bonusPointsGained: json['bonusPointsGained'],
      answers: List<String>.from(json['answers']),
    );
  }
}

class OpenEndedAnswer extends BaseQuestionAnswer {
  final QuestionType questionType = QuestionType.openEnded;
  final double percentageGiven;

  OpenEndedAnswer(
      {required super.pointsGained,
      required super.score,
      required this.percentageGiven});

  factory OpenEndedAnswer.fromJson(Map<String, dynamic> json) {
    return OpenEndedAnswer(
      pointsGained: json['pointsGained'],
      score: json['score'],
      percentageGiven: (json['percentageGiven'] as num).toDouble(),
    );
  }
}

class EstimationAnswer extends BaseQuestionAnswer with QuestionAnswerBonus {
  @override
  final int bonusPointsGained;
  @override
  final List<String> answers;
  final QuestionType questionType = QuestionType.estimation;

  EstimationAnswer({
    required super.pointsGained,
    required super.score,
    required this.bonusPointsGained,
    required this.answers,
  });

  factory EstimationAnswer.fromJson(Map<String, dynamic> json) {
    return EstimationAnswer(
      pointsGained: json['pointsGained'],
      score: json['score'],
      bonusPointsGained: json['bonusPointsGained'],
      answers: List<String>.from(json['answers']),
    );
  }
}

class DrawingAnswer extends BaseQuestionAnswer {
  final QuestionType questionType = QuestionType.drawing;
  final double percentageGiven;

  DrawingAnswer(
      {required super.pointsGained,
      required super.score,
      required this.percentageGiven});

  factory DrawingAnswer.fromJson(Map<String, dynamic> json) {
    return DrawingAnswer(
      pointsGained: json['pointsGained'],
      score: json['score'],
      percentageGiven: (json['percentageGiven'] as num).toDouble(),
    );
  }
}

typedef QuestionAnswer = BaseQuestionAnswer;
