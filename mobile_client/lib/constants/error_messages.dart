class StartGameErrorMessage {
  static const String unlocked = 'La salle est déverrouillée.';
  static const String notEnoughPlayers =
      "Il n'y a pas assez de participants dans la salle.";
  static const String notEnoughPlayersPerTeam =
      'Une équipe doit être composé de 2 joueurs.';
  static const String notEnoughTeams =
      "Il n'y a pas assez d'équipes complètes dans la salle (2 joueurs par équipe).";
  static const String playerHasNoTeam =
      'Il reste des participants sans équipe.';
}

class GameStarterErrorMessage {
  static const String hidden =
      "Ce jeu a été supprimé! Veuillez en choisir un autre.";
  static const String deleted =
      "Ce jeu a été supprimé! Veuillez en choisir un autre.";
  static const String notEnoughQuestions =
      "Il n'y a pas assez de questions disponibles pour créer le jeu.";
  static const String notEnoughMoney =
      "Vous n'avez pas assez d'argent pour créer la partie.";
  static const String impossible =
      "La création de la partie a échoué pour des raisons inconnues";
}
