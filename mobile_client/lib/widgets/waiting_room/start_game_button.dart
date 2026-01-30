import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/start_game_status.dart';
import 'package:mobile_client/constants/error_messages.dart';
import 'package:mobile_client/constants/socket_events/room_event.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/room_service.dart';
import 'package:mobile_client/services/websocket_service.dart';
import 'package:mobile_client/widgets/snackbar.dart';

class StartGameButton extends StatefulWidget {
  const StartGameButton({super.key, required this.isDisabled});

  final bool isDisabled;

  @override
  State<StartGameButton> createState() => _StartGameButtonState();
}

class _StartGameButtonState extends State<StartGameButton> {
  final RoomService roomService = locator.get<RoomService>();

  final WebSocketService webSocketService = locator.get<WebSocketService>();

  bool isProcessing = false;

  Future<void> startGame(BuildContext context) async {
    setState(() {
      isProcessing = true;
    });
    final data = await webSocketService.sendWithAck(RoomEvent.startGame.name);
    final result = StartGameStatus.fromJson(data);

    setState(() {
      isProcessing = false;
    });
    if (!context.mounted) return;
    switch (result) {
      case StartGameStatus.notEnoughPlayers:
        showCustomSnackBar(
            context: context, message: StartGameErrorMessage.notEnoughPlayers);
        break;
      case StartGameStatus.notEnoughTeams:
        showCustomSnackBar(
            context: context, message: StartGameErrorMessage.notEnoughTeams);
        break;
      case StartGameStatus.unlocked:
        showCustomSnackBar(
            context: context, message: StartGameErrorMessage.unlocked);
        break;
      case StartGameStatus.playerHasNoTeam:
        showCustomSnackBar(
            context: context, message: StartGameErrorMessage.playerHasNoTeam);
        break;
      case StartGameStatus.notEnoughPlayersPerTeam:
        showCustomSnackBar(
            context: context,
            message: StartGameErrorMessage.notEnoughPlayersPerTeam);
        break;
      case StartGameStatus.canCreate:
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed:
          widget.isDisabled || isProcessing ? null : () => startGame(context),
      style: ElevatedButton.styleFrom(
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      ),
      child: const Text("Commencer la partie",
          style: TextStyle(fontSize: FontSize.m, fontWeight: FontWeight.bold)),
    );
  }
}
