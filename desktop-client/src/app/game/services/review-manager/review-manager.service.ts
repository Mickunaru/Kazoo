import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlayersDrawingsPopUpComponent } from '@app/game/components/players-drawings-pop-up/players-drawings-pop-up.component';
import { ReviewPopUpComponent } from '@app/game/components/review-pop-up/review-pop-up.component';
import { ValidityPopUpComponent } from '@app/game/components/validity-pop-up/validity-pop-up.component';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { PlayerAnswerForReview } from '@common/interfaces/player-answer-for-review';
import { PlayerDrawingAnswer } from '@common/interfaces/player-drawing-answer';
import { QuestionAnswer } from '@common/interfaces/question-answer';
import { GameEvent } from '@common/socket-events/game-event';

@Injectable({
    providedIn: 'root',
})
export class ReviewManagerService {
    constructor(
        private readonly gameStateService: GameStateService,
        private readonly webSocketService: WebsocketService,
        private readonly dialog: MatDialog,
    ) {}

    setupManager() {
        this.setupQuestionAnswersEvent();
        this.setupPlayerReviewAnswerEvent();
        this.setupDialogCloseNextQuestion();
        this.setupDialogCloseResultsView();
        this.setupDrawingsEvent();
    }

    resetReviewManager() {
        this.dialog.closeAll();
        this.webSocketService.removeAllListeners(GameEvent.SEND_ANSWERS);
        this.webSocketService.removeAllListeners(GameEvent.SEND_REVIEWS);
        this.webSocketService.removeAllListeners(GameEvent.NEXT_QUESTION);
        this.webSocketService.removeAllListeners(GameEvent.GAME_FINISHED);
        this.webSocketService.removeAllListeners(GameEvent.GET_DRAWINGS);
    }

    private setupQuestionAnswersEvent() {
        this.webSocketService.on(GameEvent.SEND_ANSWERS, (questionAnswer?: QuestionAnswer) => {
            if (!questionAnswer) return;
            this.gameStateService.playerScore = questionAnswer.score;
            this.showAnswerPlayer(questionAnswer);
        });
    }

    private setupDrawingsEvent() {
        this.webSocketService.on(GameEvent.GET_DRAWINGS, (playersDrawings?: PlayerDrawingAnswer[]) => {
            if (!playersDrawings) return;
            this.showDrawings(playersDrawings);
        });
    }

    private setupPlayerReviewAnswerEvent() {
        this.webSocketService.on(GameEvent.SEND_REVIEWS, (playerAnswers?: PlayerAnswerForReview[]) => {
            if (playerAnswers) {
                this.showReviewOpenEndedAnswersPopUp(playerAnswers);
            }
        });
    }

    private setupDialogCloseNextQuestion() {
        this.webSocketService.on(GameEvent.NEXT_QUESTION, () => {
            this.dialog.closeAll();
        });
    }

    private setupDialogCloseResultsView() {
        this.webSocketService.once(GameEvent.GAME_FINISHED, () => {
            this.dialog.closeAll();
        });
    }

    private showAnswerPlayer(correctAnswers: QuestionAnswer) {
        const dialogRef = this.dialog.open(ValidityPopUpComponent, {
            disableClose: true,
        });
        dialogRef.componentInstance.setupPopUp(correctAnswers, this.gameStateService.isEliminated);
    }

    private showDrawings(playersDrawings: PlayerDrawingAnswer[]) {
        const dialogRef = this.dialog.open(PlayersDrawingsPopUpComponent, {
            disableClose: true,
        });
        dialogRef.componentInstance.setupPopUp(playersDrawings);
    }

    private showReviewOpenEndedAnswersPopUp(playerAnswers: PlayerAnswerForReview[]) {
        const dialogRef = this.dialog.open(ReviewPopUpComponent, {
            disableClose: true,
        });
        dialogRef.componentInstance.setPopUp(playerAnswers);
    }
}
