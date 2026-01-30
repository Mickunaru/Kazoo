import 'package:mobile_client/models/question.dart';

class Game {
  final String id;
  final String title;
  final String description;
  final int duration;
  final DateTime lastModification;
  final List<Question> questions;
  final bool isHidden;

  Game(
      {required this.id,
      required this.title,
      required this.description,
      required this.duration,
      required this.lastModification,
      required this.questions,
      required this.isHidden});

  factory Game.fromJson(Map<String, dynamic> json) {
    return Game(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      duration: json['duration'],
      lastModification: DateTime.parse(json['lastModification']),
      questions:
          (json['questions'] as List).map((q) => Question.fromJson(q)).toList(),
      isHidden: json['isHidden'],
    );
  }
}
