import { Component, OnInit } from '@angular/core';
import { EMPTY_GAME_OBJECT } from '@app/admin/admin.const';
import { GameLibraryService } from '@app/admin/services/game-library/game-library.service';

@Component({
    selector: 'app-game-bank',
    templateUrl: './game-bank.component.html',
    styleUrls: ['./game-bank.component.scss'],
})
export class GameBankComponent implements OnInit {
    constructor(readonly gameLibraryService: GameLibraryService) {}

    ngOnInit() {
        this.cacheImages();
    }

    async cacheImages() {
        await this.gameLibraryService.updateGamesList();
    }

    createNewGame() {
        this.gameLibraryService.isClicked = true;
        setTimeout(() => {
            this.gameLibraryService.selectedGame.next(EMPTY_GAME_OBJECT);
        });
    }
}
