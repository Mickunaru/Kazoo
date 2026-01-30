import 'package:mobile_client/constants/enum/game_start_error_types.dart';

class GameStartError implements Exception {
  final GameStartErrorTypes type;
  GameStartError(this.type);
}
