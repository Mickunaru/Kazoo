class MessageException implements Exception {
  final String message;
  MessageException(this.message);

  @override
  String toString() {
    return message;
  }
}
