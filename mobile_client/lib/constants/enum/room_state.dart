enum RoomState {
  open,
  locked,
  inGame,
  finished;

  String toJson() => name;
  static RoomState fromJson(String json) => values.byName(json);
}
