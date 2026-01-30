import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SERVER_URL_API } from '@app/constants/server-url-and-api-constant';
import { PageUrl } from '@app/enum/page-url';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { WAITING_ROOM_ENDPOINT } from '@common/constants/endpoint-constants';
import { GameMode } from '@common/enum/game-mode';
import { RoomAccessStatus } from '@common/enum/room-access-status';
import { GameConfigDto } from '@common/interfaces/game-config-dto';
import { JoinConfigs } from '@common/interfaces/join-configs';
import { RoomId } from '@common/interfaces/room-id';
import { RoomEvent } from '@common/socket-events/room-event';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RoomService {
    roomId: string;
    isGameMaster: boolean = false;
    isLocked: boolean = false;
    gameMode: GameMode;
    baseUrl = `${SERVER_URL_API}/${WAITING_ROOM_ENDPOINT}`;
    arePowerUpsEnabled: boolean = false;

    // eslint-disable-next-line max-params
    constructor(
        private readonly http: HttpClient,
        private readonly router: Router,
        private readonly webSocketService: WebsocketService,
    ) {}

    resetManager() {
        this.roomId = '';
        this.isGameMaster = false;
        this.isLocked = false;
        this.gameMode = GameMode.CLASSIC;
        this.arePowerUpsEnabled = false;
    }

    async canPlayerJoinRoom(roomId: string): Promise<RoomAccessStatus> {
        return this.webSocketService.sendWithAck(RoomEvent.CAN_JOIN_ROOM, roomId);
    }

    async createRoomAndJoin(gameConfig: GameConfigDto, creatorSocketId: string): Promise<void> {
        const { roomId } = await firstValueFrom(this.http.post<RoomId>(this.baseUrl, { gameConfig, creatorId: creatorSocketId }));
        this.roomId = roomId;
        this.isGameMaster = true;
        this.gameMode = gameConfig.gameMode;

        await this.setupAndJoin();
    }

    async playerJoinRoom(roomId: string) {
        this.roomId = roomId;
        this.isGameMaster = false;

        await this.setupAndJoin();
    }

    navigateToGamePage() {
        if (this.isGameMaster && this.gameMode !== GameMode.ELIMINATION) {
            this.router.navigate([`/${PageUrl.APP_PREFIX}/${PageUrl.GAME_MASTER}`]);
        } else {
            this.router.navigate([`/${PageUrl.APP_PREFIX}/${PageUrl.GAME}`]);
        }
    }

    private async setupAndJoin() {
        this.isLocked = false;

        const { gameMode, arePowerUpsEnabled } = await this.webSocketService.sendWithAck<string, JoinConfigs>(RoomEvent.JOIN_ROOM, this.roomId);
        this.gameMode = gameMode;
        this.arePowerUpsEnabled = arePowerUpsEnabled;

        this.router.navigate([`/${PageUrl.APP_PREFIX}/${PageUrl.WAITING_ROOM}`]);
    }
}
