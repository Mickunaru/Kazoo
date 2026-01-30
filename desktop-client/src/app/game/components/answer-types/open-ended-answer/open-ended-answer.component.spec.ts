import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { GameManagerService } from '@app/game/services/game-manager/game-manager.service';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { SubmitManagerService } from '@app/game/services/submit-manager/submit-manager.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { OpenEndedAnswerComponent } from './open-ended-answer.component';

describe('OpenEndedAnswerComponent', () => {
    let component: OpenEndedAnswerComponent;
    let fixture: ComponentFixture<OpenEndedAnswerComponent>;
    let gameManagerServiceSpy: jasmine.SpyObj<GameManagerService>;
    let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;
    let websocketServiceSpy: jasmine.SpyObj<WebsocketService>;
    let submitManagerServiceSpy: jasmine.SpyObj<SubmitManagerService>;
    let loadNextQuestionMock: BehaviorSubject<void>;

    beforeEach(() => {
        loadNextQuestionMock = new BehaviorSubject<void>(undefined);
        websocketServiceSpy = jasmine.createSpyObj('WebsocketService', ['send']);
        gameStateServiceSpy = jasmine.createSpyObj('GameStateService', ['isMultipleChoice'], { duration: 0 });
        gameManagerServiceSpy = jasmine.createSpyObj('GameManagerService', ['submitAnswer', 'openEndedAnswerWasChanged'], {
            loadNextQuestionObservable: loadNextQuestionMock.asObservable(),
            isSubmitted: false,
        });
        submitManagerServiceSpy = jasmine.createSpyObj('SubmitManagerService', ['openEndedAnswerWasChanged']);
        TestBed.configureTestingModule({
            declarations: [OpenEndedAnswerComponent, CdkTextareaAutosize],
            providers: [
                {
                    provide: GameStateService,
                    useValue: gameStateServiceSpy,
                },
                {
                    provide: GameManagerService,
                    useValue: gameManagerServiceSpy,
                },
                {
                    provide: WebsocketService,
                    useValue: websocketServiceSpy,
                },
                {
                    provide: SubmitManagerService,
                    useValue: submitManagerServiceSpy,
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(OpenEndedAnswerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        component['gameStateSubscription']?.unsubscribe();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should setup load next question', () => {
        spyOn(component, 'setupLoadNextQuestion' as never).and.stub();
        component.ngOnInit();
        expect(component['setupLoadNextQuestion']).toHaveBeenCalled();
    });

    it('should remove subscription and timeout', () => {
        component['gameStateSubscription'] = new Subscription();
        const stateSpy = spyOn(component['gameStateSubscription'], 'unsubscribe' as never).and.stub();
        component.ngOnDestroy();
        expect(stateSpy).toHaveBeenCalled();
    });
});
