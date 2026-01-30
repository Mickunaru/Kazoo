import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AvatarDialogComponent } from '@app/shared/components/avatar-dialog/avatar-dialog.component';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { ShopItem } from '@common/interfaces/shop-item';

@Component({
    selector: 'app-avatar-picker',
    templateUrl: './avatar-picker.component.html',
    styleUrls: ['./avatar-picker.component.scss'],
})
export class AvatarPickerComponent {
    @Output() pickAvatarEmitter = new EventEmitter<ShopItem>();
    @Input() selectedAvatar = '';
    @Input() ownedAvatars: ShopItem[] = [];

    dialogRef: MatDialogRef<AvatarDialogComponent, unknown>;
    constructor(
        private readonly dialog: MatDialog,
        readonly userAuthService: UserAuthService,
    ) {}

    openAvatarDialog() {
        this.dialogRef = this.dialog.open(AvatarDialogComponent, {
            width: '500px',
        });
        this.dialogRef.componentInstance.avatarPreset = [...this.dialogRef.componentInstance.avatarPreset, ...this.ownedAvatars];

        const closeSubscription = this.dialogRef.afterClosed().subscribe((avatar) => {
            if (avatar) {
                this.selectedAvatar = (avatar as ShopItem).imageUrl || this.selectedAvatar;
                this.pickAvatarEmitter.emit(avatar as ShopItem);
                closeSubscription.unsubscribe();
            }
        });
    }
}
