import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACK_CLOSE_ICON_ACTION } from '@app/constants/snack-bar-constants';
import { SNACK_BAR_DURATION } from '@app/constants/time-constants';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { QuestionType } from '@common/enum/question-type';
import { GameEvent } from '@common/socket-events/game-event';

@Injectable({
    providedIn: 'root',
})
export class PlayerReviewSnackbarService {
    constructor(
        private readonly gameStateService: GameStateService,
        private readonly webSocketService: WebsocketService,
        private readonly snackBar: MatSnackBar,
    ) {}

    setupListener(): void {
        this.webSocketService.on(GameEvent.REVIEW_IN_PROGRESS, () => {
            const isReviewType =
                this.gameStateService.currentQuestion?.type &&
                (this.gameStateService.currentQuestion.type === QuestionType.OpenEnded ||
                    this.gameStateService.currentQuestion.type === QuestionType.Drawing);

            if (isReviewType) {
                this.snackBar.open('Correction en cours...', SNACK_CLOSE_ICON_ACTION, {
                    duration: SNACK_BAR_DURATION,
                    panelClass: ['error-snackbar'],
                });
            }
        });
    }

    removeListener(): void {
        this.webSocketService.removeAllListeners(GameEvent.REVIEW_IN_PROGRESS);
    }
}
