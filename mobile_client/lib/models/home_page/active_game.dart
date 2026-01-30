import 'package:mobile_client/constants/enum/room_state.dart';
import 'package:mobile_client/models/game_config_dto.dart';

class ActiveGame {
  final String roomId;
  final String gameTitle;
  final GameConfigDto gameConfig;
  RoomState roomState;
  int playerCount;

  ActiveGame({
    required this.roomId,
    required this.gameTitle,
    required this.gameConfig,
    required this.roomState,
    required this.playerCount,
  });

  factory ActiveGame.fromJson(Map<String, dynamic> json) {
    return ActiveGame(
      roomId: json['roomId'],
      gameTitle: json['gameTitle'],
      gameConfig: GameConfigDto.fromJson(json['gameConfig']),
      roomState: RoomState.fromJson(json['roomState']),
      playerCount: json['playerCount'],
    );
  }
}
