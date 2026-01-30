import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_client/constants/endpoint_constants.dart';
import 'package:mobile_client/constants/enum/game_mode.dart';
import 'package:mobile_client/constants/enum/game_start_error_types.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/constants/enum/room_access_status.dart';
import 'package:mobile_client/constants/errors/game_starter_error.dart';
import 'package:mobile_client/constants/socket_events/room_event.dart';
import 'package:mobile_client/models/environment.dart';
import 'package:mobile_client/models/game_config_dto.dart';
import 'package:mobile_client/models/join_configs.dart';
import 'package:mobile_client/services/websocket_service.dart';
import 'package:mobile_client/utils/app_navigator.dart';

class RoomService extends ChangeNotifier {
  String roomId = '';
  bool isGameMaster = false;
  bool isLocked = false;
  GameMode gameMode = GameMode.classic;
  String waitingRoomBaseUrl = '${Environment.apiBaseUrl}/$waitingRoomEndpoint';
  ValueNotifier<bool> isProcessing = ValueNotifier(false);
  bool arePowerUpsEnabled = false;

  final WebSocketService _webSocketService;

  RoomService(this._webSocketService);

  resetManager() {
    roomId = '';
    isGameMaster = false;
    isLocked = false;
    gameMode = GameMode.classic;
    isProcessing.value = false;
    arePowerUpsEnabled = false;
  }

  Future<RoomAccessStatus?> canPlayerJoinRoom(String roomId) async {
    final response =
        await _webSocketService.sendWithAck(RoomEvent.canJoinRoom.name, roomId);
    return RoomAccessStatus.values.firstWhere((e) => e.name == response);
  }

  Future<void> createRoomAndJoin(
      GameConfigDto gameConfig, String? socketId) async {
    if (socketId == null) {
      throw Exception('Creator Socket ID cannot be null');
    }

    final response = await http.post(Uri.parse(waitingRoomBaseUrl),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(
            {"gameConfig": gameConfig.toJson(), "creatorId": socketId}));

    if (response.statusCode == 201) {
      isGameMaster = true;
      gameMode = gameConfig.gameMode;
      roomId = jsonDecode(response.body)["roomId"];
      await _setupAndJoin();
    } else if (response.statusCode == 400 &&
        jsonDecode(response.body)['message'] ==
            "Organizer does not have enough money") {
      throw GameStartError(GameStartErrorTypes.notEnoughMoney);
    } else {
      throw Exception("Failed to create room: ${response.body}");
    }
  }

  Future<void> playerJoinRoom(String roomId) async {
    this.roomId = roomId;
    isGameMaster = false;

    await _setupAndJoin();
  }

  navigateToGamePage() {
    if (isGameMaster && gameMode != GameMode.elimination) {
      AppNavigator.go('/${PageUrl.gameMaster.name}');
    } else {
      AppNavigator.go('/${PageUrl.game.name}');
    }
  }

  Future<void> _setupAndJoin() async {
    isLocked = false;
    if (!_webSocketService.isSocketConnected()) return;

    final data = await _webSocketService.sendWithAck<String, dynamic>(
        RoomEvent.joinRoom.name, roomId);
    arePowerUpsEnabled = JoinConfigs.fromJson(data).arePowerUpsEnabled;
    gameMode = JoinConfigs.fromJson(data).gameMode;
    AppNavigator.go('/${PageUrl.waitingRoom.name}');
  }
}
