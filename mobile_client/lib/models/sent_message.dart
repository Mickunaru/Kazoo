class SentMessage {
  final String room;
  final String text;
  final String author;

  SentMessage({required this.room, required this.text, required this.author});

  Map<String, dynamic> toMap() {
    return {
      'room': room,
      'text': text,
      'author': author,
    };
  }
}
