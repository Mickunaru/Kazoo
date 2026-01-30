import { TestBed } from '@angular/core/testing';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { TimerType } from '@common/enum/timer-type';
import { SocketEvent } from '@common/socket-events/socket-event';
import { TimerEvent } from '@common/socket-events/timer-event';
import { Subject } from 'rxjs';
import { TimerService } from './timer.service';
describe('TimerService', () => {
    let service: TimerService;
    let websocketServiceMock: jasmine.SpyObj<WebsocketService>;
    let eventCallbacks: Map<SocketEvent, ((data?: unknown) => void)[]>;

    beforeEach(() => {
        websocketServiceMock = jasmine.createSpyObj('WebsocketService', ['send', 'connect', 'on', 'removeAllListeners', 'connectionEvent']);
        websocketServiceMock.connectionEvent = new Subject<void>();

        eventCallbacks = new Map();
        websocketServiceMock.on.and.callFake((event: SocketEvent, callback: () => void) => {
            if (eventCallbacks.has(event)) {
                eventCallbacks.get(event)?.push(callback);
            } else {
                eventCallbacks.set(event, [callback]);
            }
        });

        TestBed.configureTestingModule({
            providers: [{ provide: WebsocketService, useValue: websocketServiceMock }],
        });
        service = TestBed.inject(TimerService);
        service['setEventListeners']();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should update time on tick', () => {
        service.isTimerActivated = false;
        service.time = 0;
        const tick = 5;
        eventCallbacks.get(TimerEvent.TIMER_TICK)?.forEach((callback) => callback(tick));
        expect(service.time).toBe(tick);
        expect(service.isTimerActivated).toBeTrue();
    });

    it('should react to timer end by disabling the timer', () => {
        eventCallbacks.get(TimerEvent.TIMER_ENDED)?.forEach((callback) => callback());
        expect(service.isTimerActivated).toBeFalse();
    });

    it('should react to timer end by advising observer', () => {
        const observerSpy = jasmine.createSpy();
        service.timerEnded.subscribe(observerSpy);
        eventCallbacks.get(TimerEvent.TIMER_ENDED)?.forEach((callback) => callback());
        expect(observerSpy).toHaveBeenCalled();
    });

    it('should react to timer start by enabling the timer', () => {
        eventCallbacks.get(TimerEvent.TIMER_STARTED)?.forEach((callback) => callback());
        expect(service.isTimerActivated).toBeTrue();
    });

    it('should react to timer start by setting the type', () => {
        service.currentType = TimerType.QuestionTransition as TimerType;
        eventCallbacks.get(TimerEvent.TIMER_STARTED)?.forEach((callback) => callback(TimerType.AnswerDuration));
        expect(service.currentType).toBe(TimerType.AnswerDuration);
    });

    it('should react to timer start by advising observer', () => {
        service.currentType = TimerType.QuestionTransition as TimerType;
        const observerSpy = jasmine.createSpy();
        service.timerStarted.subscribe(observerSpy);
        eventCallbacks.get(TimerEvent.TIMER_STARTED)?.forEach((callback) => callback(TimerType.AnswerDuration));
        expect(observerSpy).toHaveBeenCalledWith(TimerType.AnswerDuration);
    });

    it('should set panic mode on panic', () => {
        service.isPanicMode = false;
        eventCallbacks.get(TimerEvent.PANIC_TIMER)?.forEach((callback) => callback());
        expect(service.isPanicMode).toBeTrue();
    });

    it('should reset properly when a new socket is created', () => {
        service.removeTimerListeners();
        expect(websocketServiceMock.removeAllListeners).toHaveBeenCalledWith(TimerEvent.TIMER_TICK);
        expect(websocketServiceMock.removeAllListeners).toHaveBeenCalledWith(TimerEvent.PANIC_TIMER);
        expect(websocketServiceMock.removeAllListeners).toHaveBeenCalledWith(TimerEvent.TIMER_ENDED);
        expect(websocketServiceMock.removeAllListeners).toHaveBeenCalledWith(TimerEvent.TIMER_STARTED);
    });

    it('should pause countdown', () => {
        service.pauseCountdown();
        expect(websocketServiceMock.send).toHaveBeenCalledWith(TimerEvent.STOP_TIMER);
        expect(service.isTimerActivated).toBeFalse();
    });

    it('should enter panic mode', () => {
        service.enterPanicMode();
        expect(service.isTimerActivated).toBeTrue();
        expect(websocketServiceMock.send).toHaveBeenCalledWith(TimerEvent.PANIC_TIMER);
        expect(service.isTimerActivated).toBeTrue();
    });

    it('should resume countdown', () => {
        service.resumeCountdown();
        expect(websocketServiceMock.send).toHaveBeenCalledWith(TimerEvent.RESUME_TIMER);
    });
});
