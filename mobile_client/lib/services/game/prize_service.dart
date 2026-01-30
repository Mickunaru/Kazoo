import 'package:flutter/foundation.dart';
import 'package:mobile_client/constants/socket_events/game_event.dart';
import 'package:mobile_client/models/game/player_prize.dart';
import 'package:mobile_client/services/websocket_service.dart';

class PrizeService extends ChangeNotifier {
  PrizeService(this.webSocketService);

  int gamePrize = 0;
  int potPrize = 0;

  final WebSocketService webSocketService;

  void initialize() {
    webSocketService.on<Map<String, dynamic>>(GameEvent.moneyPrize.name,
        (data) {
      final prize = PlayerPrize.fromJson(data);
      gamePrize = prize.gamePrize;
      potPrize = prize.potPrize;
      notifyListeners();
    });
  }

  void removeListeners() {
    webSocketService.removeAllListeners(GameEvent.moneyPrize.name);
    gamePrize = 0;
    potPrize = 0;
    notifyListeners();
  }
}
