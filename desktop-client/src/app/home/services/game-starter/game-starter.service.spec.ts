import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameLibraryService } from '@app/admin/services/game-library/game-library.service';
import { GameStarterErrorMessage } from '@app/constants/error-message';
import { GAME_CODE_MOCK } from '@app/constants/test-utils';
import { GameStartError, GameStartErrorTypes } from '@app/home/errors/game-start-error';
import { RandomGameService } from '@app/home/services/random-game/random-game.service';
import { RoomService } from '@app/home/services/room/room.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { GameVisibility } from '@common/enum/game-visibility';
import { GameConfigDto } from '@common/interfaces/game-config-dto';
import { of } from 'rxjs';
import { GameStarterService } from './game-starter.service';

describe('GameStarterService', () => {
    let service: GameStarterService;
    let gameLibraryServiceSpy: jasmine.SpyObj<GameLibraryService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let roomServiceSpy: jasmine.SpyObj<RoomService>;
    let webSocketServiceSpy: jasmine.SpyObj<WebsocketService>;
    let randomGameServiceSpy: jasmine.SpyObj<RandomGameService>;

    beforeEach(() => {
        gameLibraryServiceSpy = jasmine.createSpyObj('GameLibraryService', ['getGameVisibility']);
        roomServiceSpy = jasmine.createSpyObj('RoomService', ['createRoomAndJoin']);
        webSocketServiceSpy = jasmine.createSpyObj('WebsocketService', ['send']);
        randomGameServiceSpy = jasmine.createSpyObj('RandomGameService', ['hasEnoughQuestionForRandomGame']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: GameLibraryService, useValue: gameLibraryServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: RoomService, useValue: roomServiceSpy },
                { provide: WebsocketService, useValue: webSocketServiceSpy },
                { provide: RandomGameService, useValue: randomGameServiceSpy },
            ],
        });
        service = TestBed.inject(GameStarterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create room if random game is available', fakeAsync(() => {
        randomGameServiceSpy.hasEnoughQuestionForRandomGame.and.returnValue(of(true));
        service.startGame({ gameId: null } as GameConfigDto);
        tick();
        expect(roomServiceSpy.createRoomAndJoin).toHaveBeenCalled();
    }));

    it('should throw error if random game is unavailable', fakeAsync(() => {
        randomGameServiceSpy.hasEnoughQuestionForRandomGame.and.returnValue(of(false));
        let error = new Error();
        service.startGame({ gameId: null } as GameConfigDto).catch((err) => (error = err));
        tick();
        expect(error).toEqual(new GameStartError(GameStarterErrorMessage.NOT_ENOUGH_QUESTIONS, GameStartErrorTypes.NOT_ENOUGH_QUESTIONS));
    }));

    it('should create room if game is public', fakeAsync(() => {
        gameLibraryServiceSpy.getGameVisibility.and.resolveTo({ visibility: GameVisibility.PUBLIC });
        service.startGame({ gameId: GAME_CODE_MOCK } as GameConfigDto);
        tick();
        expect(roomServiceSpy.createRoomAndJoin).toHaveBeenCalled();
    }));

    it('should throw error if game is hidden', fakeAsync(() => {
        gameLibraryServiceSpy.getGameVisibility.and.resolveTo({ visibility: GameVisibility.HIDDEN });
        let error = new Error();

        service.startGame({ gameId: GAME_CODE_MOCK } as GameConfigDto).catch((err) => (error = err));
        tick();
        expect(error).toEqual(new GameStartError(GameStarterErrorMessage.HIDDEN, GameStartErrorTypes.HIDDEN));
    }));

    it('should throw error if game is hidden', fakeAsync(() => {
        gameLibraryServiceSpy.getGameVisibility.and.resolveTo({ visibility: GameVisibility.DELETED });
        let error = new Error();

        service.startGame({ gameId: GAME_CODE_MOCK } as GameConfigDto).catch((err) => (error = err));
        tick();
        expect(error).toEqual(new GameStartError(GameStarterErrorMessage.DELETED, GameStartErrorTypes.DELETED));
    }));
});
