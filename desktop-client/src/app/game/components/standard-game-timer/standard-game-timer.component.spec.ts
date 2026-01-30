import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameManagerService } from '@app/game/services/game-manager/game-manager.service';
import { TimerService } from '@app/game/services/timer/timer.service';
import { TimerType } from '@common/enum/timer-type';
import { Subject } from 'rxjs';
import { StandardGameTimerComponent } from './standard-game-timer.component';

describe('StandardGameTimerComponent', () => {
    let component: StandardGameTimerComponent;
    let fixture: ComponentFixture<StandardGameTimerComponent>;
    let gameManagerServiceSpy: jasmine.SpyObj<GameManagerService>;
    let timerServiceStub: TimerService;

    beforeEach(() => {
        gameManagerServiceSpy = jasmine.createSpyObj('GameManagerService', ['submitAnswer']);
        gameManagerServiceSpy.submitAnswer.and.stub();
        timerServiceStub = {
            time: 0,
            timerEnded: new Subject<void>(),
            currentType: undefined,
        } as TimerService;
        TestBed.configureTestingModule({
            declarations: [StandardGameTimerComponent],
            imports: [],
            providers: [
                {
                    provide: TimerService,
                    useValue: timerServiceStub,
                },
                {
                    provide: GameManagerService,
                    useValue: gameManagerServiceSpy,
                },
            ],
        });
        fixture = TestBed.createComponent(StandardGameTimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should react to timer ended event by submitting', () => {
        timerServiceStub.currentType = TimerType.AnswerDuration;
        timerServiceStub.timerEnded.next();
        expect(gameManagerServiceSpy.submitAnswer).toHaveBeenCalled();
    });

    it('should react to timer ended event by not submitting if the timer type is not AnswerDuration', () => {
        timerServiceStub.currentType = TimerType.GameStart;
        timerServiceStub.timerEnded.next();
        timerServiceStub.currentType = TimerType.QuestionTransition;
        timerServiceStub.timerEnded.next();
        expect(gameManagerServiceSpy.submitAnswer).not.toHaveBeenCalled();
    });
});
