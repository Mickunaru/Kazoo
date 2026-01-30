import 'package:mobile_client/constants/enum/question_type.dart';
import 'package:mobile_client/models/multi_choice.dart';

class Question {
  final QuestionType type;
  String text;
  final int points;
  final List<MultiChoice> choices;
  final String? id;
  final DateTime lastModification;
  final String imageUrl;

  final int lowerBound;
  final int upperBound;
  final int precision;
  final int answer;

  Question({
    required this.type,
    required this.text,
    required this.points,
    required this.choices,
    this.id,
    required this.lastModification,
    required this.lowerBound,
    required this.upperBound,
    required this.precision,
    required this.answer,
    required this.imageUrl,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      type: QuestionType.fromString(json['type']),
      text: json['text'],
      points: json['points'],
      choices: (json['choices'] as List)
          .map((q) => MultiChoice.fromJson(q))
          .toList(),
      id: json['id'],
      lastModification: DateTime.parse(json['lastModification']),
      lowerBound: json['lowerBound'] ?? 0,
      upperBound: json['upperBound'] ?? 0,
      precision: json['precision'] ?? 0,
      answer: json['answer'] ?? 0,
      imageUrl: json['imageUrl'] ?? '',
    );
  }

  Question copyWith({
    QuestionType? type,
    String? text,
    int? points,
    List<MultiChoice>? choices,
    String? id,
    DateTime? lastModification,
    int? lowerBound,
    int? upperBound,
    int? precision,
    int? answer,
    String? imageUrl,
  }) {
    return Question(
      type: type ?? this.type,
      text: text ?? this.text,
      points: points ?? this.points,
      choices: choices ?? this.choices,
      id: id ?? this.id,
      lastModification: lastModification ?? this.lastModification,
      lowerBound: lowerBound ?? this.lowerBound,
      upperBound: upperBound ?? this.upperBound,
      precision: precision ?? this.precision,
      answer: answer ?? this.answer,
      imageUrl: imageUrl ?? this.imageUrl,
    );
  }
}
