import { GameMode } from '../enum/game-mode';

export type GameConfigDto = {
    isFriendsOnly: boolean;
    arePowerUpsEnabled: boolean;
    hasSoundboard: boolean;
    entryPrice: number;
    gameMode: GameMode;
} & (RandomGameConfig | BaseGameConfig);

type RandomGameConfig = {
    gameId: null;
    questionCount: number;
};

type BaseGameConfig = {
    gameId: string;
    questionCount: undefined;
};
