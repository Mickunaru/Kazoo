enum GameMode {
  classic,
  elimination,
  team;

  String toJson() => name;
  static GameMode fromJson(String json) => values.byName(json);

  static modeDisplayName(GameMode mode) {
    switch (mode) {
      case GameMode.classic:
        return "Classique";
      case GameMode.elimination:
        return "Élimination Rapide";
      case GameMode.team:
        return "Équipe";
    }
  }
}
