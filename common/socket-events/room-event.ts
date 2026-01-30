export enum RoomEvent {
    CAN_JOIN_ROOM = 'canJoinRoom',
    JOIN_ROOM = 'joinRoom',
    START_GAME = 'startGame',
    UPDATE_PARTICIPANT_LIST = 'updateParticipantList',
    UPDATE_PLAYERS_STATS = 'updatePlayersStats',
    SWITCH_LOCK = 'lockRoom',
    BAN = 'ban',
    LEAVE_GAME = 'leaveGame',

    CREATE_TEAM = 'createTeam',
    SELECT_TEAM = 'selectTeam',
    UPDATE_TEAMS = 'updateTeams',
}
