import { TestBed } from '@angular/core/testing';

import { ROOM_ID_MOCK } from '@app/constants/test-utils';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { RoomState } from '@common/enum/room-state';
import { ActiveGame, NewPlayerCount, NewRoomState } from '@common/interfaces/active-game';
import { HomeEvent } from '@common/socket-events/home-event';
import { SocketEvent } from '@common/socket-events/socket-event';
import { HomeLobbyService } from './home-lobby.service';

describe('HomeLobbyService', () => {
    let service: HomeLobbyService;
    let webSocketServiceSpy: jasmine.SpyObj<WebsocketService>;

    beforeEach(() => {
        webSocketServiceSpy = jasmine.createSpyObj('WebsocketService', ['on', 'send', 'removeAllListeners']);

        TestBed.configureTestingModule({
            providers: [{ provide: WebsocketService, useValue: webSocketServiceSpy }],
        });
        service = TestBed.inject(HomeLobbyService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should alert server that player has join lobby', () => {
        webSocketServiceSpy.on.and.callThrough();
        webSocketServiceSpy.send.and.stub();
        service.joinHomeLobby();
        expect(webSocketServiceSpy.send).toHaveBeenCalledOnceWith(HomeEvent.JOIN_HOME_LOBBY);
    });

    it('should setup all listeners', () => {
        const listeners: SocketEvent[] = [];
        const expectedLiseters = [HomeEvent.UPDATE_GAME_LIST, HomeEvent.UPDATE_PLAYER_COUNT, HomeEvent.REMOVE_GAME, HomeEvent.UPDATE_ROOM_STATE];
        webSocketServiceSpy.on.and.callFake((event) => {
            listeners.push(event);
        });
        service.joinHomeLobby();
        const hasEveryEvent = expectedLiseters.every((listener) => listener.includes(listener));
        expect(hasEveryEvent).toBeTrue();
    });

    it('should update active game list on event', () => {
        const activeGames = [{}, {}] as ActiveGame[];
        webSocketServiceSpy.on.and.callFake(<T>(e: SocketEvent, action: (data?: T) => void) => {
            if (e === HomeEvent.UPDATE_GAME_LIST) {
                action(activeGames as T);
                expect(service.activeGames.length).toEqual(activeGames.length);
            }
        });
        service.joinHomeLobby();
    });

    it('should update player count on event', () => {
        const activeGame = { roomId: ROOM_ID_MOCK, playerCount: 1 } as ActiveGame;

        const newPlayerCount: NewPlayerCount = { roomId: ROOM_ID_MOCK, playerCount: 1 };
        webSocketServiceSpy.on.and.callFake(<T>(e: SocketEvent, action: (data?: T) => void) => {
            if (e === HomeEvent.UPDATE_PLAYER_COUNT) {
                service.activeGames = [activeGame];
                action(newPlayerCount as T);
                expect(activeGame.playerCount).toEqual(2);
            }
        });
        service.joinHomeLobby();
    });

    it('should remove game from game list on event', () => {
        const activeGame = { roomId: ROOM_ID_MOCK } as ActiveGame;

        webSocketServiceSpy.on.and.callFake(<T>(e: SocketEvent, action: (data?: T) => void) => {
            if (e === HomeEvent.REMOVE_GAME) {
                service.activeGames = [activeGame, {}, {}] as ActiveGame[];
                action(ROOM_ID_MOCK as T);
                expect(service.activeGames.length).toEqual(2);
            }
        });
        service.joinHomeLobby();
    });

    it('should update room state on event', () => {
        const activeGame = { roomId: ROOM_ID_MOCK, roomState: RoomState.OPEN } as ActiveGame;

        const newRoomState: NewRoomState = { roomId: ROOM_ID_MOCK, roomState: RoomState.IN_GAME };
        webSocketServiceSpy.on.and.callFake(<T>(e: SocketEvent, action: (data?: T) => void) => {
            if (e === HomeEvent.UPDATE_ROOM_STATE) {
                service.activeGames = [activeGame, {}, {}] as ActiveGame[];
                action(newRoomState as T);
                expect(activeGame.roomState).toEqual(RoomState.IN_GAME);
            }
        });
        service.joinHomeLobby();
    });

    it('should alert server that player has left lobbby', () => {
        webSocketServiceSpy.removeAllListeners.and.callThrough();
        webSocketServiceSpy.send.and.stub();
        service.leaveHomeLobby();
        expect(webSocketServiceSpy.send).toHaveBeenCalledOnceWith(HomeEvent.LEAVE_HOME_LOBBY);
    });

    it('should remove all listeners', () => {
        const listeners: SocketEvent[] = [];
        const expectedLiseters = [HomeEvent.UPDATE_GAME_LIST, HomeEvent.UPDATE_PLAYER_COUNT, HomeEvent.REMOVE_GAME, HomeEvent.UPDATE_ROOM_STATE];
        webSocketServiceSpy.removeAllListeners.and.callFake((event) => {
            listeners.push(event);
        });
        service.leaveHomeLobby();
        const hasEveryEvent = expectedLiseters.every((listener) => listener.includes(listener));
        expect(hasEveryEvent).toBeTrue();
    });
});
