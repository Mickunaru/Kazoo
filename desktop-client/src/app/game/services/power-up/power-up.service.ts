/* eslint-disable @typescript-eslint/no-magic-numbers */

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SurgeDialogComponent } from '@app/game/components/surge-dialog/surge-dialog.component';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { SubmitManagerService } from '@app/game/services/submit-manager/submit-manager.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { SUCCESS_RESPONSE } from '@common/constants/power-ups-constants';
import { PowerUpType } from '@common/enum/power-up-type';
import { MultiChoice } from '@common/interfaces/multi-choice';
import { PowerUp } from '@common/interfaces/power-up';
import { GameEvent } from '@common/socket-events/game-event';

@Injectable({
    providedIn: 'root',
})
export class PowerUpService {
    currentPowerUps: Set<PowerUpType> = new Set();
    selectedPowerUp: string | null = null;
    hasSelectedPowerUp: boolean = false;
    confusionQuestionChoices: MultiChoice[] = [];
    cheatingContent: string[] = [];
    tornadoShuffledIndexes: number[] = [];
    isTornadoActive = false;

    private tornadoTimeoutId: ReturnType<typeof setTimeout> | null = null;

    // eslint-disable-next-line max-params
    constructor(
        private readonly webSocketService: WebsocketService,
        private readonly gameStateService: GameStateService,
        private readonly submitManagerService: SubmitManagerService,
        private readonly snackBar: MatSnackBar,
        private readonly dialog: MatDialog,
    ) {}

    disablePowerUps(): boolean {
        return this.hasSelectedPowerUp;
    }

    setupManager() {
        this.listenForReset();
        this.listenForPowerUps();
    }

    resetListeners() {
        this.webSocketService.removeAllListeners(GameEvent.ACTIVATE_POWER_UP);
        this.webSocketService.removeAllListeners(GameEvent.RESET_POWER_UP);
        this.resetPowerUps();
    }

    async requestPowerUp(powerUpName: PowerUpType | string): Promise<string> {
        const message: string = await this.webSocketService.sendWithAck(GameEvent.ACTIVATE_POWER_UP, powerUpName);
        if (message === SUCCESS_RESPONSE) {
            this.selectedPowerUp = powerUpName;
            this.hasSelectedPowerUp = true;
        } else {
            this.snackBar.open(message, 'Fermer', {
                duration: 3000,
                panelClass: ['error-snackbar'],
            });
        }
        return message;
    }

    private activatePowerUp(powerUp: PowerUp): void {
        switch (powerUp.name) {
            case PowerUpType.TRICHEUR:
                if (!powerUp.content) return;
                this.cheatingContent = powerUp.content;
                this.triggerCheatingPowerUp();
                break;
            case PowerUpType.CONFUSION:
                this.applyConfusionPowerUp();
                break;
            case PowerUpType.SURGE:
                this.triggerSurgePowerUp();
                break;
            case PowerUpType.TORNADE:
                this.triggerTornadoPowerUp();
                break;
            default:
                break;
        }
    }

    private listenForPowerUps(): void {
        this.webSocketService.on(GameEvent.ACTIVATE_POWER_UP, (powerUp?: PowerUp) => {
            if (!powerUp) return;

            if (!this.currentPowerUps.has(powerUp.name as PowerUpType)) {
                this.currentPowerUps.add(powerUp.name as PowerUpType);
                this.activatePowerUp(powerUp);
            }
        });
    }

    private listenForReset(): void {
        this.webSocketService.on(GameEvent.RESET_POWER_UP, () => {
            this.resetPowerUps();
        });
    }

    private resetPowerUps() {
        this.selectedPowerUp = null;
        this.hasSelectedPowerUp = false;
        this.currentPowerUps.clear();

        this.cheatingContent = [];
        this.tornadoShuffledIndexes = [];
        this.isTornadoActive = false;
        this.confusionQuestionChoices = [];

        if (this.tornadoTimeoutId) {
            clearTimeout(this.tornadoTimeoutId);
            this.tornadoTimeoutId = null;
        }
    }

    private triggerCheatingPowerUp() {
        const wrongAnswerIndexes = this.gameStateService.questionChoices
            .map((choice, i) => (this.cheatingContent.includes(choice) ? i : -1))
            .filter((i) => i !== -1);

        if (wrongAnswerIndexes.length > 0) {
            const randomIndex = wrongAnswerIndexes[Math.floor(Math.random() * wrongAnswerIndexes.length)];
            this.submitManagerService.disabledAnswerChoices.add(randomIndex);
        } else {
            this.snackBar.open('Tricheur: aucune mauvaise réponse disponible à désactiver', 'Fermer', {
                duration: 3000,
                panelClass: ['error-snackbar'],
            });
        }
    }

    private triggerTornadoPowerUp(): void {
        this.isTornadoActive = true;

        this.tornadoShuffledIndexes = [...this.gameStateService.questionIndexes];

        const shuffleLoop = () => {
            if (!this.isTornadoActive) {
                return;
            }
            this.shuffleIndexes(this.tornadoShuffledIndexes);

            const delay = Math.random() * 1000 + 1000;
            this.tornadoTimeoutId = setTimeout(shuffleLoop, delay);
        };

        shuffleLoop();
    }

    private shuffleIndexes(indexes: number[]): void {
        for (let i = indexes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
        }
    }

    private triggerSurgePowerUp(): void {
        for (let i = 0; i < 15; i++) {
            const position = this.getRandomPosition();

            this.dialog.open(SurgeDialogComponent, {
                data: position,
                hasBackdrop: false,
                panelClass: 'surge-dialog',
                position,
                disableClose: false,
            });
        }
    }

    private getRandomPosition(): { top: string; left: string } {
        const popupHeight = 150;
        const popupWidth = 150;

        const marginTop = 0.1 * window.innerHeight;
        const marginBottom = marginTop;

        const maxTop = window.innerHeight - popupHeight - marginBottom;
        const minTop = marginTop;

        const maxLeft = 0.7 * window.innerWidth - popupWidth;
        const minLeft = 0.1 * window.innerWidth;

        const top = Math.floor(Math.random() * (maxTop - minTop) + minTop);
        const left = Math.floor(Math.random() * (maxLeft - minLeft) + minLeft);

        return { top: `${top}px`, left: `${left}px` };
    }

    private applyConfusionPowerUp() {
        this.gameStateService.currentQuestion.text = this.replaceLettersWithRectangles(this.gameStateService.currentQuestion.text);
        this.confusionQuestionChoices = this.gameStateService.currentQuestion.choices.map((choice) => ({
            ...choice,
            text: this.replaceLettersWithRectangles(choice.text),
        }));
    }

    private replaceLettersWithRectangles(text: string): string {
        return [...text].map((c, i) => (i % 2 === 1 ? '■' : c)).join('');
    }
}
