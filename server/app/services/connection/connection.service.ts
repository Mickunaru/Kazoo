import { SocketMap } from '@app/class/socket-map/socket-map';
import { UserId } from '@app/interfaces/connection/user-id.interface';
import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { app } from 'firebase-admin';
type SocketId = string;

@Injectable()
export class ConnectionService {
    userMap: SocketMap = new SocketMap();

    constructor(
        @Inject('FIREBASE_APP') private firebaseApp: app.App,
        private logger: Logger,
    ) {}

    isSignedIn(username: string) {
        return !!this.userMap.getSocketFromName(username);
    }

    signIn(socketId: string, user: UserId) {
        this.userMap.addUser(socketId, user);
        this.logger.log(`Signed In ${user.username}`, 'AUTH');
    }

    async signout(socketId: SocketId) {
        const auth = this.firebaseApp.auth();
        const user = this.userMap.getUserFromSocket(socketId);
        this.logger.log(`Signing Out ${socketId} ${user?.username}`, 'ConnectionService');

        if (user === undefined) return;
        try {
            await auth.revokeRefreshTokens(user.uid);
        } catch (error) {
            this.logger.error(error, 'ConnectionService');
        }
        this.logger.log(`Signed Out ${user.username}`, 'AUTH');
        this.userMap.deleteUser(user);
    }

    async authentificateUser(req: Request): Promise<string> {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) throw new UnauthorizedException('user not authentified');
        try {
            const decodedToken = await this.verifyToken(token);
            if (!decodedToken) throw Error('Could not verify token');
            return decodedToken.uid;
        } catch (error) {
            throw new UnauthorizedException('token could not be matched with a user');
        }
    }

    private async verifyToken(token: string) {
        try {
            const decodedToken = await this.firebaseApp.auth().verifyIdToken(token);
            return decodedToken;
        } catch (error) {
            this.logger.error('Unauthorized', error.stack, 'FIREBASE');
        }
    }
}
