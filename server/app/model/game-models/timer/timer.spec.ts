import { TIMES_TIMER_CALLED } from '@app/constants/test-utils';
import { PANIC_INCREMENT } from '@app/constants/time-constants';
import { INTERVAL_INCREMENT } from '@common/constants/waiting-constants';
import { Subscription } from 'rxjs';
import { Timer } from './timer';

describe('Timer', () => {
    let timer: Timer;

    beforeEach(async () => {
        timer = new Timer();
    });

    afterEach(() => {
        timer['intervalSubscription']?.unsubscribe();
    });

    it('should be defined', () => {
        expect(timer).toBeDefined();
    });

    it('should start countdown', () => {
        timer.startCountdown(INTERVAL_INCREMENT);
        expect(timer.time).toBe(INTERVAL_INCREMENT);
    });

    it('should not call onTickAction if undefined', () => {
        timer.startCountdown(INTERVAL_INCREMENT);
        expect(timer['onTickAction']).toBeUndefined();
    });

    it('should call ticks observers a few times', () => {
        const tickSpy = jest.fn();
        timer.tick.subscribe(tickSpy);
        jest.useFakeTimers();
        timer.startCountdown(TIMES_TIMER_CALLED);
        jest.advanceTimersByTime(INTERVAL_INCREMENT * TIMES_TIMER_CALLED);
        expect(tickSpy).toHaveBeenCalledTimes(TIMES_TIMER_CALLED + 1);
        jest.useRealTimers();
    });

    it('should call stopCountdown and end observers', () => {
        const endSpy = jest.fn();
        timer.end.subscribe(endSpy);
        jest.useFakeTimers();
        const spy = jest.spyOn(timer, 'stopCountdown');
        timer.startCountdown(0);
        jest.advanceTimersByTime(INTERVAL_INCREMENT);
        expect(spy).toHaveBeenCalled();
        expect(endSpy).toHaveBeenCalledTimes(1);
        jest.useRealTimers();
    });

    it('should resume countdown', () => {
        const startSpy = jest.spyOn(timer, 'startCountdown');
        timer.resumeCountdown();
        expect(startSpy).toHaveBeenCalledWith(timer.time, INTERVAL_INCREMENT, false);
    });

    it('should stop countdown', () => {
        timer.startCountdown(INTERVAL_INCREMENT);
        timer.stopCountdown();
        expect(timer['intervalSubscription']?.closed).toBe(true);
    });

    it('should not change increment if timer is Panicked', () => {
        const startSpy = jest.spyOn(timer, 'startCountdown');
        timer.isPanicked = true;
        timer.togglePanicMode();
        expect(startSpy).toHaveBeenCalledWith(timer.time);
    });

    it('should change increment if timer is not Panicked', () => {
        const startSpy = jest.spyOn(timer, 'startCountdown');
        timer.isPanicked = false;
        timer.togglePanicMode();
        expect(startSpy).toHaveBeenCalledWith(timer.time, PANIC_INCREMENT);
    });

    it('should unsubscribe and reset timer', () => {
        timer['intervalSubscription'] = { unsubscribe: jest.fn() } as unknown as Subscription;
        timer.stopCountdown();
        expect(timer['intervalSubscription'].unsubscribe).toHaveBeenCalled();
        expect(timer.time).toBeUndefined();
    });
});
