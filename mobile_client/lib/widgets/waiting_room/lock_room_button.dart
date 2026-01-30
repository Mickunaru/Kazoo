import 'package:flutter/material.dart';
import 'package:mobile_client/constants/socket_events/room_event.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/room_service.dart';
import 'package:mobile_client/services/websocket_service.dart';

class LockRoomButton extends StatefulWidget {
  final RoomService roomService = locator.get<RoomService>();
  final WebSocketService webSocketService = locator.get<WebSocketService>();

  LockRoomButton({super.key, required this.isDisabled});

  final bool isDisabled;

  @override
  State<LockRoomButton> createState() => _LockRoomButtonState();
}

class _LockRoomButtonState extends State<LockRoomButton> {
  @override
  void initState() {
    super.initState();
    setupLockHandler();
  }

  @override
  void dispose() {
    widget.webSocketService.removeAllListeners(RoomEvent.lockRoom.name);
    widget.roomService.isLocked = false;
    super.dispose();
  }

  void setupLockHandler() {
    widget.webSocketService.on<bool>(RoomEvent.lockRoom.name, (lockStatus) {
      setState(() => widget.roomService.isLocked = lockStatus);
    });
  }

  void lockRoom() {
    widget.webSocketService.send(RoomEvent.lockRoom.name);
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: widget.isDisabled ? null : lockRoom,
      icon: Icon(widget.roomService.isLocked ? Icons.lock : Icons.lock_open),
      color: Colors.white,
      style: IconButton.styleFrom(
        backgroundColor: Theme.of(context).primaryColor,
        padding: const EdgeInsets.all(16),
      ),
    );
  }
}
