import 'package:mobile_client/constants/enum/question_type.dart';

abstract class PlayerAnswer {
  final QuestionType questionType;
  PlayerAnswer(this.questionType);

  Map<String, dynamic> toJson();
}

class MultiChoicePlayerAnswer extends PlayerAnswer {
  final List<bool> data;

  MultiChoicePlayerAnswer({required this.data})
      : super(QuestionType.multiChoice);

  @override
  Map<String, dynamic> toJson() {
    return {
      'questionType': questionType.toJson(),
      'data': data,
    };
  }
}

class OpenEndedPlayerAnswer extends PlayerAnswer {
  final String data;

  OpenEndedPlayerAnswer({required this.data}) : super(QuestionType.openEnded);

  @override
  Map<String, dynamic> toJson() {
    return {
      'questionType': questionType.toJson(),
      'data': data,
    };
  }
}

class EstimationPlayerAnswer extends PlayerAnswer {
  final int data;

  EstimationPlayerAnswer({required this.data}) : super(QuestionType.estimation);

  @override
  Map<String, dynamic> toJson() {
    return {
      'questionType': questionType.toJson(),
      'data': data,
    };
  }
}

class DrawingPlayerAnswer extends PlayerAnswer {
  final String data;

  DrawingPlayerAnswer({required this.data}) : super(QuestionType.drawing);

  @override
  Map<String, dynamic> toJson() {
    return {
      'questionType': questionType.toJson(),
      'data': data,
    };
  }
}
