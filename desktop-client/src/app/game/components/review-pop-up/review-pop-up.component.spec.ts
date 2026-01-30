import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { PLAYER_OPEN_ENDED_ANSWERS, PLAYER_REVIEWS, SCORE_MOCK } from '@app/constants/test-utils';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { RoomService } from '@app/home/services/room/room.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { QuestionType } from '@common/enum/question-type';
import { GameEvent } from '@common/socket-events/game-event';
import { ReviewPopUpComponent } from './review-pop-up.component';

describe('ReviewOpenEndedComponent', () => {
    let component: ReviewPopUpComponent;
    let fixture: ComponentFixture<ReviewPopUpComponent>;
    let webSocketServiceSpy: jasmine.SpyObj<WebsocketService>;
    let reviewOpenEndedDialogRef: jasmine.SpyObj<MatDialog>;
    let roomServiceSpy: jasmine.SpyObj<RoomService>;
    let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;

    beforeEach(() => {
        webSocketServiceSpy = jasmine.createSpyObj('WebsocketService', ['send']);
        reviewOpenEndedDialogRef = jasmine.createSpyObj('MatDialog', ['closeAll']);
        gameStateServiceSpy = jasmine.createSpyObj('GameStateService', [''], { questionType: QuestionType.Drawing });
        roomServiceSpy = jasmine.createSpyObj('RoomService', ['']);
        TestBed.configureTestingModule({
            declarations: [ReviewPopUpComponent],
            providers: [
                { provide: WebsocketService, useValue: webSocketServiceSpy },
                { provide: MatDialog, useValue: reviewOpenEndedDialogRef },
                { provide: RoomService, useValue: roomServiceSpy },
                { provide: GameStateService, useValue: gameStateServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(ReviewPopUpComponent);
        component = fixture.componentInstance;
        component.answers = PLAYER_OPEN_ENDED_ANSWERS;
        component.answerIndex = 0;
        component.playerReviews = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should setup player open-ended questions answers', () => {
        component.setPopUp(PLAYER_OPEN_ENDED_ANSWERS);
        expect(component.answers).toBe(PLAYER_OPEN_ENDED_ANSWERS);
    });

    it('should save score for player', () => {
        spyOn(component, 'sendScoreToPlayers' as never).and.stub();
        component.answers = PLAYER_OPEN_ENDED_ANSWERS;
        component.saveScore(SCORE_MOCK);
        expect(component.answerIndex).toBe(1);
        expect(component.playerReviews).toEqual([{ percentageGiven: SCORE_MOCK, name: PLAYER_OPEN_ENDED_ANSWERS[0].name }]);
    });

    it('should send score to player if all answers were reviewed', () => {
        spyOn(component, 'sendScoreToPlayers' as never).and.stub();
        component.answers = PLAYER_OPEN_ENDED_ANSWERS;
        component.answerIndex = PLAYER_OPEN_ENDED_ANSWERS.length - 1;
        component.saveScore(SCORE_MOCK);
        expect(component['sendScoreToPlayers']).toHaveBeenCalled();
    });

    it('should send score to player', () => {
        webSocketServiceSpy.send.and.stub();
        reviewOpenEndedDialogRef.closeAll.and.stub();
        component.playerReviews = PLAYER_REVIEWS;
        component['sendScoreToPlayers']();
        expect(webSocketServiceSpy.send).toHaveBeenCalledWith(GameEvent.SEND_REVIEWS, { list: PLAYER_REVIEWS });
        expect(reviewOpenEndedDialogRef.closeAll).toHaveBeenCalled();
    });
});
