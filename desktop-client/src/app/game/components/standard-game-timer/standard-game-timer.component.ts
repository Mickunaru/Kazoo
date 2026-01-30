import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameManagerService } from '@app/game/services/game-manager/game-manager.service';
import { TimerService } from '@app/game/services/timer/timer.service';
import { TimerType } from '@common/enum/timer-type';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-standard-game-timer',
    templateUrl: './standard-game-timer.component.html',
    styleUrls: ['./standard-game-timer.component.scss'],
})
export class StandardGameTimerComponent implements OnInit, OnDestroy {
    timerType = TimerType;
    private submitSubscription: Subscription;

    constructor(
        readonly timerService: TimerService,
        private readonly gameManagerService: GameManagerService,
    ) {}

    ngOnInit() {
        this.submitSubscription = this.timerService.timerEnded.subscribe(() => {
            if (this.timerService.currentType === TimerType.AnswerDuration) this.gameManagerService.submitAnswer();
        });
    }

    ngOnDestroy() {
        this.submitSubscription?.unsubscribe();
    }
}
