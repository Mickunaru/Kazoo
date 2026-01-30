import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface LeaveGameDialogProps {
    title: string;
    description: string;
    cancelText: string;
    confirmText: string;
    func: (() => void) | null;
}

@Component({
    selector: 'app-leave-game-dialog',
    templateUrl: './leave-game-dialog.component.html',
    styleUrls: ['./leave-game-dialog.component.scss'],
})
export class LeaveGameDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<LeaveGameDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: LeaveGameDialogProps,
    ) {}

    onCancelClick(): void {
        this.dialogRef.close();
    }

    onConfirmClick(): void {
        this.dialogRef.close(true);
    }
}
