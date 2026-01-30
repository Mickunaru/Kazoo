import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_client/constants/enum/game_mode.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/game/timer_service.dart';
import 'package:mobile_client/services/participant_service.dart';
import 'package:mobile_client/services/room_service.dart';
import 'package:mobile_client/services/websocket_service.dart';
import 'package:mobile_client/widgets/waiting_room/lock_room_button.dart';
import 'package:mobile_client/widgets/waiting_room/start_game_button.dart';
import 'package:mobile_client/widgets/waiting_room/waiting_players.dart';
import 'package:mobile_client/widgets/waiting_room/waiting_teams.dart';

class WaitingView extends StatefulWidget {
  const WaitingView({super.key});

  @override
  State<WaitingView> createState() => _WaitingViewState();
}

class _WaitingViewState extends State<WaitingView>
    with TickerProviderStateMixin {
  final RoomService roomService = locator.get<RoomService>();
  final ParticipantService participantService =
      locator.get<ParticipantService>();
  final WebSocketService webSocketService = locator.get<WebSocketService>();
  final TimerService timerService = locator.get<TimerService>();

  late Animation<double> animation;
  late AnimationController controller;

  @override
  void initState() {
    super.initState();
    controller =
        AnimationController(duration: const Duration(seconds: 2), vsync: this)
          ..repeat(reverse: true);
    animation = Tween<double>(begin: 0, end: 7)
        .animate(CurvedAnimation(parent: controller, curve: Curves.easeInOut))
      ..addListener(() {
        setState(() {});
      });
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  void _copyRoomId() {
    Clipboard.setData(ClipboardData(text: roomService.roomId));
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      // color: Colors.green,
      padding: const EdgeInsets.all(16),
      child: Column(
        spacing: 20,
        children: [
          _buildHeader(),
          if (roomService.isGameMaster) _buildGameMasterControls(),
          if (roomService.gameMode == GameMode.team) ...[
            ValueListenableBuilder(
                valueListenable: timerService.isTimerActivated,
                builder: (_, isActivated, __) {
                  return WaitingTeam(isDisabled: isActivated);
                }),
          ],
          Expanded(child: WaitingPlayers()),
        ],
      ),
    );
  }
Widget _buildHeader() {
    return Column(
      children: [
        ValueListenableBuilder<int>(
          valueListenable: timerService.time,
          builder: (_, time, __) => Center(
            child: Transform.translate(
              offset: Offset(0, animation.value), 
              child: Text(
                timerService.isTimerActivated.value
                    ? 'La partie commence dans ${time}s'
                    : 'En attente',
                style:
                    const TextStyle(fontSize: 36, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ),
        const SizedBox(height: 10),
        if (roomService.isGameMaster)
          GestureDetector(
            onTap: _copyRoomId,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 20),
              child: Text(
                "Code du jeu: ${roomService.roomId}",
                style: const TextStyle(
                    fontSize: FontSize.l, fontWeight: FontWeight.bold),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildGameMasterControls() {
    return ValueListenableBuilder<bool>(
      valueListenable: timerService.isTimerActivated,
      builder: (_, isActivated, __) {
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            LockRoomButton(isDisabled: isActivated),
            const SizedBox(width: 10),
            StartGameButton(isDisabled: isActivated),
          ],
        );
      },
    );
  }
}
