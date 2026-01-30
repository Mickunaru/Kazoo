import 'package:mobile_client/constants/enum/question_type.dart';
import 'package:mobile_client/constants/socket_events/game_event.dart';
import 'package:mobile_client/services/game/game_state_service.dart';
import 'package:mobile_client/services/websocket_service.dart';
import 'package:mobile_client/widgets/snackbar.dart';

class PlayerReviewSnackbarService {
  final GameStateService _gameStateService;
  final WebSocketService _webSocketService;

  PlayerReviewSnackbarService(
    this._gameStateService,
    this._webSocketService,
  );

  void setupListener() {
    _webSocketService.on(GameEvent.reviewInProgress.name, (_) {
      final isReviewType =
          _gameStateService.currentQuestion.value?.type != null &&
              (_gameStateService.currentQuestion.value!.type ==
                      QuestionType.openEnded ||
                  _gameStateService.currentQuestion.value!.type ==
                      QuestionType.drawing);
      if (isReviewType) {
        showCustomGlobalSnackBar(message: "Correction en cours...");
      }
    });
  }

  void removeListener() {
    _webSocketService.removeAllListeners(GameEvent.reviewInProgress.name);
  }
}
