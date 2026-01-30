import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:mobile_client/constants/power_ups_constants.dart';
import 'package:mobile_client/constants/socket_events/game_event.dart';
import 'package:mobile_client/models/multi_choice.dart';
import 'package:mobile_client/models/power_up.dart';
import 'package:mobile_client/services/game/game_state_service.dart';
import 'package:mobile_client/services/websocket_service.dart';
import 'package:mobile_client/shop/enum/power_up_type.dart';
import 'package:rxdart/rxdart.dart';

enum SurgePopupEvent {
  generate,
  clear,
}

class PowerUpService {
  final WebSocketService _webSocketService;
  final GameStateService _gameStateService;
  String? selectedPowerUp;
  final ValueNotifier<bool> hasSelectedPowerUp = ValueNotifier<bool>(false);
  final ValueNotifier<Set<PowerUpType>> currentPowerUps =
      ValueNotifier<Set<PowerUpType>>({});
  ValueNotifier<List<MultiChoice>> confusionQuestionChoices = ValueNotifier([]);

  List<String> cheatingContent = [];
  final ValueNotifier<List<int>> tornadoShuffledIndexes = ValueNotifier([]);
  Timer? _tornadoTimer;
  List<Offset> surgePopups = [];

  final _cheatingPowerUpActivated = PublishSubject<void>();

  final StreamController<SurgePopupEvent> _surgePopupStream =
      StreamController.broadcast();
  Stream<SurgePopupEvent> get surgePopupStream => _surgePopupStream.stream;

  PowerUpService(this._webSocketService, this._gameStateService);

  void setupManager() {
    _listenForPowerUps();
    _listenForReset();
  }

  void removeListeners() {
    _webSocketService.removeAllListeners(GameEvent.activatePowerUp.name);
    _webSocketService.removeAllListeners(GameEvent.resetPowerUp.name);
    resetPowerUps();
  }

  void resetPowerUps() {
    selectedPowerUp = null;
    hasSelectedPowerUp.value = false;
    currentPowerUps.value.clear();
    confusionQuestionChoices.value = [];
    clearSurge();
    cheatingContent = [];
    tornadoShuffledIndexes.value = [];
    _tornadoTimer?.cancel();
  }

  ValueNotifier<bool> get disablePowerUps => hasSelectedPowerUp;

  Future<String> requestPowerUp(PowerUpType powerUpName) async {
    String message = await _webSocketService.sendWithAck(
        GameEvent.activatePowerUp.name, powerUpName.name);

    if (message == successMessage) {
      selectedPowerUp = powerUpName.name;
      hasSelectedPowerUp.value = true;
    }

    return message;
  }

  void _activatePowerUp(PowerUp powerUp) {
    switch (powerUp.name) {
      case PowerUpType.tricheur:
        if (powerUp.content.isEmpty) return;
        cheatingContent = powerUp.content;
        _cheatingPowerUpActivated.add(null);
        break;
      case PowerUpType.confusion:
        _applyConfusionPowerUp();
        break;
      case PowerUpType.surge:
        _triggerSurgePowerUp();
        break;
      case PowerUpType.tornade:
        _triggerTornadoPowerUp();
        break;
      default:
        break;
    }
  }

  void _applyConfusionPowerUp() {
    final currentQuestion = _gameStateService.currentQuestion.value;
    if (currentQuestion == null) return;

    _gameStateService.currentQuestion.value?.text =
        _replaceLettersWithRectangles(currentQuestion.text);

    confusionQuestionChoices.value = currentQuestion.choices
        .map((choice) => MultiChoice(
              isCorrect: choice.isCorrect,
              text: _replaceLettersWithRectangles(choice.text),
            ))
        .toList();
  }

  String _replaceLettersWithRectangles(String text) {
    return text
        .split('')
        .asMap()
        .entries
        .map((entry) => entry.key % 2 == 1 ? '■' : entry.value)
        .join('');
  }

  void _triggerTornadoPowerUp() {
    tornadoShuffledIndexes.value = List<int>.generate(
        _gameStateService.currentQuestion.value?.choices.length ?? 0, (i) => i);

    void shuffleLoop() {
      final choicesLength =
          _gameStateService.currentQuestion.value?.choices.length ?? 0;
      final shuffled = List<int>.generate(choicesLength, (i) => i);
      _shuffle(shuffled);
      tornadoShuffledIndexes.value = [...shuffled]; // trigger rebuild
      _tornadoTimer = Timer(
        Duration(milliseconds: 1000 + Random().nextInt(1000)),
        shuffleLoop,
      );
    }

    shuffleLoop();
  }

  void _shuffle(List<int> list) {
    for (var i = list.length - 1; i > 0; i--) {
      final j = Random().nextInt(i + 1);
      final tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
  }

  void _triggerSurgePowerUp() {
    _surgePopupStream.add(SurgePopupEvent.generate);
  }

  void clearSurge() {
    surgePopups.clear();
    _surgePopupStream.add(SurgePopupEvent.clear);
  }

  void _listenForPowerUps() {
    _webSocketService.on<Map<String, dynamic>?>(GameEvent.activatePowerUp.name,
        (powerUp) {
      if (powerUp == null) return;
      final powerUpObj = PowerUp.fromJson(powerUp);

      if (!currentPowerUps.value.contains(powerUpObj.name)) {
        currentPowerUps.value.add(powerUpObj.name);
        _activatePowerUp(powerUpObj);
      }
    });
  }

  void _listenForReset() {
    _webSocketService.on(GameEvent.resetPowerUp.name, (_) {
      resetPowerUps();
    });
  }

  Stream<void> get cheatingPowerUpActivated$ =>
      _cheatingPowerUpActivated.stream;
}
