import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/constants/enum/room_destruction_reason.dart';
import 'package:mobile_client/constants/socket_events/game_event.dart';
import 'package:mobile_client/constants/socket_events/room_event.dart';
import 'package:mobile_client/globals.dart';
import 'package:mobile_client/models/player_info.dart';
import 'package:mobile_client/models/question.dart';
import 'package:mobile_client/services/game/game_state_service.dart';
import 'package:mobile_client/services/game/prize_service.dart';
import 'package:mobile_client/services/game/review_manager_service.dart';
import 'package:mobile_client/services/game/submit_manager_service.dart';
import 'package:mobile_client/services/websocket_service.dart';
import 'package:mobile_client/utils/app_navigator.dart';
import 'package:mobile_client/widgets/snackbar.dart';

class GameManagerService {
  final GameStateService _gameStateService;
  final WebSocketService _webSocketService;
  final SubmitManagerService _submitManagerService;
  final ReviewManagerService _reviewManager;
  final PrizeService _prizeService;

  GameManagerService(
    this._gameStateService,
    this._webSocketService,
    this._submitManagerService,
    this._reviewManager,
    this._prizeService,
  );

  Future<void> submitAnswer() async {
    if (_gameStateService.isSubmitted.value ||
        _gameStateService.isEliminated.value) {
      return;
    }
    _gameStateService.submit();
    final playerAnswer =
        await _submitManagerService.getAnswer(_gameStateService.questionType);
    _webSocketService.send(GameEvent.submitAnswer.name, playerAnswer);
  }

  void setupManager() {
    _setupDisconnectClientsEvent();
    _setupMoveToNextQuestionEvent();
    _setGameFinishedEvent();
    _setupEliminatedPlayer();
    _reviewManager.setupManager();
    _prizeService.initialize();
  }

  void resetManager() {
    _gameStateService.resetGameState();
    _reviewManager.resetReviewManager();
    _prizeService.removeListeners();
    _removeManagerListeners();

    if (_webSocketService.isSocketConnected()) {
      _webSocketService.send(RoomEvent.leaveGame.name);
    }
  }

  void _removeManagerListeners() {
    _webSocketService.removeAllListeners(GameEvent.nextQuestion.name);
    _webSocketService.removeAllListeners(GameEvent.playerEliminated.name);
    _webSocketService.removeAllListeners(GameEvent.gameFinished.name);
    _webSocketService.removeAllListeners(RoomEvent.leaveGame.name);
  }

  void _setupMoveToNextQuestionEvent() {
    _webSocketService.on<Map<String, dynamic>?>(GameEvent.nextQuestion.name,
        (json) {
      if (json == null) return;
      final question = Question.fromJson(json);
      _gameStateService.changeQuestion(question);
      _submitManagerService.setInputs(question);
    });
  }

  void _setGameFinishedEvent() {
    _webSocketService.once<List<dynamic>>(GameEvent.gameFinished.name, (data) {
      final playerInfos =
          data?.map((item) => PlayerInfo.fromJson(item)).toList();
      _gameStateService.playerInfos = playerInfos ?? [];
      AppNavigator.go('/${PageUrl.results.name}');
    });
  }

  void _setupEliminatedPlayer() {
    _webSocketService.once(GameEvent.playerEliminated.name, (_) {
      _gameStateService.isEliminated.value = true;
      if (snackbarKey.currentContext is BuildContext &&
          snackbarKey.currentContext!.mounted) {
        showCustomSnackBar(
            context: snackbarKey.currentContext!,
            message: 'Vous avez été éliminé de la partie');
      }
    });
  }

  void _setupDisconnectClientsEvent() {
    _webSocketService.once<dynamic>(RoomEvent.leaveGame.name, (data) {
      final roomDestructionReason = RoomDestructionReason.fromJson(data);
      switch (roomDestructionReason) {
        case RoomDestructionReason.allPlayerLeft:
          showCustomGlobalSnackBar(
              message: 'Tous les joueurs ont quitté la partie');
          break;
        case RoomDestructionReason.organizerLeft:
          showCustomGlobalSnackBar(
              message: "L'organisateur a quitté ou a mis fin à la partie");
        default:
          break;
      }
      AppNavigator.go('/${PageUrl.home.name}');
    });
  }
}
