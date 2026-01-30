import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AuthErrorMessage } from '@app/constants/error-message';
import { SERVER_URL_API } from '@app/constants/server-url-and-api-constant';
import { Errors } from '@app/session/classes/error-handler';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { IS_SIGNED_IN_ENDPOINT, USERNAME_ENDPOINT, USERS_ENDPOINT } from '@common/constants/endpoint-constants';
import { User } from '@common/interfaces/user';
import { AuthEvent } from '@common/socket-events/auth-event';
import { FriendEvent } from '@common/socket-events/friend-event';
import { firstValueFrom } from 'rxjs';
interface SignInParams {
    username: string;
    password: string;
}

interface SignUpParams extends SignInParams {
    email: string;
    avatar: string;
}

type CreateUserDto = Pick<User, 'uid' | 'username' | 'avatar' | 'email'>;

@Injectable({
    providedIn: 'root',
})
export class UserAuthService {
    curUser: Omit<User, 'id' | 'createdAt' | 'lastConnection'> | null = null;
    idToken: string | undefined;
    private readonly baseUrl = `${SERVER_URL_API}/${USERS_ENDPOINT}`;

    // eslint-disable-next-line max-params
    constructor(
        private readonly http: HttpClient,
        private readonly auth: AngularFireAuth,
        private readonly router: Router,
        private readonly websocketService: WebsocketService,
    ) {}

    async login({ username, password }: SignInParams) {
        if (this.curUser || this.websocketService.isSocketConnected()) return;

        const isSignedIn = await this.isUserSignedIn(username).catch(Errors.throwServerIsDown);

        if (isSignedIn) throw new Error(AuthErrorMessage.USER_ALREADY_LOGGED_IN);

        const user = await this.getUser(username).catch(Errors.throwServerIsDown);

        if (!user) throw new Error(AuthErrorMessage.USERNAME_DOES_NOT_EXISTS);

        await this.auth.setPersistence('session');
        const credential = await this.auth.signInWithEmailAndPassword(user.email, password);
        this.idToken = await credential.user?.getIdToken();

        try {
            await this.startWebsocketConnection(user);
            this.curUser = user;
        } catch (error) {
            await this.auth.signOut();
            if (this.websocketService.isSocketConnected()) this.websocketService.disconnect();
            throw new Error(AuthErrorMessage.SIGN_IN);
        }
    }

    async signUp({ email, password, username, avatar }: SignUpParams): Promise<void> {
        if (this.curUser || this.websocketService.isSocketConnected()) return;

        const existingUser = await this.getUser(username).catch(Errors.throwServerIsDown);

        if (existingUser) throw new Error(AuthErrorMessage.USERNAME_TAKEN);

        const credential = await this.auth.createUserWithEmailAndPassword(email, password);
        this.idToken = await credential.user?.getIdToken();

        if (!credential.user) throw new Error(AuthErrorMessage.SIGN_UP);

        const newUserDto: CreateUserDto = {
            uid: credential.user.uid,
            username,
            avatar,
            email,
        };

        try {
            const newUser = await this.createUser(newUserDto);
            await this.startWebsocketConnection(newUser);
            this.curUser = newUser;
        } catch {
            if (this.websocketService.isSocketConnected()) this.websocketService.disconnect();
            await credential.user.delete();
            throw new Error(AuthErrorMessage.SIGN_UP);
        }
        this.websocketService.send(FriendEvent.NEW_USER, username);
    }

    async signOutAndRedirect(): Promise<boolean> {
        await this.signOut();
        return this.router.navigate(['/']);
    }

    async signOut() {
        if (!this.curUser || !this.websocketService.isSocketConnected()) return;

        await this.auth.signOut();
        this.websocketService.disconnect();
        this.curUser = null;
    }

    generateHeaders(): HttpHeaders {
        return new HttpHeaders({
            Authorization: `Bearer ${this.idToken}`,
        });
    }
    requestOptions(): { headers: HttpHeaders } {
        return { headers: this.generateHeaders() };
    }

    async updateUser(): Promise<void> {
        if (this.curUser) {
            this.curUser = await this.getUser(this.curUser.username);
        }
    }

    private async getUser(username: string): Promise<User | null> {
        return firstValueFrom(this.http.get<User | null>(`${this.baseUrl}/${USERNAME_ENDPOINT}/${username}`));
    }

    private async createUser(newUserDto: CreateUserDto): Promise<User> {
        return firstValueFrom(this.http.post<User>(this.baseUrl, newUserDto));
    }

    private async isUserSignedIn(username: string): Promise<boolean> {
        return firstValueFrom(this.http.get<boolean>(`${this.baseUrl}/${IS_SIGNED_IN_ENDPOINT}/${username}`));
    }

    private async startWebsocketConnection(user: User) {
        const { uid, username } = user;
        await this.websocketService.connect();
        this.websocketService.send(AuthEvent.USER_LOGIN, {
            uid,
            username,
        });
    }
}
