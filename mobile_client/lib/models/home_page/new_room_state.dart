import 'package:mobile_client/constants/enum/room_state.dart';

class NewRoomState {
  final String roomId;
  final RoomState roomState;

  const NewRoomState({
    required this.roomId,
    required this.roomState,
  });

  factory NewRoomState.fromJson(Map<String, dynamic> json) {
    return NewRoomState(
      roomId: json['roomId'],
      roomState: RoomState.fromJson(json['roomState']),
    );
  }
}
