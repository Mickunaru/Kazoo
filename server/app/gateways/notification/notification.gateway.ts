import { Notification } from '@app/model/database/notification';
import { NotificationDto } from '@app/model/dto/notification/notification.dto';
import { ConnectionService } from '@app/services/connection/connection.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { UserManagerService } from '@app/services/user-manager/user-manager.service';
import { NotificationType } from '@common/enum/notification-type';
import { NotificationMap } from '@common/interfaces/event-maps';
import { FriendRequestResponse } from '@common/interfaces/friend-request-response';
import { FriendEvent } from '@common/socket-events/friend-event';
import { NotificationEvent } from '@common/socket-events/notification-event';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class NotificationGateway {
    @WebSocketServer() server: Server<NotificationMap>;
    constructor(
        private readonly notificationService: NotificationService,
        private readonly connectionService: ConnectionService,
        private readonly userManagerService: UserManagerService,
    ) {}

    @SubscribeMessage(NotificationEvent.SEND_FRIEND_REQUEST)
    async sendFriendRequest(@ConnectedSocket() socket: Socket, @MessageBody() friendName: string): Promise<void> {
        const senderUsername = this.connectionService.userMap.getUserFromSocket(socket.id)?.username;
        if (!senderUsername) return;

        const newFriendRequest: NotificationDto = {
            type: NotificationType.FriendRequest,
            recipientUsername: friendName,
            senderUsername,
        };

        const newNotification = await this.notificationService.createNotification(newFriendRequest);
        const socketId = this.connectionService.userMap.getSocketFromName(friendName);

        if (socketId) {
            this.server.to(socketId).emit(NotificationEvent.ADD_NOTIFICATION, newNotification);
            const user = await this.userManagerService.getUserByUsername(friendName);
            if (user && user.fcmToken) {
                await this.notificationService.sendPushNotification(user.fcmToken, `${senderUsername} vous a envoyé une demande d'ami!`);
            }
        }
    }

    @SubscribeMessage(NotificationEvent.GET_NOTIFICATIONS)
    async updateNotifications(@ConnectedSocket() socket: Socket): Promise<Notification[]> {
        const recipientName = this.connectionService.userMap.getUserFromSocket(socket.id)?.username;
        if (!recipientName) return [];
        const notifications = await this.notificationService.getUserNotifications(recipientName);
        return notifications;
    }

    @SubscribeMessage(FriendEvent.FRIEND_REQUEST_RESPONSE)
    async respondToFriendRequest(@ConnectedSocket() _socket: Socket, @MessageBody() answer: FriendRequestResponse): Promise<void> {
        this.notificationService.deleteNotification(answer.notificationId);
    }
}
