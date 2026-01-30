import { GameLibraryService } from '@app/admin/services/game-library/game-library.service';
import { SocketMap } from '@app/class/socket-map/socket-map';
import { MAX_ROOM_CODE_TRIES } from '@app/constants/room-constants';
import { GAME_MASTER_ID, ROOM_ID_MOCK } from '@app/constants/test-utils';
import { Game } from '@app/model/database/game';
import { Room } from '@app/model/game-models/room/room';
import { ConnectionService } from '@app/services/connection/connection.service';
import { CurrencyService } from '@app/services/currency/currency.service';
import { RandomGameService } from '@app/services/random-game/random-game.service';
import { GameConfigDto } from '@common/interfaces/game-config-dto';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { RoomsManagerService } from './rooms-manager.service';

jest.mock('@app/model/game-models/room/room');

describe('RoomsManagerService', () => {
    let service: RoomsManagerService;
    let gameLibraryServiceStub: SinonStubbedInstance<GameLibraryService>;
    let randomGameService: SinonStubbedInstance<RandomGameService>;
    let loggerStub: SinonStubbedInstance<Logger>;
    let connectionServiceStub: SinonStubbedInstance<ConnectionService>;
    let currencyServiceStub: SinonStubbedInstance<CurrencyService>;
    let gameMock: Game;

    beforeEach(async () => {
        connectionServiceStub = createStubInstance(ConnectionService);
        gameLibraryServiceStub = createStubInstance(GameLibraryService);
        randomGameService = createStubInstance(RandomGameService);
        currencyServiceStub = createStubInstance(CurrencyService);
        loggerStub = createStubInstance(Logger);
        jest.clearAllMocks();
        connectionServiceStub.userMap = {
            getUserFromSocket: () => ({
                username: 'name',
            }),
        } as unknown as SocketMap;
        gameMock = {} as Game;
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoomsManagerService,
                { provide: GameLibraryService, useValue: gameLibraryServiceStub },
                { provide: RandomGameService, useValue: randomGameService },
                { provide: Logger, useValue: loggerStub },
                { provide: ConnectionService, useValue: connectionServiceStub },
                { provide: CurrencyService, useValue: currencyServiceStub },
            ],
        }).compile();

        service = module.get<RoomsManagerService>(RoomsManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a room', async () => {
        const createdRoomCode = 'roomCode';
        gameLibraryServiceStub.getGame.resolves(gameMock);
        jest.spyOn(Room, 'generateCode').mockReturnValue(createdRoomCode);

        expect(service['rooms'].size).toBe(0);
        const roomCode = await service.createRoom({} as GameConfigDto, 'creatorSocketId');
        expect(service['rooms'].size).toBe(1);
        expect(roomCode).toBe(createdRoomCode);
    });

    it('should never end up in a infinite loop when generating a roomCode', async () => {
        const duplicateRoomCode = 'usedRoomCode';
        service['rooms'].set(duplicateRoomCode, {} as Room);
        const newCodeSpy = jest.spyOn(Room, 'generateCode').mockReturnValue(duplicateRoomCode);

        await expect(async () => service.createRoom({} as GameConfigDto, 'creatorSocketId')).rejects.toThrow(ServiceUnavailableException);
        expect(newCodeSpy).toHaveBeenCalledTimes(MAX_ROOM_CODE_TRIES);
    });

    it('should get a room', () => {
        const room = {} as Room;
        service['rooms'].set('roomId', room);

        expect(service.getRoom('roomId')).toBe(room);
    });

    it('should destroy a room', () => {
        const destroyRoomMock = jest.fn();
        service['rooms'].set('roomId', { destroy: destroyRoomMock } as never as Room);
        expect(service['rooms'].size).toBe(1);

        service.destroyRoom('roomId');
        expect(service['rooms'].size).toBe(0);
        expect(service.getRoom('roomId')).toBeUndefined();
    });

    it('should check if the client is gameMaster', () => {
        const room = { gameMaster: { isActiveGameMaster: () => false }, players: { hasNotLeft: () => false } } as unknown as Room;
        service['rooms'].set('roomId', room);

        expect(service.isGameMaster('playerId')).toBeFalsy();
    });

    it('should check if the client is not gameMaster', () => {
        const room = { gameMaster: { isActiveGameMaster: () => false }, players: { hasNotLeft: () => true } } as unknown as Room;
        service['rooms'].set('roomId', room);

        expect(service.isGameMaster('playerId')).toBeFalsy();
    });

    it('should get roomid with game master id', () => {
        const room = { gameMaster: { isActiveGameMaster: () => true }, players: { hasNotLeft: () => true } } as unknown as Room;
        service['rooms'].set(ROOM_ID_MOCK, room);

        expect(service.getRoomIdWithClientId(GAME_MASTER_ID)).toBe(ROOM_ID_MOCK);
    });
});
