import { Component } from '@angular/core';
import { GameLibraryService } from '@app/admin/services/game-library/game-library.service';
import { MINIMUM_RANDOM_GAME_QUESTION_COUNT } from '@app/home/home.const';
import { RandomGameService } from '@app/home/services/random-game/random-game.service';
import { Game } from '@common/interfaces/game';
import { Observable, startWith, Subject, switchMap } from 'rxjs';

@Component({
    selector: 'app-start-new-game-page',
    templateUrl: './start-new-game-page.component.html',
    styleUrls: ['./start-new-game-page.component.scss'],
})
export class StartNewGamePageComponent {
    selectedGame: Game | null = null;
    isGameSelected: boolean;

    hasEnoughQuestions$: Observable<boolean>;
    publicGames$: Observable<Game[]>;
    reset$: Subject<void> = new Subject();

    constructor(
        readonly gameLibraryService: GameLibraryService,
        readonly randomGameService: RandomGameService,
    ) {
        this.hasEnoughQuestions$ = this.randomGameService.hasEnoughQuestionForRandomGame(MINIMUM_RANDOM_GAME_QUESTION_COUNT);
        this.publicGames$ = this.reset$.pipe(
            startWith([]),
            switchMap(() => this.gameLibraryService.updatePublicGames()),
        );
    }

    showGameDetails(game: Game | null): void {
        this.isGameSelected = !this.isGameSelected || this.selectedGame !== game;
        this.selectedGame = this.selectedGame === game ? null : game;
    }

    unselectGame(): void {
        this.selectedGame = null;
        this.isGameSelected = false;
        this.reset$.next();
    }

    trackGameListkByGameId(index: number, game: Game): string {
        return game.id;
    }
}
