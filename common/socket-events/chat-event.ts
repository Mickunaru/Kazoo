export enum ChatEvent {
    SEND_MESSAGE = 'sendChatMessage',
    SEND_CHAT_HISTORY = 'sendChatHistory',
    CREATE_CHAT_ROOM = 'createChatRoom',
    GET_JOINED_ROOMS = 'getJoinedChatRooms',
    GET_OTHER_ROOMS = 'getOtherChatRooms',
    JOIN_ROOM = 'joinChatRoom',
    LEAVE_ROOM = 'leaveChatRoom',
    DELETE_ROOM = 'deleteChatRoom',
    CREATOR_UPGRADE = 'chatCreatorUpgrade',
    SEND_SOUND = 'sendSound',
    SEE_UNREAD_MESSAGES = 'seeUnreadMessages',
}
