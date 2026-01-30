import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { PlayerReviewSnackbarService } from './player-review-snackbar-service.service';

describe('PlayerReviewSnackbarServiceService', () => {
    let service: PlayerReviewSnackbarService;
    let webSocketServiceSpy: jasmine.SpyObj<WebsocketService>;
    let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        webSocketServiceSpy = jasmine.createSpyObj('WebsocketService', ['on', 'removeAllListeners']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        gameStateServiceSpy = jasmine.createSpyObj('GameStateService', ['currentQuestion']);

        TestBed.configureTestingModule({
            providers: [
                { provide: WebsocketService, useValue: webSocketServiceSpy },
                { provide: GameStateService, useValue: gameStateServiceSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
            ],
        });
        service = TestBed.inject(PlayerReviewSnackbarService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
