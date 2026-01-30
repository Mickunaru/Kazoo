import 'package:flutter/material.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/game/timer_service.dart';
import 'package:mobile_client/services/room_service.dart';
import 'package:mobile_client/widgets/waiting_room/waiting_view.dart';

class WaitingRoomPage extends StatefulWidget {
  const WaitingRoomPage({super.key});

  @override
  State<WaitingRoomPage> createState() => _WaitingRoomPageState();
}

class _WaitingRoomPageState extends State<WaitingRoomPage> {
  final RoomService roomService = locator.get<RoomService>();
  final TimerService timerService = locator.get<TimerService>();

  @override
  void initState() {
    super.initState();
    timerService.timerEnded.addListener(_navigateToGamePage);
  }

  @override
  void dispose() {
    timerService.timerEnded.removeListener(_navigateToGamePage);
    super.dispose();
  }

  void _navigateToGamePage() {
    roomService.navigateToGamePage();
    timerService.timerEnded.removeListener(_navigateToGamePage);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Expanded(child: WaitingView()),
        ],
      ),
    );
  }
}
