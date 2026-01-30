import { GameLibraryService } from '@app/admin/services/game-library/game-library.service';
import { SocketMap } from '@app/class/socket-map/socket-map';
import { HOME_LOBBY_ROOM_ID } from '@app/constants/room-constants';
import { ConnectionService } from '@app/services/connection/connection.service';
import { FriendService } from '@app/services/friend/friend.service';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { ActiveGame } from '@common/interfaces/active-game';
import { HomeEvent } from '@common/socket-events/home-event';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Socket } from 'socket.io';
import { HomeLobbyService } from './home-lobby.service';

describe('HomeLobbyService', () => {
    let service: HomeLobbyService;
    let gameLibraryServiceStub: SinonStubbedInstance<GameLibraryService>;
    let roomsManagerServiceStub: SinonStubbedInstance<RoomsManagerService>;
    let friendServiceStub: SinonStubbedInstance<FriendService>;
    let connectionServiceStub: SinonStubbedInstance<ConnectionService>;
    let loggerStub: SinonStubbedInstance<Logger>;
    let client: SinonStubbedInstance<Socket>;

    beforeEach(async () => {
        gameLibraryServiceStub = createStubInstance(GameLibraryService);
        roomsManagerServiceStub = createStubInstance(RoomsManagerService);
        friendServiceStub = createStubInstance(FriendService);
        connectionServiceStub = createStubInstance(ConnectionService);
        loggerStub = createStubInstance(Logger);
        client = createStubInstance<Socket>(Socket);
        jest.clearAllMocks();
        connectionServiceStub.userMap = { getUserFromSocket: () => ({ username: 'name', uid: 'uid' }) } as unknown as SocketMap;
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HomeLobbyService,
                { provide: GameLibraryService, useValue: gameLibraryServiceStub },
                { provide: RoomsManagerService, useValue: roomsManagerServiceStub },
                { provide: FriendService, useValue: friendServiceStub },
                { provide: ConnectionService, useValue: connectionServiceStub },
                { provide: Logger, useValue: loggerStub },
            ],
        }).compile();

        service = module.get<HomeLobbyService>(HomeLobbyService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should join home lobby', async () => {
        const activeGames = [{}, {}, {}] as ActiveGame[];
        roomsManagerServiceStub.getActiveGames.returns(activeGames);
        friendServiceStub.getAllFriendUsernames.resolves(['name']);
        jest.spyOn(client, 'join');
        jest.spyOn(client, 'emit');

        await service.joinHomeLobby(client);
        expect(client.join).toHaveBeenCalledWith(HOME_LOBBY_ROOM_ID);
        expect(client.emit).toHaveBeenCalledWith(HomeEvent.UPDATE_GAME_LIST, activeGames);
    });

    it('should leave home lobby', () => {
        jest.spyOn(client, 'leave');
        service.leaveHomeLobby(client);
        expect(client.leave).toHaveBeenCalledWith(HOME_LOBBY_ROOM_ID);
    });
});
