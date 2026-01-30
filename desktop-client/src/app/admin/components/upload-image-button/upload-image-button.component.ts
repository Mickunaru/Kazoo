import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameImageUploadService } from '@app/admin/services/game-image-upload/game-image-upload.service';

@Component({
    selector: 'app-upload-image-button',
    templateUrl: './upload-image-button.component.html',
    styleUrls: ['./upload-image-button.component.scss'],
})
export class UploadImageButtonComponent {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    imagePreview: string | ArrayBuffer | null = null;
    uuid: string;
    imageUrl: FormControl<string>;
    isQuestionBank: boolean;

    constructor(
        readonly snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<UploadImageButtonComponent>,
        private readonly gameImageUpload: GameImageUploadService,
    ) {}

    async setValues(uuid: string, imageUrl: FormControl<string>, isQuestionBank: boolean) {
        this.isQuestionBank = isQuestionBank;
        this.imagePreview = null;
        this.imageUrl = imageUrl;
        this.uuid = uuid;

        const image = this.gameImageUpload.images.get(uuid);
        if (image) {
            this.readFile(image);
        } else if (this.imageUrl.value) {
            const file = await this.gameImageUpload.imageUrlToFile(imageUrl.value, uuid);
            this.readFile(file);
        }
    }

    triggerFileInput() {
        this.fileInput.nativeElement.click();
    }

    removeFileInput() {
        if (this.imagePreview || this.imageUrl) {
            if (this.isQuestionBank) {
                this.gameImageUpload.deletedQuestionBankImages.add(this.uuid);
            } else {
                this.gameImageUpload.deletedGameImages.add(this.uuid);
            }
            this.gameImageUpload.images.delete(this.uuid);
        }
        this.imagePreview = null;
        this.imageUrl.setValue('');
    }

    async onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        if (file.type !== 'image/png') {
            this.snackBar.open("L'image doit être de format png.");
            return;
        }

        this.readFile(file);

        this.gameImageUpload.images.set(this.uuid, file);
        if (this.isQuestionBank) {
            this.gameImageUpload.deletedQuestionBankImages.delete(this.uuid);
        } else {
            this.gameImageUpload.deletedGameImages.delete(this.uuid);
        }
    }

    readFile(file: File) {
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreview = reader.result;
        };
        reader.readAsDataURL(file);
    }
}
