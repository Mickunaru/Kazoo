import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameManagerService } from '@app/game/services/game-manager/game-manager.service';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { PlayerReviewSnackbarService } from '@app/game/services/player-review-snackbar/player-review-snackbar-service.service';
import { PowerUpService } from '@app/game/services/power-up/power-up.service';
import { SubmitManagerService } from '@app/game/services/submit-manager/submit-manager.service';
import { POWER_UP_IMAGE_URL } from '@common/constants/power-ups-constants';
import { QuestionType } from '@common/enum/question-type';

@Component({
    selector: 'app-game-pannel',
    templateUrl: './game-pannel.component.html',
    styleUrls: ['./game-pannel.component.scss'],
})
export class GamePannelComponent implements OnInit, OnDestroy {
    questionType = QuestionType;
    readonly POWER_UP_IMAGE_URL = POWER_UP_IMAGE_URL;

    // eslint-disable-next-line max-params
    constructor(
        readonly gameStateService: GameStateService,
        private readonly gameManagerService: GameManagerService,
        readonly submitManagerService: SubmitManagerService,
        readonly powerUpService: PowerUpService,
        readonly playerReviewSnackbarService: PlayerReviewSnackbarService,
    ) {}

    ngOnInit(): void {
        this.playerReviewSnackbarService.setupListener();
    }

    ngOnDestroy(): void {
        this.playerReviewSnackbarService.removeListener();
    }

    submit(): void {
        this.gameManagerService.submitAnswer();
    }

    canSubmit(): boolean {
        return this.canAnswer() && this.submitManagerService.answerIsChosen(this.gameStateService.questionType);
    }

    canAnswer(): boolean {
        return !this.gameStateService.isSubmitted && !this.gameStateService.isEliminated;
    }
}
