enum RoomDestructionReason {
  organizerLeft,
  allPlayerLeft,
  gameFinished;

  static RoomDestructionReason fromJson(String json) => values.byName(json);
}
