import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/constants/player_banned_message.dart';
import 'package:mobile_client/constants/snack_bar_constants.dart';
import 'package:mobile_client/constants/socket_events/room_event.dart';
import 'package:mobile_client/models/player_dto.dart';
import 'package:mobile_client/services/websocket_service.dart';
import 'package:mobile_client/utils/app_navigator.dart';

class ParticipantService with ChangeNotifier {
  final WebSocketService webSocketService;
  List<PlayerDto> participants = [];

  ParticipantService(this.webSocketService);

  void initializeParticipants(BuildContext context) {
    setupParticipantsListListener();
    setupParticipantsBanListener(
        context); // TODO: this is not needed for organizer
    updateParticipants();
  }

  removeParticipantsListener() {
    webSocketService.removeAllListeners(RoomEvent.updateParticipantList.name);
    webSocketService.removeAllListeners(RoomEvent.ban.name);
  }

  void removeParticipant(String playerName) {
    webSocketService.send(RoomEvent.ban.name, playerName);
  }

  void clearParticipants() {
    participants.clear();
  }

  void updateParticipants() {
    webSocketService.send(RoomEvent.updateParticipantList.name);
  }

  void setupParticipantsListListener() {
    webSocketService.on<List<dynamic>>(RoomEvent.updateParticipantList.name,
        (data) {
      participants = data.map((item) => PlayerDto.fromJson(item)).toList();
      notifyListeners();
    });
  }

  void setupParticipantsBanListener(BuildContext context) {
    webSocketService.on(RoomEvent.ban.name, (_) {
      AppNavigator.go('/${PageUrl.home.name}');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text(playerBannedMessage),
          duration: Duration(seconds: 3),
          behavior: SnackBarBehavior.floating,
          action: SnackBarAction(
            label: snackCloseIconAction,
            onPressed: () {},
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(4)),
          ),
          width: 300,
        ),
      );
    });
  }
}
