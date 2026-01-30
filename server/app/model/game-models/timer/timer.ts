import { PANIC_INCREMENT } from '@app/constants/time-constants';
import { INTERVAL_INCREMENT } from '@common/constants/waiting-constants';
import { Subject, Subscription, interval } from 'rxjs';

export class Timer {
    time: number;
    tick = new Subject<number>();
    end = new Subject<void>();
    isPanicked: boolean = false;
    private resumeIncrement: number = INTERVAL_INCREMENT;
    private intervalSubscription: Subscription | undefined;

    startCountdown(countdownSeconds: number, increment: number = INTERVAL_INCREMENT, isPanicked: boolean = false) {
        this.isPanicked = isPanicked;
        this.time = countdownSeconds;
        this.resumeIncrement = increment;
        this.tick.next(countdownSeconds);
        this.stopCountdown();
        this.intervalSubscription = interval(increment).subscribe(() => {
            this.time--;
            this.tick.next(this.time);
            if (this.time <= 0) {
                this.stopCountdown();
                this.end.next();
            }
        });
    }

    stopCountdown() {
        this.intervalSubscription?.unsubscribe();
    }

    resumeCountdown() {
        this.startCountdown(this.time, this.resumeIncrement, this.isPanicked);
    }

    togglePanicMode() {
        if (this.isPanicked) {
            this.stopCountdown();
            this.startCountdown(this.time);
        } else {
            this.stopCountdown();
            this.startCountdown(this.time, PANIC_INCREMENT);
        }
        this.isPanicked = !this.isPanicked;
    }

    destroy() {
        this.stopCountdown();
        this.tick.complete();
        this.end.complete();
    }
}
