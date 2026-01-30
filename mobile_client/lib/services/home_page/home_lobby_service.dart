import 'package:collection/collection.dart';
import 'package:flutter/foundation.dart';
import 'package:mobile_client/constants/socket_events/home_event.dart';
import 'package:mobile_client/models/home_page/active_game.dart';
import 'package:mobile_client/models/home_page/new_player_count.dart';
import 'package:mobile_client/models/home_page/new_room_state.dart';
import 'package:mobile_client/services/websocket_service.dart';

class HomeLobbyService extends ChangeNotifier {
  List<ActiveGame> activeGames = [];

  final WebSocketService _webSocketService;
  HomeLobbyService(this._webSocketService);

  void joinHomeLobby() {
    activeGames = [];
    _setupUpdateGameListListener();
    _setupPlayerCountListener();
    _setupRemoveGameListener();
    _setupUpdateRoomStateListener();

    _webSocketService.send(HomeEvent.joinHomeLobby.name);
  }

  void leaveHomeLobby() {
    _webSocketService.removeAllListeners(HomeEvent.updateGameList.name);
    _webSocketService.removeAllListeners(HomeEvent.updatePlayerCount.name);
    _webSocketService.removeAllListeners(HomeEvent.updateRoomState.name);
    _webSocketService.removeAllListeners(HomeEvent.removeGame.name);
    _webSocketService.send(HomeEvent.leaveHomeLobby.name);
    activeGames = [];
    notifyListeners();
  }

  void _setupUpdateGameListListener() {
    _webSocketService.on<List<dynamic>>(HomeEvent.updateGameList.name,
        (newActiveGames) {
      activeGames = [
        ...activeGames,
        ...newActiveGames.map((a) => ActiveGame.fromJson(a))
      ];
      notifyListeners();
    });
  }

  void _setupPlayerCountListener() {
    _webSocketService.on<Map<String, dynamic>>(HomeEvent.updatePlayerCount.name,
        (json) {
      final playerCountChange = NewPlayerCount.fromJson(json);
      var changedGame = activeGames.firstWhereOrNull(
          (activeGame) => activeGame.roomId == playerCountChange.roomId);
      if (changedGame == null) return;

      changedGame.playerCount += playerCountChange.playerCount;
      notifyListeners();
    });
  }

  void _setupRemoveGameListener() {
    _webSocketService.on<String>(HomeEvent.removeGame.name, (roomId) {
      activeGames = activeGames
          .where((activeGame) => activeGame.roomId != roomId)
          .toList();
      notifyListeners();
    });
  }

  void _setupUpdateRoomStateListener() {
    _webSocketService.on<Map<String, dynamic>>(HomeEvent.updateRoomState.name,
        (json) {
      final newRoomState = NewRoomState.fromJson(json);

      var changedGame = activeGames.firstWhereOrNull(
          (activeGame) => activeGame.roomId == newRoomState.roomId);
      if (changedGame == null) return;

      changedGame.roomState = newRoomState.roomState;
      notifyListeners();
    });
  }
}
