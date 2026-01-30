import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PLAYER_OPEN_ENDED_ANSWERS } from '@app/constants/test-utils';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { PlayerAnswerForReview } from '@common/interfaces/player-answer-for-review';
import { GameEvent } from '@common/socket-events/game-event';
import { ReviewManagerService } from './review-manager.service';

describe('ReviewManagerService', () => {
    let service: ReviewManagerService;
    let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;
    let webSocketServiceSpy: jasmine.SpyObj<WebsocketService>;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    // let answerPopUpSpy: jasmine.SpyObj<MatDialogRef<ValidityPopUpComponent, unknown>>;
    // let reviewOpenEndedPopUpSpy: jasmine.SpyObj<MatDialogRef<ReviewOpenEndedComponent, unknown>>;

    beforeEach(() => {
        gameStateServiceSpy = jasmine.createSpyObj('GameStateService', ['increasePlayerScoreOpenEnded', 'increasePlayerScore']);
        webSocketServiceSpy = jasmine.createSpyObj('WebsocketService', ['on', 'once', 'removeAllListeners']);
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
        // answerPopUpSpy = jasmine.createSpyObj('ValidityPopUpComponent', [''], {
        //     componentInstance: { setupPopUp: jasmine.createSpy(), setupPopUpOpenEnded: jasmine.createSpy() },
        // });
        // reviewOpenEndedPopUpSpy = jasmine.createSpyObj('ReviewOpenEndedComponent', [''], { componentInstance: { setPopUp: jasmine.createSpy() } });
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatDialogModule],
            providers: [
                { provide: GameStateService, useValue: gameStateServiceSpy },
                { provide: WebsocketService, useValue: webSocketServiceSpy },
                { provide: MatDialog, useValue: matDialogSpy },
            ],
        });
        service = TestBed.inject(ReviewManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should setup all listeners for websocket', () => {
        const CALL_TIMES_ON = 4;
        const CALL_TIMES_ONCE = 1;
        webSocketServiceSpy.on.and.stub();
        webSocketServiceSpy.once.and.stub();
        service.setupManager();
        expect(webSocketServiceSpy.on).toHaveBeenCalledTimes(CALL_TIMES_ON);
        expect(webSocketServiceSpy.once).toHaveBeenCalledTimes(CALL_TIMES_ONCE);
    });

    // it('should setup question answers listener', () => {
    //     gameStateServiceSpy.increasePlayerScore.and.stub();
    //     spyOn(service, 'showAnswerPlayer' as never).and.stub();
    //     webSocketServiceSpy.on.and.callFake((socketEvent: GameEvent, action) => {
    //         expect(socketEvent).toBe(GameEvent.SEND_ANSWERS);
    //         const actionTyped = action as (data: CorrectAnswerDto) => void;
    //         actionTyped(CORRECT_ANSWERS_MOCK);
    //     });
    //     service['setupQuestionAnswersEvent']();
    //     expect(gameStateServiceSpy.increasePlayerScore).toHaveBeenCalledWith(CORRECT_ANSWERS_MOCK);
    //     expect(service['showAnswerPlayer']).toHaveBeenCalledWith(CORRECT_ANSWERS_MOCK);
    // });

    // it('should setup OpenEnded score listener', () => {
    //     gameStateServiceSpy.increasePlayerScoreOpenEnded.and.stub();
    //     spyOn(service, 'showAnswerPlayerOpenEnded' as never).and.stub();
    //     webSocketServiceSpy.on.and.callFake((socketEvent: GameEvent, action) => {
    //         expect(socketEvent).toBe(GameEvent.SEND_REVIEWS);
    //         const actionTyped = action as (data: number) => void;
    //         actionTyped(SCORE_MOCK);
    //     });
    //     service['setupSendAllReviewsOpenEndedEvent']();
    //     expect(gameStateServiceSpy.increasePlayerScoreOpenEnded).toHaveBeenCalledWith(SCORE_MOCK);
    //     expect(service['showAnswerPlayerOpenEnded']).toHaveBeenCalledWith(SCORE_MOCK);
    // });

    it('should setup player review event', () => {
        spyOn(service, 'showReviewOpenEndedAnswersPopUp' as never).and.stub();
        webSocketServiceSpy.on.and.callFake((socketEvent: GameEvent, action) => {
            expect(socketEvent).toBe(GameEvent.SEND_REVIEWS);
            const actionTyped = action as (data: PlayerAnswerForReview[]) => void;
            actionTyped(PLAYER_OPEN_ENDED_ANSWERS);
        });
        service['setupPlayerReviewAnswerEvent']();
        expect(service['showReviewOpenEndedAnswersPopUp']).toHaveBeenCalledWith(PLAYER_OPEN_ENDED_ANSWERS);
    });

    it('should setup dialog close next question', () => {
        matDialogSpy.closeAll.and.stub();
        webSocketServiceSpy.on.and.callFake((socketEvent: GameEvent, action) => {
            expect(socketEvent).toBe(GameEvent.NEXT_QUESTION);
            action();
        });
        service['setupDialogCloseNextQuestion']();
        expect(matDialogSpy.closeAll).toHaveBeenCalled();
    });

    it('should setup dialog close results view', () => {
        matDialogSpy.closeAll.and.stub();
        webSocketServiceSpy.once.and.callFake((socketEvent: GameEvent, action) => {
            expect(socketEvent).toBe(GameEvent.GAME_FINISHED);
            action();
        });
        service['setupDialogCloseResultsView']();
        expect(matDialogSpy.closeAll).toHaveBeenCalled();
    });

    // it('should setup and open dialog when showAnswer', () => {
    //     matDialogSpy.open.and.returnValue(answerPopUpSpy);
    //     service['showAnswerPlayer'](CORRECT_ANSWERS_MOCK);
    //     expect(matDialogSpy.open).toHaveBeenCalled();
    //     expect(answerPopUpSpy.componentInstance.setupPopUp).toHaveBeenCalledWith(CORRECT_ANSWERS_MOCK);
    // });

    // it('should setup and open dialog when showAnswer OpenEnded', () => {
    //     matDialogSpy.open.and.returnValue(answerPopUpSpy);
    //     service['showAnswerPlayerOpenEnded'](SCORE_MOCK);
    //     expect(matDialogSpy.open).toHaveBeenCalled();
    //     expect(answerPopUpSpy.componentInstance.setupPopUpOpenEnded).toHaveBeenCalledWith(SCORE_MOCK);
    // });

    // it('should setup and open dialog when show review answers pop-up', () => {
    //     matDialogSpy.open.and.returnValue(reviewOpenEndedPopUpSpy);
    //     service['showReviewAnswersPopUp'](PLAYER_OPEN_ENDED_ANSWERS);
    //     expect(matDialogSpy.open).toHaveBeenCalled();
    //     expect(reviewOpenEndedPopUpSpy.componentInstance.setPopUp).toHaveBeenCalledWith(PLAYER_OPEN_ENDED_ANSWERS);
    // });

    it('should close all dialogs', () => {
        matDialogSpy.closeAll.and.stub();
        service['resetReviewManager']();
        expect(matDialogSpy.closeAll).toHaveBeenCalled();
    });
});
