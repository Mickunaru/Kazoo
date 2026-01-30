import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PageUrl } from '@app/enum/page-url';
import { LeaveGameDialogComponent } from '@app/game/components/leave-game-dialog/leave-game-dialog.component';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { TimerService } from '@app/game/services/timer/timer.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { PANIC_ACTIVATION_CUTOFF, PANIC_ACTIVATION_CUTOFF_REVIEWABLE_QUESTION } from '@common/constants/game-constants';
import { QuestionType } from '@common/enum/question-type';
import { TimerType } from '@common/enum/timer-type';
import { GameEvent } from '@common/socket-events/game-event';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-master-page',
    templateUrl: './game-master-page.component.html',
    styleUrls: ['./game-master-page.component.scss'],
})
export class GameMasterPageComponent implements OnInit, OnDestroy {
    questionTypeEnum = QuestionType;
    isAnswerDuration: boolean = true;
    isProcessing: boolean = false;
    private startSubscription: Subscription;
    private endSubscription: Subscription;

    // eslint-disable-next-line max-params
    constructor(
        private readonly webSocketService: WebsocketService,
        readonly gameStateService: GameStateService,
        readonly timerService: TimerService,
        private readonly dialog: MatDialog,
        private readonly router: Router,
    ) {}

    ngOnInit() {
        this.setupAllPlayersSubmitted();
        this.endSubscription = this.timerService.timerEnded.subscribe(() => {
            this.isAnswerDuration = false;
        });
        this.startSubscription = this.timerService.timerStarted.subscribe((data?: TimerType) => {
            if (data !== TimerType.AnswerDuration) return;
            this.isAnswerDuration = true;
            this.isProcessing = false;
        });
    }

    ngOnDestroy() {
        this.startSubscription?.unsubscribe();
        this.endSubscription?.unsubscribe();
        this.webSocketService.removeAllListeners(GameEvent.SEND_ANSWERS);
    }

    loadNextQuestion() {
        this.isProcessing = true;
        if (this.gameStateService.questionType === QuestionType.Drawing) {
            this.gameStateService.playersAwsKeys = [];
        }
        this.webSocketService.send(GameEvent.NEXT_QUESTION);
    }

    disablePanicTimer() {
        let enoughTimeToActivate;
        switch (this.gameStateService.questionType) {
            case QuestionType.MultiChoice:
            case QuestionType.Estimation:
                enoughTimeToActivate = this.timerService.time >= PANIC_ACTIVATION_CUTOFF;
                break;
            case QuestionType.Drawing:
            case QuestionType.OpenEnded:
                enoughTimeToActivate = this.timerService.time >= PANIC_ACTIVATION_CUTOFF_REVIEWABLE_QUESTION;
                break;
        }

        return this.timerService.isPanicMode || !this.isAnswerDuration || !enoughTimeToActivate;
    }

    showEndGameDialog(): void {
        const dialogRef = this.dialog.open(LeaveGameDialogComponent, {
            data: {
                title: 'Quitter ?',
                description: 'Êtes-vous certain de vouloir mettre fin à la partie ?',
                cancelText: 'Annuler',
                confirmText: 'Confirmer',
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.router.navigate([`/${PageUrl.APP_PREFIX}/${PageUrl.HOME}`]);
            }
        });
    }

    private setupAllPlayersSubmitted() {
        this.webSocketService.on(GameEvent.SEND_ANSWERS, () => {
            this.isAnswerDuration = false;
        });
    }
}
