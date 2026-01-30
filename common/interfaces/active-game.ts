import { RoomState } from '../enum/room-state';
import { GameConfigDto } from './game-config-dto';

export interface ActiveGame {
    roomId: string;
    gameTitle: string;
    gameConfig: GameConfigDto;
    roomState: RoomState;
    playerCount: number;
}

export type NewRoomState = Pick<ActiveGame, 'roomId' | 'roomState'>;

export type NewPlayerCount = Pick<ActiveGame, 'roomId' | 'playerCount'>;
