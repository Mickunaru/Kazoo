export enum QuestionBankErrorMessage {
    UPDATE = 'Une erreur est survenue lors de la mise à jour de la question',
    CREATION = 'Une erreur est survenue lors de la création de la question',
    DUPLICATED_TITLE = 'Le titre de la question existe déjà',
    DELETION = 'Une erreur est suvenue lors de la suppression de la question',
    DISPLACEMENT = 'La question existe déjà dans la banque de questions',
}

export enum GameStarterErrorMessage {
    DELETED = 'Ce jeu a été supprimé! Veuillez en choisir un autre.',
    HIDDEN = 'Ce jeu a été caché! Veuillez en choisir un autre.',
    NOT_ENOUGH_QUESTIONS = "Il n'y a pas assez de questions disponibles pour créer le jeu",
    NOT_ENOUGH_MONEY = "Vous n'avez pas assez d'argent pour créer la partie",
    IMPOSSIBLE = 'La création de la partie a échoué pour des raisons inconnues',
}

export enum GameJoinErrorMessage {
    CODE_REQUIS = 'Le code est requis.',
    LOCKED = 'Cette salle est fermé.',
    HIDDEN = "Vous n'avez pas accès à cette salle.",
    DELETED = "Cette salle n'existe pas.",
    NOT_ENOUGH_MONEY = "Vous n'avez pas assez d'argent pour joindre la salle.",
    MAX_PLAYER_COUNT_REACHED = 'La salle est pleine',
    UNKOWN = 'Erreur inattendue',
}

export enum AuthErrorMessage {
    TOKEN_EXPIRED = 'Votre session est expiré',
    SIGN_UP = 'Échec de la création de compte. Veuillez réessayer plus tard.',
    SIGN_IN = 'Échec de la connexion. Veuillez réessayer plus tard.',
    USERNAME_TAKEN = "Nom d'utilisateur déjà pris",
    USERNAME_DOES_NOT_EXISTS = "Aucun compte trouvé avec ce nom d'utilisateur.",
    USER_ALREADY_LOGGED_IN = 'Votre compte est actif sur un autre appareil.',
}

export enum StartGameErrorMessage {
    UNLOCKED = 'La salle est déverrouillée.',
    NOT_ENOUGH_PLAYERS = "Il n'y a pas assez de participants dans la salle.",
    NOT_ENOUGH_PLAYERS_PER_TEAM = 'Une équipe doit être composé de 2 joueurs.',
    NOT_ENOUGH_TEAMS = "Il n'y a pas assez d'équipes complètes dans la salle (2 joueurs par équipe)",
    PLAYER_HAS_NO_TEAM = 'Il reste des participants sans équipe.',
}

export enum TeamCreationErrorMessages {
    TEAM_NAME_TAKEN = "Nom de l'équipe existe déjà.",
    MAXIMUM_TEAM_LIMIT_REACHED = "Le nombre maximal d'équipe a été atteint.",
}

export const SERVER_DOWN = 'Nos systèmes sont présentement en panne, veuillez réessayer plus tard';
export const ACKNOWLEDGE_TEXT = 'OK';
export const WRONG_PASSWORD_ERROR_MESSAGE = 'Votre mot de passe est invalide';
