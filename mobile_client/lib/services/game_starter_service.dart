import 'package:mobile_client/constants/enum/game_start_error_types.dart';
import 'package:mobile_client/constants/enum/game_visibility.dart';
import 'package:mobile_client/constants/errors/game_starter_error.dart';
import 'package:mobile_client/models/game_config_dto.dart';
import 'package:mobile_client/services/game/random_game_service.dart';
import 'package:mobile_client/services/game_library_service.dart';
import 'package:mobile_client/services/room_service.dart';
import 'package:mobile_client/services/websocket_service.dart';

class GameStarterService {
  final WebSocketService webSocketService;
  final RoomService roomService;
  final GameLibraryService gameLibraryService;
  final RandomGameService randomGameService;

  GameStarterService(
    this.webSocketService,
    this.roomService,
    this.gameLibraryService,
    this.randomGameService,
  );

  Future<void> startGame(GameConfigDto gameConfig) async {
    switch (gameConfig) {
      case RandomGameConfig():
        await verifyIfHasEnoughQuestions(gameConfig.questionCount);
      case BaseGameConfig():
        await verifyIfGameAvailable(gameConfig.gameId);
    }

    await roomService.createRoomAndJoin(gameConfig, webSocketService.id);
  }

  Future<void> verifyIfGameAvailable(String gameId) async {
    final visibility = await gameLibraryService.getGameVisibility(gameId);

    switch (visibility) {
      case GameVisibility.hidden:
        throw GameStartError(GameStartErrorTypes.hidden);
      case GameVisibility.deleted:
        throw GameStartError(GameStartErrorTypes.deleted);
      default:
        return;
    }
  }

  Future<void> verifyIfHasEnoughQuestions(int questionCount) async {
    final hasEnoughQuestions =
        await randomGameService.hasEnoughQuestionsForRandomGame(questionCount);

    if (!hasEnoughQuestions) {
      throw GameStartError(GameStartErrorTypes.notEnoughQuestions);
    }
  }
}
