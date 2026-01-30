import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { TimerService } from '@app/game/services/timer/timer.service';
import { AppMaterialModule } from '@app/modules/material.module';
import { S3Service } from '@app/shared/services/s3/s3.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { TimerType } from '@common/enum/timer-type';
import { GameEvent } from '@common/socket-events/game-event';
import { Subject } from 'rxjs';
import { GameMasterPageComponent } from './game-master-page.component';

describe('GameMasterPageComponent', () => {
    let component: GameMasterPageComponent;
    let fixture: ComponentFixture<GameMasterPageComponent>;
    let webSocketServiceSpy: jasmine.SpyObj<WebsocketService>;
    let timerServiceStub: TimerService;
    let s3ServiceStub: S3Service;
    let gameStateService: jasmine.SpyObj<GameStateService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;

    beforeEach(() => {
        webSocketServiceSpy = jasmine.createSpyObj('WebsocketService', ['send', 'on', 'removeAllListeners']);
        gameStateService = jasmine.createSpyObj('GameStateService', ['']);
        timerServiceStub = {
            timerStarted: new Subject(),
            timerEnded: new Subject(),
        } as TimerService;
        s3ServiceStub = jasmine.createSpyObj('S3Service', ['deleteImage']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        gameStateServiceSpy = jasmine.createSpyObj('GameStateService', ['questionType', 'playersAwsKeys', 'currentQuestion']);

        TestBed.configureTestingModule({
            declarations: [GameMasterPageComponent],
            providers: [
                { provide: WebsocketService, useValue: webSocketServiceSpy },
                { provide: TimerService, useValue: timerServiceStub },
                { provide: GameStateService, useValue: gameStateService },
                { provide: Router, useValue: routerSpy },
                { provide: S3Service, useValue: s3ServiceStub },
                { provide: GameStateService, useValue: gameStateServiceSpy },
            ],
            imports: [HttpClientTestingModule, AppMaterialModule],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(GameMasterPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set isAnswerDuration to true when answer timer starts', () => {
        component.ngOnInit();
        component.isAnswerDuration = false;
        timerServiceStub.timerStarted.next(TimerType.AnswerDuration);
        expect(component.isAnswerDuration).toBeTrue();
    });

    it('should not set isAnswerDuration to true when other timers starts', () => {
        component.ngOnInit();
        component.isAnswerDuration = false;
        timerServiceStub.timerStarted.next(TimerType.QuestionTransition);
        timerServiceStub.timerStarted.next(TimerType.GameStart);
        expect(component.isAnswerDuration).toBeFalse();
    });

    it('should set isAnswerDuration to false when timer ends', () => {
        component.ngOnInit();
        component.isAnswerDuration = true;
        timerServiceStub.timerEnded.next();
        expect(component.isAnswerDuration).toBeFalse();
    });

    it('should remove listeners on destroy', () => {
        spyOn(component['startSubscription'], 'unsubscribe').and.stub();
        spyOn(component['endSubscription'], 'unsubscribe').and.stub();
        component.ngOnDestroy();
        expect(component['startSubscription'].unsubscribe).toHaveBeenCalled();
        expect(component['endSubscription'].unsubscribe).toHaveBeenCalled();
    });

    it('should set isAnswerDuration to false when all players have submitted', () => {
        webSocketServiceSpy.on.and.callFake((event, action) => {
            expect(event).toBe(GameEvent.SEND_ANSWERS);
            action();
        });
        expect(component.isAnswerDuration).toBeTrue();
        component['setupAllPlayersSubmitted']();
        expect(component.isAnswerDuration).toBeFalse();
    });

    it('should send an event to load next question', () => {
        component.loadNextQuestion();
        expect(webSocketServiceSpy.send).toHaveBeenCalledWith(GameEvent.NEXT_QUESTION);
    });
});
