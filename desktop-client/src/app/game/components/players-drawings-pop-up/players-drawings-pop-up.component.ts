import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlayerDrawingAnswer } from '@common/interfaces/player-drawing-answer';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-players-drawings-pop-up',
    templateUrl: './players-drawings-pop-up.component.html',
    styleUrls: ['./players-drawings-pop-up.component.scss'],
})
export class PlayersDrawingsPopUpComponent {
    readonly s3BucketUrl = environment.s3BucketUrl;
    playersDrawings: PlayerDrawingAnswer[] = [];
    currentIndex = 0;

    constructor(private readonly dialogRef: MatDialog) {}

    get currentDrawing(): PlayerDrawingAnswer | null {
        return this.playersDrawings[this.currentIndex] ?? null;
    }

    setupPopUp(playersDrawings: PlayerDrawingAnswer[]): void {
        this.playersDrawings = playersDrawings;
    }

    closePopUp(): void {
        this.dialogRef.closeAll();
    }

    goToPrevious(): void {
        if (this.currentIndex > 0) this.currentIndex--;
    }

    goToNext(): void {
        if (this.currentIndex < this.playersDrawings.length - 1) this.currentIndex++;
    }
}
