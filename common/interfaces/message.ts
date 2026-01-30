export interface Message {
    room: string;
    author: string;
    text: string;
    date: Date;
    type: MessageType;
    duration?: number; // In seconds for audio message
    avatar: string;
}

export enum MessageType {
    TEXT = 'TEXT',
    SOUND = 'SOUND',
}

export enum ChatRoomType {
    GENERAL = 'GENERAL',
    GAME_ROOM = 'GAME_ROOM',
    TEAM_ROOM = 'TEAM_ROOM',
    CUSTOM = 'CUSTOM',
}

export const GENERAL_CHAT_NAME = 'Général';
