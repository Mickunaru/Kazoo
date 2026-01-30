class NewPlayerCount {
  final String roomId;
  final int playerCount;

  const NewPlayerCount({
    required this.roomId,
    required this.playerCount,
  });

  factory NewPlayerCount.fromJson(Map<String, dynamic> json) {
    return NewPlayerCount(
      roomId: json['roomId'],
      playerCount: json['playerCount'],
    );
  }
}
