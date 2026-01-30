enum StartGameStatus {
  notEnoughPlayers,
  notEnoughPlayersPerTeam,
  notEnoughTeams,
  playerHasNoTeam,
  unlocked,
  canCreate;

  static StartGameStatus fromJson(String json) => values.byName(json);
}
