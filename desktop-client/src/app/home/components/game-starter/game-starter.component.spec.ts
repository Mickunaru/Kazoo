import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ACKNOWLEDGE_TEXT, GameStarterErrorMessage } from '@app/constants/error-message';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { GameStartError, GameStartErrorTypes } from '@app/home/errors/game-start-error';
import { GameStarterService } from '@app/home/services/game-starter/game-starter.service';
import { Game } from '@common/interfaces/game';
import { GameStarterComponent } from './game-starter.component';

describe('GameStarterComponent', () => {
    let component: GameStarterComponent;
    let fixture: ComponentFixture<GameStarterComponent>;
    let matSnackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let gameStarterServiceSpy: jasmine.SpyObj<GameStarterService>;
    let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;

    beforeEach(() => {
        matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        gameStarterServiceSpy = jasmine.createSpyObj('GameStarterService', ['startGame', 'testGame']);
        gameStateServiceSpy = jasmine.createSpyObj('GameStarterService', [], { questionsLength: 0 });
        TestBed.configureTestingModule({
            declarations: [GameStarterComponent],
            providers: [
                { provide: MatSnackBar, useValue: matSnackBarSpy },
                { provide: GameStarterService, useValue: gameStarterServiceSpy },
                { provide: GameStateService, useValue: gameStateServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(GameStarterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start a game', fakeAsync(() => {
        gameStarterServiceSpy.startGame.and.stub();
        component.startGame();
        tick();
        expect(gameStarterServiceSpy.startGame).toHaveBeenCalled();
    }));

    it('should display a snack bar error message if the game is hidden', fakeAsync(() => {
        gameStarterServiceSpy.startGame.and.rejectWith(new GameStartError('Error', GameStartErrorTypes.HIDDEN));
        component.startGame();
        tick();
        expect(matSnackBarSpy.open).toHaveBeenCalledWith(GameStarterErrorMessage.HIDDEN, ACKNOWLEDGE_TEXT);
    }));

    it('should display a snack bar error message and return false if the game is not found', fakeAsync(() => {
        gameStarterServiceSpy.startGame.and.rejectWith(new GameStartError('Error', GameStartErrorTypes.DELETED));
        component.startGame();
        tick();
        expect(matSnackBarSpy.open).toHaveBeenCalledWith(GameStarterErrorMessage.DELETED, ACKNOWLEDGE_TEXT);
    }));

    it('should display a snack bar error message and return false if starting a game is impossible', fakeAsync(() => {
        gameStarterServiceSpy.startGame.and.rejectWith(new GameStartError('Error', GameStartErrorTypes.IMPOSSIBLE));
        component.startGame();
        tick();
        expect(matSnackBarSpy.open).toHaveBeenCalledWith(GameStarterErrorMessage.IMPOSSIBLE, ACKNOWLEDGE_TEXT);
    }));

    it('should emit a unselect when a error occurs', fakeAsync(() => {
        gameStarterServiceSpy.startGame.and.rejectWith(new GameStartError('Error', GameStartErrorTypes.HIDDEN));
        component.selectedGame = {} as Game;
        const unselectSpy = spyOn(component.unselect, 'emit');
        component.startGame();
        tick();
        expect(unselectSpy).toHaveBeenCalled();
    }));

    it('should propagate an error that is not related while starting', async () => {
        const error = new Error('Error');
        gameStarterServiceSpy.startGame.and.rejectWith(error);
        component.selectedGame = {} as Game;
        let receivedError;
        try {
            await component.startGame();
        } catch (newError) {
            receivedError = newError;
        }
        expect(receivedError).toBe(error);
    });
});
