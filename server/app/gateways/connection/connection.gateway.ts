import { ChatRoomManagerService } from '@app/chat/chat-room-manager.service';
import { UserId } from '@app/interfaces/connection/user-id.interface';
import { ConnectionService } from '@app/services/connection/connection.service';
import { AuthEvent } from '@common/socket-events/auth-event';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { firstValueFrom, take, timer } from 'rxjs';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ConnectionGateway implements OnGatewayDisconnect {
    constructor(
        private readonly connectionService: ConnectionService,
        private readonly chatRoomManagerService: ChatRoomManagerService,
    ) {}

    @SubscribeMessage(AuthEvent.USER_LOGIN)
    userLogin(@ConnectedSocket() client: Socket, @MessageBody() user: UserId) {
        this.connectionService.signIn(client.id, user);
        this.chatRoomManagerService.connectUser(client);
    }

    async handleDisconnect(client: Socket) {
        const waitTime = 1000;
        await firstValueFrom(timer(waitTime).pipe(take(1)));
        await this.connectionService.signout(client.id);
    }
}
