import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SERVER_URL_API } from '@app/constants/server-url-and-api-constant';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { BUCKET_ENDPOINT } from '@common/constants/endpoint-constants';
import { Rest } from '@common/enum/rest';
import { S3Url } from '@common/interfaces/url';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class S3Service {
    private readonly baseUrl: string = `${SERVER_URL_API}/${BUCKET_ENDPOINT}`;

    constructor(
        private readonly http: HttpClient,
        private readonly userAuthService: UserAuthService,
        private readonly snackBar: MatSnackBar,
    ) {}

    /**
     * Uploads the image directly to S3.
     * here is an example: this.uploadImage('assets/testPhoto.png', 'test6.png');
     * @param LocalImagePath - should be the path of the where the image is stored locally
     * @param aWSKey - should be the name of the file to store the image in
     * should usually .png
     * @returns a void Promise
     *
     */
    async uploadLocalImage(LocalImagePath: string, aWSKey: string): Promise<void> {
        try {
            const signedURL = await this.getSignedURL(Rest.put, aWSKey);
            const headers = new HttpHeaders({
                'Content-Type': 'image/png',
            });
            const binaryImage = await this.getImageAsBinary(LocalImagePath);
            await firstValueFrom(this.http.put(signedURL, binaryImage, { headers }));
        } catch (e) {
            this.snackBar.open("Échec du téléchargement de l'image");
        }
    }

    async uploadBlobImage(blob: Blob, aWSKey: string): Promise<void> {
        try {
            const signedURL = await this.getSignedURL(Rest.put, aWSKey);
            const headers = new HttpHeaders({
                'Content-Type': 'image/png',
            });
            const binaryImage = await blob.arrayBuffer();
            await firstValueFrom(this.http.put(signedURL, binaryImage, { headers }));
        } catch (e) {
            this.snackBar.open("Échec du téléchargement de l'image");
        }
    }

    async deleteImage(aWSKey: string): Promise<void> {
        try {
            const signedURL = await this.getSignedURL(Rest.delete, aWSKey);
            await firstValueFrom(this.http.delete(signedURL));
        } catch (e) {
            this.snackBar.open("Échec du téléchargement de l'image");
        }
    }

    private async getImageAsBinary(path: string): Promise<ArrayBuffer> {
        const response = await fetch(path);
        return (await response.blob()).arrayBuffer();
    }

    private async getSignedURL(operation: string, key: string): Promise<string> {
        return (await firstValueFrom(this.http.get<S3Url>(`${this.baseUrl}/${operation}/${key}`, this.userAuthService.requestOptions()))).url;
    }
}
