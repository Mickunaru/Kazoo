import { Client } from '@app/model/game-models/client/client';
export class GameMaster extends Client {
    hasLeft = false;
    constructor(name: string, socketId: string) {
        super(socketId, name);
    }
    isActiveGameMaster(socketId: string) {
        return socketId === this.socketId && !this.hasLeft;
    }
}
