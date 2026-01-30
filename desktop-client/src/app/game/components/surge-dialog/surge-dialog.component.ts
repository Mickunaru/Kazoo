import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-surge-dialog',
    templateUrl: './surge-dialog.component.html',
    styleUrls: ['./surge-dialog.component.scss'],
})
export class SurgeDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<SurgeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { top: string; left: string },
    ) {}

    close(): void {
        this.dialogRef.close();
    }
}
