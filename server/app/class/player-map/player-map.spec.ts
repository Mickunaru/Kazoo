import {
    PLAYER_CREDENTIAL_MOCK,
    PLAYER_NAME_1,
    PLAYER_NAME_2,
    PLAYER_NAME_3,
    PLAYER_NAME_MOCK,
    PLAYER_SCORE1,
    PLAYER_SCORE2,
    PLAYER_SCORE3,
    SOCKET_ID_1,
    SOCKET_ID_2,
    SOCKET_ID_3,
    SOCKET_ID_MOCK,
} from '@app/constants/test-utils';
import { User } from '@app/model/database/user';
import { PlayerStatus } from '@common/interfaces/player-info';
import { PlayerMap } from './player-map';

describe('PlayerMap', () => {
    let playerMap: PlayerMap;

    beforeEach(() => {
        playerMap = new PlayerMap();
    });

    it('should be defined', () => {
        expect(playerMap).toBeDefined();
    });

    it('should add a player', () => {
        playerMap.addPlayer(SOCKET_ID_MOCK, PLAYER_CREDENTIAL_MOCK);

        expect(playerMap.getPlayerFromName(PLAYER_NAME_MOCK)).toBeDefined();
        expect(playerMap.getPlayerFromSocket(SOCKET_ID_MOCK)).toBeDefined();
    });

    it('should return the size', () => {
        playerMap.addPlayer(SOCKET_ID_1, { username: PLAYER_NAME_1, avatar: '' } as User);
        expect(playerMap.size).toEqual(1);
        playerMap.addPlayer(SOCKET_ID_2, { username: PLAYER_NAME_2, avatar: '' } as User);
        expect(playerMap.size).toEqual(2);
        playerMap.addPlayer(SOCKET_ID_3, { username: PLAYER_NAME_3, avatar: '' } as User);
        expect(playerMap.size).toEqual(3);
    });

    it('should return the activePlayerCount', () => {
        playerMap.addPlayer(SOCKET_ID_1, { username: PLAYER_NAME_1, avatar: '' } as User);
        playerMap.addPlayer(SOCKET_ID_2, { username: PLAYER_NAME_2, avatar: '' } as User);
        const player = playerMap.getPlayerFromName(PLAYER_NAME_2);
        if (player) player.status = PlayerStatus.Left;

        expect(playerMap.activePlayerCount).toEqual(1);
    });

    it('should return the highest score', () => {
        playerMap.addPlayer(SOCKET_ID_1, { username: PLAYER_NAME_1, avatar: '' } as User);
        playerMap.addPlayer(SOCKET_ID_2, { username: PLAYER_NAME_2, avatar: '' } as User);
        playerMap.addPlayer(SOCKET_ID_3, { username: PLAYER_NAME_3, avatar: '' } as User);

        const player1 = playerMap.getPlayerFromName(PLAYER_NAME_1);
        player1?.receivePoints(PLAYER_SCORE1);
        const player2 = playerMap.getPlayerFromName(PLAYER_NAME_2);
        player2?.receivePoints(PLAYER_SCORE2);
        const player3 = playerMap.getPlayerFromName(PLAYER_NAME_3);
        player3?.receivePoints(PLAYER_SCORE3);

        expect(playerMap.highestScore).toEqual(PLAYER_SCORE2);
    });

    it('should check if name is used', () => {
        playerMap.addPlayer(SOCKET_ID_MOCK, PLAYER_CREDENTIAL_MOCK);

        expect(playerMap.hasName(PLAYER_NAME_MOCK)).toBeTruthy();
        expect(playerMap.hasName('unusedName')).toBeFalsy();
    });

    it('should check if socket id is used', () => {
        playerMap.addPlayer(SOCKET_ID_MOCK, PLAYER_CREDENTIAL_MOCK);

        expect(playerMap.hasSocketId(SOCKET_ID_MOCK)).toBeTruthy();
        expect(playerMap.hasSocketId('unusedSocket')).toBeFalsy();
    });

    it('should apply for each properly', () => {
        playerMap.addPlayer(SOCKET_ID_1, { username: PLAYER_NAME_1, avatar: '' } as User);
        playerMap.addPlayer(SOCKET_ID_2, { username: PLAYER_NAME_2, avatar: '' } as User);
        playerMap.addPlayer(SOCKET_ID_3, { username: PLAYER_NAME_3, avatar: '' } as User);

        const spyObj = {
            callback: () => {
                return;
            },
        };
        const callbackSpy = jest.spyOn(spyObj, 'callback');

        playerMap.forEach(spyObj.callback);
        expect(callbackSpy).toBeCalledTimes(3);
    });

    it('should say a player is inactive if he never joined  in the first place', () => {
        expect(playerMap.isPlayerActive('newPlayer')).toBeFalsy();
    });

    it('should return array of player dto', () => {
        playerMap.addPlayer(SOCKET_ID_MOCK, PLAYER_CREDENTIAL_MOCK);
        const playerDto = playerMap.getPlayerList();
        expect(playerDto).toEqual([{ username: PLAYER_NAME_MOCK, hasLeft: false, teamName: '', imageUrl: '' }]);
    });
});
