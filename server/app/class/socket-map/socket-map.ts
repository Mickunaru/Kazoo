import { UserId } from '@app/interfaces/connection/user-id.interface';

export class SocketMap {
    // socket => uid, username
    private readonly socketToUserIdMap = new Map<string, UserId>();
    // username => socket
    private readonly nameToSocketMap = new Map<string, string>();

    get size(): number {
        return this.nameToSocketMap.size;
    }

    getSocketFromName(username: string): string | undefined {
        return this.nameToSocketMap.get(username);
    }

    getUserFromSocket(socketId: string): UserId | undefined {
        return this.socketToUserIdMap.get(socketId);
    }

    addUser(socketId: string, user: UserId) {
        this.socketToUserIdMap.set(socketId, user);
        this.nameToSocketMap.set(user.username, socketId);
    }

    deleteUser({ username }: UserId) {
        const socket = this.nameToSocketMap.get(username);
        if (!socket) return;
        this.socketToUserIdMap.delete(socket);
        this.nameToSocketMap.delete(username);
    }

    getAllUsers(): UserId[] {
        return [...this.socketToUserIdMap.values()];
    }

    getAllPlayerNames() {
        return this.nameToSocketMap.keys();
    }
}
