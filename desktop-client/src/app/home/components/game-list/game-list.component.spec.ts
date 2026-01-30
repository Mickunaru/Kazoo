import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { MatSnackBar } from '@angular/material/snack-bar';
import { ACKNOWLEDGE_TEXT, GameJoinErrorMessage } from '@app/constants/error-message';
import { ROOM_ID_MOCK } from '@app/constants/test-utils';
import { GameModeNameEnum } from '@app/game/enum/game-mode-name';
import { HomeLobbyService } from '@app/home/services/home-lobby/home-lobby.service';
import { RoomService } from '@app/home/services/room/room.service';
import { GameMode } from '@common/enum/game-mode';
import { RoomAccessStatus } from '@common/enum/room-access-status';
import { ActiveGame } from '@common/interfaces/active-game';
import { GameListComponent } from './game-list.component';

describe('GameListComponent', () => {
    let component: GameListComponent;
    let fixture: ComponentFixture<GameListComponent>;
    let homeLobbyServiceSpy: jasmine.SpyObj<HomeLobbyService>;
    let roomServiceSpy: jasmine.SpyObj<RoomService>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        homeLobbyServiceSpy = jasmine.createSpyObj('HomeLobbyService', [''], { activeGames: [] });
        roomServiceSpy = jasmine.createSpyObj('RoomService', ['canPlayerJoinRoom', 'playerJoinRoom']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        TestBed.configureTestingModule({
            declarations: [GameListComponent],
            providers: [
                { provide: HomeLobbyService, useValue: homeLobbyServiceSpy },
                { provide: RoomService, useValue: roomServiceSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
            ],
        });
        fixture = TestBed.createComponent(GameListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return classic game type', () => {
        const activeGame = { gameConfig: { gameMode: GameMode.CLASSIC } } as ActiveGame;
        const gameType = component.getGameType(activeGame);
        expect(gameType).toEqual(GameModeNameEnum.CLASSIC);
    });

    it('should return elimination game type', () => {
        const activeGame = { gameConfig: { gameMode: GameMode.ELIMINATION } } as ActiveGame;
        const gameType = component.getGameType(activeGame);
        expect(gameType).toEqual(GameModeNameEnum.ELIMINATION);
    });

    it('should return team game type', () => {
        const activeGame = { gameConfig: { gameMode: GameMode.TEAM } } as ActiveGame;
        const gameType = component.getGameType(activeGame);
        expect(gameType).toEqual(GameModeNameEnum.TEAM);
    });

    it('should join room when room is opened', fakeAsync(() => {
        roomServiceSpy.canPlayerJoinRoom.and.resolveTo(RoomAccessStatus.OPENED);
        component.joinGame(ROOM_ID_MOCK);
        tick();
        expect(roomServiceSpy.playerJoinRoom).toHaveBeenCalledOnceWith(ROOM_ID_MOCK);
    }));

    it('should show snackbar message when room is locked', fakeAsync(() => {
        roomServiceSpy.canPlayerJoinRoom.and.resolveTo(RoomAccessStatus.LOCKED);
        component.joinGame(ROOM_ID_MOCK);
        tick();
        expect(snackBarSpy.open).toHaveBeenCalledOnceWith(GameJoinErrorMessage.LOCKED, ACKNOWLEDGE_TEXT);
    }));

    it('should show snackbar message when room is hidden', fakeAsync(() => {
        roomServiceSpy.canPlayerJoinRoom.and.resolveTo(RoomAccessStatus.HIDDEN);
        component.joinGame(ROOM_ID_MOCK);
        tick();
        expect(snackBarSpy.open).toHaveBeenCalledOnceWith(GameJoinErrorMessage.HIDDEN, ACKNOWLEDGE_TEXT);
    }));

    it('should show snackbar message when room is deleted', fakeAsync(() => {
        roomServiceSpy.canPlayerJoinRoom.and.resolveTo(RoomAccessStatus.DELETED);
        component.joinGame(ROOM_ID_MOCK);
        tick();
        expect(snackBarSpy.open).toHaveBeenCalledOnceWith(GameJoinErrorMessage.DELETED, ACKNOWLEDGE_TEXT);
    }));
});
