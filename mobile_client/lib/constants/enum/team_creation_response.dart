enum TeamCreationResponse {
  teamNameTaken,
  maximumTeamLimitReached,
  teamCreated;

  static TeamCreationResponse fromJson(String json) => values.byName(json);
}
