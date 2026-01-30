import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ACKNOWLEDGE_TEXT, GameStarterErrorMessage } from '@app/constants/error-message';
import { GameModeNameEnum } from '@app/game/enum/game-mode-name';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { GameStartError, GameStartErrorTypes } from '@app/home/errors/game-start-error';
import { MINIMUM_RANDOM_GAME_QUESTION_COUNT } from '@app/home/home.const';
import { GameConfigForm } from '@app/home/interfaces/game-config-form';
import { GameStarterService } from '@app/home/services/game-starter/game-starter.service';
import { GameMode } from '@common/enum/game-mode';
import { Game } from '@common/interfaces/game';
import { GameConfigDto } from '@common/interfaces/game-config-dto';

@Component({
    selector: 'app-game-starter',
    templateUrl: './game-starter.component.html',
    styleUrls: ['./game-starter.component.scss'],
})
export class GameStarterComponent implements OnInit, OnChanges {
    @Input() selectedGame: Game | null;
    @Output() unselect = new EventEmitter<void>();
    isProcessing = false;

    GameModeType = GameMode;
    GameModeName = GameModeNameEnum;

    gameConfigForm: FormGroup<GameConfigForm> = new FormGroup<GameConfigForm>({
        isFriendsOnly: new FormControl<boolean>(false, { nonNullable: true }),
        arePowerUpsEnabled: new FormControl<boolean>(true, { nonNullable: true }),
        hasSoundboard: new FormControl<boolean>(true, { nonNullable: true }),
        entryPrice: new FormControl<number>(0, { nonNullable: true }),
        gameMode: new FormControl<GameMode>(GameMode.CLASSIC, { nonNullable: true }),
        questionCount: new FormControl<number>(MINIMUM_RANDOM_GAME_QUESTION_COUNT, { nonNullable: true }),
    });

    constructor(
        private readonly snackBar: MatSnackBar,
        private readonly gameStarterService: GameStarterService,
        private readonly gameStateService: GameStateService,
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.selectedGame.currentValue !== null) {
            if (this.gameConfigForm.controls.gameMode.value === GameMode.ELIMINATION) {
                this.gameConfigForm.controls.gameMode.setValue(GameMode.CLASSIC);
            }
        } else {
            this.gameConfigForm.controls.gameMode.setValue(GameMode.ELIMINATION);
        }
    }

    ngOnInit(): void {
        if (this.selectedGame === null) {
            this.gameConfigForm.controls.gameMode.setValue(GameMode.ELIMINATION);
            this.gameConfigForm.controls.questionCount.enable();
            if (this.gameConfigForm.controls.questionCount.value === undefined) {
                this.gameConfigForm.controls.questionCount.setValue(MINIMUM_RANDOM_GAME_QUESTION_COUNT);
            }
        } else {
            if (this.gameConfigForm.controls.gameMode.value === GameMode.ELIMINATION)
                this.gameConfigForm.controls.gameMode.setValue(GameMode.CLASSIC);
            this.gameConfigForm.controls.questionCount.disable();
        }
    }

    async startGame() {
        this.isProcessing = true;
        const gameConfig = { gameId: this.selectedGame?.id ?? null, ...this.gameConfigForm.value } as GameConfigDto;
        gameConfig.questionCount ??= MINIMUM_RANDOM_GAME_QUESTION_COUNT;
        this.gameStateService.questionsLength = this.selectedGame?.questions?.length ?? 0; // Needed for organizer page
        try {
            await this.gameStarterService.startGame(gameConfig);
        } catch (error) {
            if (error instanceof GameStartError) this.handleError(error);
            else throw error;
        } finally {
            this.isProcessing = false;
        }
    }

    private handleError(error: GameStartError) {
        switch (error.type) {
            case GameStartErrorTypes.HIDDEN:
                this.snackBar.open(GameStarterErrorMessage.HIDDEN, ACKNOWLEDGE_TEXT);
                this.unselect.emit();
                break;
            case GameStartErrorTypes.DELETED:
                this.snackBar.open(GameStarterErrorMessage.DELETED, ACKNOWLEDGE_TEXT);
                this.unselect.emit();
                break;
            case GameStartErrorTypes.NOT_ENOUGH_QUESTIONS:
                this.snackBar.open(GameStarterErrorMessage.NOT_ENOUGH_QUESTIONS, ACKNOWLEDGE_TEXT);
                break;
            case GameStartErrorTypes.NOT_ENOUGH_MONEY:
                this.snackBar.open(GameStarterErrorMessage.NOT_ENOUGH_MONEY, ACKNOWLEDGE_TEXT);
                break;
            case GameStartErrorTypes.IMPOSSIBLE:
                this.snackBar.open(GameStarterErrorMessage.IMPOSSIBLE, ACKNOWLEDGE_TEXT);
                this.unselect.emit();
                break;
        }
    }
}
