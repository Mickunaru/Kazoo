import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PageUrl } from '@app/enum/page-url';
import { LeaveGameDialogComponent } from '@app/game/components/leave-game-dialog/leave-game-dialog.component';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    constructor(
        private readonly dialog: MatDialog,
        private readonly router: Router,
    ) {}

    showExitDialog(): void {
        const dialogRef = this.dialog.open(LeaveGameDialogComponent, {
            data: {
                title: 'Attention!',
                description: 'Êtes-vous certain de vouloir quitter la partie ?',
                cancelText: 'Annuler',
                confirmText: 'Quitter',
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.router.navigate([`/${PageUrl.APP_PREFIX}/${PageUrl.HOME}`]);
            }
        });
    }
}
