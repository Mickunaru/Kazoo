import { HOME_LOBBY_ROOM_ID, PLAYER_CHANGE_COUNT } from '@app/constants/room-constants';
import { Room } from '@app/model/game-models/room/room';
import { ConnectionService } from '@app/services/connection/connection.service';
import { FriendService } from '@app/services/friend/friend.service';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { RoomState } from '@common/enum/room-state';
import { ActiveGame } from '@common/interfaces/active-game';
import { HomeEvent } from '@common/socket-events/home-event';
import { SocketEvent } from '@common/socket-events/socket-event';
import { Injectable } from '@nestjs/common';
import { firstValueFrom, take, timer } from 'rxjs';
import { Server, Socket } from 'socket.io';
@Injectable()
export class HomeLobbyService {
    server: Server;
    // eslint-disable-next-line max-params
    constructor(
        private readonly roomsManagerService: RoomsManagerService,
        private readonly friendService: FriendService,
        private readonly connectionService: ConnectionService,
    ) {}

    async joinHomeLobby(client: Socket) {
        const waitTime = 100;
        await firstValueFrom(timer(waitTime).pipe(take(1)));
        client.join(HOME_LOBBY_ROOM_ID);

        const userId = this.connectionService.userMap.getUserFromSocket(client.id);
        if (!userId) return;
        const friends = new Set(await this.friendService.getAllFriendUsernames(userId.username));
        const activeGames: ActiveGame[] = this.roomsManagerService.getActiveGames(friends);

        client.emit(HomeEvent.UPDATE_GAME_LIST, activeGames);
    }

    leaveHomeLobby(client: Socket) {
        client.leave(HOME_LOBBY_ROOM_ID);
    }

    async playerJoin(roomId: string) {
        await this.playerChange(roomId, PLAYER_CHANGE_COUNT);
    }

    async playerLeave(roomId: string) {
        await this.playerChange(roomId, -PLAYER_CHANGE_COUNT);
    }

    async masterJoin(roomId: string, room: Room) {
        const activeGameUpdate: ActiveGame[] = [
            { roomId, gameConfig: room.gameConfig, playerCount: 0, gameTitle: room.game.title, roomState: RoomState.OPEN },
        ];

        if (room.gameConfig.isFriendsOnly) {
            await this.sendToFriends(room.gameMaster.name, HomeEvent.UPDATE_GAME_LIST, activeGameUpdate);
        } else {
            this.server.to(HOME_LOBBY_ROOM_ID).emit(HomeEvent.UPDATE_GAME_LIST, activeGameUpdate);
        }
    }

    destroyRoom(roomId: string) {
        this.server.to(HOME_LOBBY_ROOM_ID).emit(HomeEvent.REMOVE_GAME, roomId);
    }

    updateRoomState(roomId: string, roomState: RoomState) {
        this.server.to(HOME_LOBBY_ROOM_ID).emit(HomeEvent.UPDATE_ROOM_STATE, { roomId, roomState });
    }

    private async playerChange(roomId: string, change: number) {
        const room = this.roomsManagerService.getRoom(roomId);
        if (!room) return;

        if (room.gameConfig.isFriendsOnly) {
            await this.sendToFriends(room.gameMaster.name, HomeEvent.UPDATE_PLAYER_COUNT, { roomId, playerCount: change });
        } else {
            this.server.to(HOME_LOBBY_ROOM_ID).emit(HomeEvent.UPDATE_PLAYER_COUNT, { roomId, playerCount: change });
        }
    }

    private async getFriendSockets(username: string): Promise<Set<string>> {
        const friends = await this.friendService.getAllFriendUsernames(username);
        const sockets = friends
            .map((friend) => this.connectionService.userMap.getSocketFromName(friend))
            .filter((socket) => socket !== undefined) as string[];
        return new Set(sockets);
    }

    private async sendToFriends<T>(username: string, event: SocketEvent, data: T) {
        const sockets = await this.getFriendSockets(username);
        const socketsInHomeLobby = await this.server.in(HOME_LOBBY_ROOM_ID).fetchSockets();
        socketsInHomeLobby.forEach((socket) => {
            if (sockets.has(socket.id)) {
                socket.emit(event, data);
            }
        });
    }
}
