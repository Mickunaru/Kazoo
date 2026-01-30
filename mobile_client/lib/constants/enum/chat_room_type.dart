enum ChatRoomType {
  general("GENERAL"),
  gameRoom("GAME_ROOM"),
  teamRoom("TEAM_ROOM"),
  custom("CUSTOM");

  const ChatRoomType(this.name);
  final String name;

  static ChatRoomType fromName(String name) {
    return ChatRoomType.values.firstWhere(
      (type) => type.name == name,
      orElse: () => throw ArgumentError('Invalid ChatRoomType name: $name'),
    );
  }
}
