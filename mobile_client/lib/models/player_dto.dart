class PlayerDto {
  final String username;
  final bool hasLeft;
  final String teamName;
  final String imageUrl;

  PlayerDto(
      {required this.username,
      required this.hasLeft,
      required this.teamName,
      required this.imageUrl});

  factory PlayerDto.fromJson(Map<String, dynamic> json) {
    return PlayerDto(
      username: json['username'] as String,
      hasLeft: json['hasLeft'] as bool,
      teamName: json['teamName'] as String,
      imageUrl: json['imageUrl'] as String,
    );
  }
}
