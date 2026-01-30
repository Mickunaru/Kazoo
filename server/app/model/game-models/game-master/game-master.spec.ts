import { SOCKET_ID_MOCK } from '@app/constants/test-utils';
import { GameMaster } from './game-master';

describe('GameMaster', () => {
    it('constructor should initialize properties', () => {
        const gameMaster = new GameMaster('name', SOCKET_ID_MOCK);
        expect(gameMaster.name).toEqual('name');
        expect(gameMaster.socketId).toEqual(SOCKET_ID_MOCK);
    });
});
