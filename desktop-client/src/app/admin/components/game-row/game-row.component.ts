import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { GameLibraryService } from '@app/admin/services/game-library/game-library.service';
import { Game } from '@common/interfaces/game';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-row',
    templateUrl: './game-row.component.html',
    styleUrls: ['./game-row.component.scss'],
})
export class GameRowComponent implements OnInit, OnDestroy {
    @Input() game: Game;
    isSelected: boolean;
    downloadJsonHref: SafeUrl;
    private gameEditorSubscription: Subscription;
    // eslint-disable-next-line max-params
    constructor(
        private readonly gameLibraryService: GameLibraryService,
        private readonly sanitizer: DomSanitizer,
    ) {}

    ngOnInit(): void {
        const gameJSON = JSON.stringify(this.game, (key, value) => {
            if (key === 'isHidden') {
                return undefined;
            }
            return value;
        });
        this.downloadJsonHref = this.sanitizer.bypassSecurityTrustUrl('data:text/json;charset=UTF-8,' + encodeURIComponent(gameJSON));
        this.gameEditorSubscription = this.gameLibraryService.selectedGame.subscribe((game: Game) => (this.isSelected = game.id === this.game.id));
    }

    ngOnDestroy(): void {
        this.gameEditorSubscription.unsubscribe();
    }

    onSelect() {
        setTimeout(() => this.gameLibraryService.selectedGame.next(this.game));
    }

    async deleteGame() {
        const promises = this.game.questions
            .filter((question) => question.imageUrl && question.uuid)
            .map(async (question) => this.gameLibraryService.deleteQuestionImage(question.uuid ?? ''));
        await Promise.all(promises);

        await this.gameLibraryService.deleteGame(this.game.id);
        this.gameLibraryService.updateGamesList();
    }

    async toggleVisibility() {
        await this.gameLibraryService.hideGame(this.game.id, { isHidden: !this.game.isHidden });
        this.gameLibraryService.updateGamesList();
    }
}
