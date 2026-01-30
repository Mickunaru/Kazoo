import { Injectable } from '@angular/core';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { TimerType } from '@common/enum/timer-type';
import { TimerEvent } from '@common/socket-events/timer-event';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    time: number = 0;
    isTimerActivated: boolean = false;
    isPanicMode: boolean = false;
    timerEnded = new Subject<void>();
    timerStarted = new Subject<TimerType | undefined>();
    currentType: TimerType | undefined = TimerType.GameStart;

    constructor(private readonly webSocketService: WebsocketService) {}

    setTimerListeners() {
        this.removeTimerListeners();
        this.setEventListeners();
    }

    removeTimerListeners() {
        this.webSocketService.removeAllListeners(TimerEvent.PANIC_TIMER);
        this.webSocketService.removeAllListeners(TimerEvent.TIMER_TICK);
        this.webSocketService.removeAllListeners(TimerEvent.TIMER_ENDED);
        this.webSocketService.removeAllListeners(TimerEvent.TIMER_STARTED);
    }

    pauseCountdown() {
        this.isTimerActivated = false;
        this.webSocketService.send(TimerEvent.STOP_TIMER);
    }

    enterPanicMode() {
        this.isTimerActivated = true;
        this.webSocketService.send(TimerEvent.PANIC_TIMER);
    }

    resumeCountdown() {
        this.webSocketService.send(TimerEvent.RESUME_TIMER);
    }

    resetTimer() {
        this.isTimerActivated = false;
        this.time = 0;
        this.isPanicMode = false;
        this.currentType = undefined;
        this.resetSubjects();
    }

    resetSubjects() {
        this.timerStarted.complete();
        this.timerEnded.complete();
        this.timerEnded = new Subject<void>();
        this.timerStarted = new Subject<TimerType | undefined>();
    }

    private setEventListeners() {
        this.webSocketService.on<TimerType>(TimerEvent.TIMER_STARTED, (data?: TimerType) => {
            this.isTimerActivated = true;
            this.isPanicMode = false;
            this.currentType = data;
            this.timerStarted.next(data);
        });
        this.webSocketService.on<void>(TimerEvent.TIMER_ENDED, () => {
            this.isTimerActivated = false;
            this.isPanicMode = false;
            this.timerEnded.next();
        });
        this.webSocketService.on<number>(TimerEvent.TIMER_TICK, (time?: number) => {
            this.isTimerActivated = true;
            if (time !== undefined) this.time = time;
        });
        this.webSocketService.on<void>(TimerEvent.PANIC_TIMER, () => {
            this.isPanicMode = true;
        });
    }
}
