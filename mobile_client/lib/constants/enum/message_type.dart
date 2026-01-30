enum MessageType {
  text("TEXT"),
  sound("SOUND");

  const MessageType(this.name);
  final String name;

  static MessageType fromName(String name) {
    return MessageType.values.firstWhere(
      (type) => type.name == name,
      orElse: () => throw ArgumentError('Invalid MessageType name: $name'),
    );
  }
}
