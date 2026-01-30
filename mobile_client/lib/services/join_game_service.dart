import 'package:mobile_client/constants/enum/room_access_status.dart';

import 'room_service.dart';

class JoinGameService {
  final RoomService roomService;

  JoinGameService(this.roomService);

  Future<String?> roomIdValidator(String roomId) async {
    try {
      final status = await roomService.canPlayerJoinRoom(roomId);
      return switch (status) {
        RoomAccessStatus.opened => null,
        RoomAccessStatus.locked => "Cette salle est fermée",
        RoomAccessStatus.hidden ||
        RoomAccessStatus.friendOnly =>
          "Cette salle est cachée",
        RoomAccessStatus.deleted => "Cette salle n'existe pas",
        RoomAccessStatus.notEnoughMoney =>
          "Vous n'avez pas assez d'argent pour joindre la salle.",
        RoomAccessStatus.maxPlayerCountReached => "La salle est pleine.",
        _ => null
      };
    } catch (_) {
      return "Erreur inattendue";
    }
  }
}
