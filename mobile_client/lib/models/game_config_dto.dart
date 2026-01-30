import 'package:mobile_client/constants/enum/game_mode.dart';

sealed class GameConfigDto {
  final bool isFriendsOnly;
  final bool arePowerUpsEnabled;
  final bool hasSoundboard;
  final int entryPrice;
  final GameMode gameMode;

  const GameConfigDto({
    required this.isFriendsOnly,
    required this.arePowerUpsEnabled,
    required this.hasSoundboard,
    required this.entryPrice,
    required this.gameMode,
  });

  factory GameConfigDto.fromJson(Map<String, dynamic> json) =>
      switch (GameMode.fromJson(json['gameMode'])) {
        GameMode.elimination => RandomGameConfig.fromJson(json),
        GameMode.classic || GameMode.team => BaseGameConfig.fromJson(json),
      };

  Map<String, dynamic> toJson();
}

class RandomGameConfig extends GameConfigDto {
  final int questionCount;
  final String? gameId = null;

  RandomGameConfig(
      {required super.isFriendsOnly,
      required super.arePowerUpsEnabled,
      required super.hasSoundboard,
      required super.entryPrice,
      required super.gameMode,
      required this.questionCount,
      String? gameId});

  factory RandomGameConfig.fromJson(Map<String, dynamic> json) {
    return RandomGameConfig(
      isFriendsOnly: json['isFriendsOnly'],
      arePowerUpsEnabled: json['arePowerUpsEnabled'],
      hasSoundboard: json['hasSoundboard'],
      entryPrice: json['entryPrice'],
      gameMode: GameMode.fromJson(json['gameMode']),
      questionCount: json['questionCount'],
      gameId: json['gameId'],
    );
  }

  @override
  Map<String, dynamic> toJson() => {
        'isFriendsOnly': isFriendsOnly,
        'arePowerUpsEnabled': arePowerUpsEnabled,
        'hasSoundboard': hasSoundboard,
        'entryPrice': entryPrice,
        'gameMode': gameMode.toJson(),
        'questionCount': questionCount,
        'gameId': null,
      };
}

class BaseGameConfig extends GameConfigDto {
  final String gameId;

  BaseGameConfig({
    required super.isFriendsOnly,
    required super.arePowerUpsEnabled,
    required super.hasSoundboard,
    required super.entryPrice,
    required super.gameMode,
    required this.gameId,
  });

  factory BaseGameConfig.fromJson(Map<String, dynamic> json) {
    return BaseGameConfig(
      isFriendsOnly: json['isFriendsOnly'],
      arePowerUpsEnabled: json['arePowerUpsEnabled'],
      hasSoundboard: json['hasSoundboard'],
      entryPrice: json['entryPrice'],
      gameMode: GameMode.fromJson(json['gameMode']),
      gameId: json['gameId'],
    );
  }

  @override
  Map<String, dynamic> toJson() => {
        'isFriendsOnly': isFriendsOnly,
        'arePowerUpsEnabled': arePowerUpsEnabled,
        'hasSoundboard': hasSoundboard,
        'entryPrice': entryPrice,
        'gameMode': gameMode.toJson(),
        'gameId': gameId,
      };
}
