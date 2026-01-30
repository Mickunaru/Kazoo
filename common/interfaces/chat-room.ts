import { ChatRoomType } from './message';

export interface ChatRoomDto {
    _id?: string;
    name: string;
    type: ChatRoomType;
    members: string[];
    creator: string;
    hasSoundboard: boolean;
    unreadMessages?: number;
}
