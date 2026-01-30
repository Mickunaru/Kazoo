import 'package:flutter/widgets.dart';
import 'package:mobile_client/constants/socket_events/auth_event.dart';
import 'package:mobile_client/services/user_auth_service.dart';
import 'package:mobile_client/services/websocket_service.dart';

class LifecycleService with WidgetsBindingObserver {
  final WebSocketService _webSocketService;
  final UserAuthService _userAuthService;

  LifecycleService(this._webSocketService, this._userAuthService);

  void init() {
    WidgetsBinding.instance.addObserver(this);
  }

  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      if (_userAuthService.curUser != null) {
        _webSocketService.send(AuthEvent.userLogin.name, {
          'username': _userAuthService.curUser!.username,
          'uid': _userAuthService.curUser!.uid,
          'imageUrl': _userAuthService.curUser!.avatar,
        });
      }
    }
  }
}
