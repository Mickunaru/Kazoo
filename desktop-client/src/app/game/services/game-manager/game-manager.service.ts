import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PageUrl } from '@app/enum/page-url';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { PrizeService } from '@app/game/services/prize/prize.service';
import { ReviewManagerService } from '@app/game/services/review-manager/review-manager.service';
import { SubmitManagerService } from '@app/game/services/submit-manager/submit-manager.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { RoomDestructionReason } from '@common/enum/room-destruction-reason';
import { PlayerInfo } from '@common/interfaces/player-info';
import { Question } from '@common/interfaces/question';
import { GameEvent } from '@common/socket-events/game-event';
import { RoomEvent } from '@common/socket-events/room-event';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameManagerService {
    private loadNextQuestionSubject: BehaviorSubject<void> = new BehaviorSubject<void>(undefined);

    // eslint-disable-next-line max-params
    constructor(
        private readonly gameStateService: GameStateService,
        private readonly webSocketService: WebsocketService,
        private readonly router: Router,
        private readonly submitManagerService: SubmitManagerService,
        private readonly reviewManager: ReviewManagerService,
        private readonly prizeService: PrizeService,
        private readonly snackBar: MatSnackBar,
    ) {}

    get loadNextQuestionObservable(): Observable<void> {
        return this.loadNextQuestionSubject.asObservable();
    }

    async submitAnswer() {
        if (this.gameStateService.isSubmitted || this.gameStateService.isEliminated) return;
        this.gameStateService.isSubmitted = true;
        const playerAnswer = await this.submitManagerService.getAnswer(this.gameStateService.questionType);
        this.webSocketService.send(GameEvent.SUBMIT_ANSWER, playerAnswer);
    }

    setupManager() {
        this.setupDisconnectClientsEvent();
        this.setupMoveToNextQuestionEvent();
        this.setGameFinishedEvent();
        this.setupEliminatedPlayer();
        this.reviewManager.setupManager();
        this.prizeService.initialize();
    }

    resetManager() {
        this.gameStateService.resetGameState();
        this.reviewManager.resetReviewManager();
        this.removeManagerListeners();
        this.prizeService.removeListeners();
        if (this.webSocketService.isSocketConnected()) this.webSocketService.send(RoomEvent.LEAVE_GAME);
    }

    private removeManagerListeners() {
        this.webSocketService.removeAllListeners(GameEvent.NEXT_QUESTION);
        this.webSocketService.removeAllListeners(GameEvent.GAME_FINISHED);
        this.webSocketService.removeAllListeners(RoomEvent.LEAVE_GAME);
        this.webSocketService.removeAllListeners(GameEvent.PLAYER_ELIMINATED);
    }

    private setupMoveToNextQuestionEvent() {
        this.webSocketService.on(GameEvent.NEXT_QUESTION, (question?: Question) => {
            if (!question) return;
            this.gameStateService.changeQuestion(question);
            this.submitManagerService.setInputs(question);
            this.loadNextQuestionSubject.next();
        });
    }

    private setGameFinishedEvent() {
        this.webSocketService.once<PlayerInfo[]>(GameEvent.GAME_FINISHED, (playerInfo?: PlayerInfo[]) => {
            this.gameStateService.playerInfo = playerInfo ?? [];
            this.router.navigate([`/${PageUrl.APP_PREFIX}/${PageUrl.RESULTS}`]);
        });
    }

    private setupDisconnectClientsEvent() {
        this.webSocketService.once(RoomEvent.LEAVE_GAME, (roomDestructionReason?: RoomDestructionReason) => {
            switch (roomDestructionReason) {
                case RoomDestructionReason.ALL_PLAYER_LEFT:
                    this.snackBar.open('Tous les joueurs ont quitté la partie');
                    break;
                case RoomDestructionReason.ORGANIZER_LEFT:
                    this.snackBar.open("L'organisateur a quitté ou a mis fin à la partie");
                    break;
            }
            this.router.navigate([`/${PageUrl.APP_PREFIX}/${PageUrl.HOME}`]);
        });
    }

    private setupEliminatedPlayer() {
        this.webSocketService.once(GameEvent.PLAYER_ELIMINATED, () => {
            this.gameStateService.isEliminated = true;
            this.snackBar.open('Vous avez été éliminé de la partie');
        });
    }
}
