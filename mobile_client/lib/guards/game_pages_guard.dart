import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/services/game/game_manager_service.dart';
import 'package:mobile_client/services/game/timer_service.dart';
import 'package:mobile_client/services/power_up_service.dart';
import 'package:mobile_client/services/room_service.dart';
import 'package:mobile_client/services/team_service.dart';
import 'package:mobile_client/services/websocket_service.dart';

class GamePagesGuard extends NavigatorObserver {
  final WebSocketService _webSocketService;
  final TimerService _timerService;
  final GameManagerService _gameManagerService;
  final RoomService _roomService;
  final PowerUpService _powerUpService;
  final TeamService _teamService;

  static const List<PageUrl> _roomUrls = [
    PageUrl.results,
    PageUrl.waitingRoom,
    PageUrl.game,
    PageUrl.gameMaster
  ];
  static List<String> loggedOutUrls = [
    (PageUrl.login.name),
    (PageUrl.signup.name),
    '',
  ];

  GamePagesGuard(
      this._webSocketService,
      this._timerService,
      this._gameManagerService,
      this._powerUpService,
      this._roomService,
      this._teamService);

  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPush(route, previousRoute);
    _topPageChanged(route.settings.name, previousRoute?.settings.name);
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPop(route, previousRoute);
    _topPageChanged(route.settings.name, previousRoute?.settings.name);
  }

  void resetManagerOnLogOut(String? fullpath) {
    final currentEndpoint = fullpath?.split('/').lastOrNull;
    final entersLogedOutPages =
        loggedOutUrls.any((endpoint) => currentEndpoint == endpoint);
    if (entersLogedOutPages) {
      debugPrint('DEBUG:: Disconnect Client from $currentEndpoint');
      _leaveGamePages();
    }
  }

  _topPageChanged(String? route, String? previousRoute) {
    if (route == null || previousRoute == null) {
      debugPrint('Probably a PopUp (from $previousRoute to $route) ??? ');
      return;
    }

    final currentEndpoint = route.split('/').lastOrNull;
    final previousEndpoint = previousRoute.split('/').lastOrNull;

    final wasInGameRoom =
        _roomUrls.any((endpoint) => previousEndpoint == endpoint.name);
    final isInGameRoom =
        _roomUrls.any((endPoint) => currentEndpoint == endPoint.name);

    final leftGameRoom = !isInGameRoom && wasInGameRoom;
    final enterGameRoom = isInGameRoom && !wasInGameRoom;
    if (leftGameRoom) {
      debugPrint('DEBUG:: Disconnect Client from $previousRoute to $route');
      _leaveGamePages();
    }

    if (enterGameRoom && _webSocketService.isSocketConnected()) {
      debugPrint('DEBUG:: Client Join Room from $previousRoute to $route');
      _enterGamePages();
    }
  }

  void _leaveGamePages() {
    _timerService.removeTimerListeners();
    _gameManagerService.resetManager();
    _roomService.resetManager();
    _powerUpService.removeListeners();
    _teamService.resetManager();
  }

  void _enterGamePages() {
    _timerService.setTimerListeners();
    _gameManagerService.setupManager();
    _powerUpService.setupManager();
  }
}
