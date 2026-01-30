import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DEFAULT_AVATARS } from '@app/shared/constants/default-avatars';
import { S3Service } from '@app/shared/services/s3/s3.service';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { CUSTOM_AVATAR_ENDPOINT } from '@common/constants/endpoint-constants';
import { ShopItem } from '@common/interfaces/shop-item';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-avatar-dialog',
    templateUrl: './avatar-dialog.component.html',
    styleUrls: ['./avatar-dialog.component.scss'],
})
export class AvatarDialogComponent {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    avatarPreset: ShopItem[] = DEFAULT_AVATARS;
    selectedAvatar?: ShopItem;
    fileToUpload: File | null = null;
    readonly s3BucketUrl = environment.s3BucketUrl;

    // eslint-disable-next-line max-params
    constructor(
        private dialogRef: MatDialogRef<AvatarDialogComponent>,
        private readonly s3Service: S3Service,
        readonly userAuthService: UserAuthService,
        private readonly snackBar: MatSnackBar,
    ) {}

    selectAvatar(avatar: ShopItem) {
        this.selectedAvatar = avatar;
    }

    onConfirm() {
        this.dialogRef.close(this.selectedAvatar);
    }

    triggerFileInput() {
        this.fileInput.nativeElement.click();
    }

    async onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) {
            return;
        }

        const file: File = input.files[0];
        const imageAsBlob = new Blob([file], { type: file.type });
        if (file.type !== 'image/png') {
            this.snackBar.open("L'image doit être de format png.");
        }

        if (this.userAuthService?.curUser?.username) {
            const awsKey = `${CUSTOM_AVATAR_ENDPOINT}/${this.userAuthService.curUser.username}.png`;
            await this.s3Service.uploadBlobImage(imageAsBlob, awsKey);
            /*
            since the Avatar picker is made to interact with shop Items I need to return an shopItem
            but all I need is the ID and imageURL so there's no point in making a full on shop item since all I need 
            is the ID hence the casting to shopItem. 
        */
            this.selectedAvatar = {
                id: '',
                imageUrl: `${this.s3BucketUrl}${awsKey}`,
            } as unknown as ShopItem;
        }
        this.dialogRef.close(this.selectedAvatar);
    }
}
