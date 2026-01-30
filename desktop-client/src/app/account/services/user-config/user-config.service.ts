import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SERVER_URL_API } from '@app/constants/server-url-and-api-constant';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { AVATAR_ENDPOINT, CUSTOM_AVATAR_ENDPOINT, USERS_ENDPOINT } from '@common/constants/endpoint-constants';
import { S3Url } from '@common/interfaces/url';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UserConfigService {
    private readonly baseUrl: string = `${SERVER_URL_API}/${USERS_ENDPOINT}`;

    constructor(
        private readonly http: HttpClient,
        private readonly userAuthService: UserAuthService,
        private readonly snackBar: MatSnackBar,
    ) {}

    async changeAvatar(id: string) {
        try {
            const { url } = await firstValueFrom(this.http.put<S3Url>(this.getAvatarPath(id), {}, this.userAuthService.requestOptions()));
            if (this.userAuthService.curUser) {
                this.userAuthService.curUser.avatar = url || this.userAuthService.curUser.avatar;
            }
        } catch (response: unknown) {
            if (response instanceof HttpErrorResponse) this.snackBar.open(response.error.message, 'close');
        }
    }

    getAvatarPath(id: string) {
        return id ? `${this.baseUrl}/${AVATAR_ENDPOINT}/${id}` : `${this.baseUrl}/${CUSTOM_AVATAR_ENDPOINT}`;
    }

    async changeDrawnAvatar(id: string): Promise<void> {
        throw new Error(`Method not implemented.${id}`);
    }
}
