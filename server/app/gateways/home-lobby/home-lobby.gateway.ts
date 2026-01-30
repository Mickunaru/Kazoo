/* eslint-disable @typescript-eslint/member-ordering */
// For lifecycle method
import { HomeLobbyService } from '@app/services/home-lobby/home-lobby.service';
import { HomeLobbyMap } from '@common/interfaces/event-maps';
import { HomeEvent } from '@common/socket-events/home-event';
import { Logger } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class HomeLobbyGate implements OnGatewayConnection {
    constructor(
        private readonly homeLobbyService: HomeLobbyService,
        private readonly logger: Logger,
    ) {}

    afterInit(server: Server) {
        this.homeLobbyService.server = server;
    }

    handleConnection(client: Socket<HomeLobbyMap>) {
        this.logger.log(`Client connected: ${client.id}`);
        client.emit(HomeEvent.CONNECTION_ACK);
    }

    @SubscribeMessage(HomeEvent.JOIN_HOME_LOBBY)
    joinHomeLobby(@ConnectedSocket() client: Socket<HomeLobbyMap>) {
        this.homeLobbyService.joinHomeLobby(client);
    }

    @SubscribeMessage(HomeEvent.LEAVE_HOME_LOBBY)
    leaveHomeLobby(@ConnectedSocket() client: Socket<HomeLobbyMap>) {
        this.homeLobbyService.leaveHomeLobby(client);
    }
}
