class PlayerPrize {
  final int gamePrize;
  final int potPrize;

  PlayerPrize({
    required this.gamePrize,
    required this.potPrize,
  });

  factory PlayerPrize.fromJson(Map<String, dynamic> json) {
    return PlayerPrize(
      gamePrize: (json['gamePrize'] as int).toInt(),
      potPrize: (json['potPrize'] as int).toInt(),
    );
  }
}
