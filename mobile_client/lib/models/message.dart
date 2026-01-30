import 'package:mobile_client/constants/enum/message_type.dart';

class Message {
  final String room;
  final String author;
  final String text;
  final DateTime date;
  final MessageType type;
  final double? duration;
  final String avatar;

  Message(
      {required this.room,
      required this.author,
      required this.text,
      required this.date,
      required this.type,
      this.duration,
      required this.avatar});

  Map<String, dynamic> toJson() {
    return {
      "room": room,
      "author": author,
      "text": text,
      "date": date.toUtc().toIso8601String(),
      "type": type.name,
      "duration": duration,
      "avatar": avatar,
    };
  }

  factory Message.fromJson(Map<String, dynamic> map) {
    return Message(
        room: map['room'] as String,
        author: map['author'] as String,
        text: map['text'] as String,
        date: DateTime.parse(map['date'] as String).toLocal(),
        type: MessageType.fromName(map['type']),
        duration: map['duration'] != null
            ? (map['duration'] as num).toDouble()
            : null,
        avatar: map['avatar']);
  }

  @override
  String toString() {
    return 'Message(room: $room, author: $author, text: $text, date: $date, type: $type, duration: $duration, avatar: $avatar)';
  }
}
