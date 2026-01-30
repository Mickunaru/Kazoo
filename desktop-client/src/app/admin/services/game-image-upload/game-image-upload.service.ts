/* eslint-disable quote-props */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameImageUploadService {
    images: Map<string, File> = new Map();
    deletedGameImages: Set<string> = new Set();
    deletedQuestionBankImages: Set<string> = new Set();
    lastModification = new Date();

    constructor(private readonly httpClient: HttpClient) {}

    async imageUrlToFile(imageUrl: string, uuid: string) {
        return await firstValueFrom(
            this.httpClient.get(imageUrl, { responseType: 'blob' }).pipe(
                map((blob) => {
                    return new File([blob], `${uuid}.png`, { type: blob.type });
                }),
            ),
        );
    }

    async copyImage(imageUrl: string, uuid: string) {
        const file = await this.imageUrlToFile(imageUrl, uuid);
        this.images.set(uuid, file);
    }

    resetState() {
        this.images.clear();
        this.deletedGameImages.clear();
        this.deletedQuestionBankImages.clear();
    }
}
