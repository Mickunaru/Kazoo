import 'package:mobile_client/constants/enum/game_mode.dart';

class JoinConfigs {
  final GameMode gameMode;
  final bool arePowerUpsEnabled;

  JoinConfigs({required this.gameMode, required this.arePowerUpsEnabled});

  Map<String, dynamic> toJson() {
    return {
      "gameMode": gameMode.name,
      "arePowerUpsEnabled": arePowerUpsEnabled,
    };
  }

  factory JoinConfigs.fromJson(Map<String, dynamic> map) {
    return JoinConfigs(
        gameMode: GameMode.values.firstWhere((e) => e.name == map['gameMode']),
        arePowerUpsEnabled: map['arePowerUpsEnabled'] as bool);
  }
}
