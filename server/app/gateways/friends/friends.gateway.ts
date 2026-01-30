import { ConnectionService } from '@app/services/connection/connection.service';
import { FriendService } from '@app/services/friend/friend.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { FriendMap } from '@common/interfaces/event-maps';
import { FriendLists } from '@common/interfaces/friend-lists';
import { FriendRequestResponse } from '@common/interfaces/friend-request-response';
import { FriendEvent } from '@common/socket-events/friend-event';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class FriendsGateway {
    @WebSocketServer() server: Server<FriendMap>;
    constructor(
        private readonly friendService: FriendService,
        private readonly connectionService: ConnectionService,
        private readonly notificationService: NotificationService,
    ) {}

    @SubscribeMessage(FriendEvent.REMOVE_FRIEND)
    async removeFriend(@ConnectedSocket() socket: Socket, @MessageBody() removedName: string): Promise<void> {
        const removerName = this.connectionService.userMap.getUserFromSocket(socket.id)?.username;
        if (!removerName) return;
        await this.friendService.removeFriend(removerName, removedName);
        const socketId = this.connectionService.userMap.getSocketFromName(removedName);
        if (socketId) this.server.to(socketId).emit(FriendEvent.UPDATE_SINGLE_FRIEND, { username: removerName, isAdded: false });

        socket.emit(FriendEvent.UPDATE_SINGLE_FRIEND, { username: removedName, isAdded: false });
    }

    @SubscribeMessage(FriendEvent.FRIEND_REQUEST_RESPONSE)
    async respondToFriendRequest(@ConnectedSocket() socket: Socket, @MessageBody() answer: FriendRequestResponse): Promise<void> {
        const recipientName = this.connectionService.userMap.getUserFromSocket(socket.id)?.username;
        if (!recipientName) return;
        const socketId = this.connectionService.userMap.getSocketFromName(answer.senderName);
        if (answer.isAccepted) {
            await this.friendService.addFriend(recipientName, answer.senderName);
            if (socketId) this.server.to(socketId).emit(FriendEvent.UPDATE_SINGLE_FRIEND, { username: recipientName, isAdded: true });
            socket.emit(FriendEvent.UPDATE_SINGLE_FRIEND, { username: answer.senderName, isAdded: true });
        } else {
            if (socketId) this.server.to(socketId).emit(FriendEvent.REQUEST_IGNORED, recipientName);
            socket.emit(FriendEvent.REQUEST_IGNORED, answer.senderName);
        }
    }

    @SubscribeMessage(FriendEvent.GET_FRIENDS)
    async updateFriendList(@ConnectedSocket() socket: Socket): Promise<FriendLists> {
        const username = this.connectionService.userMap.getUserFromSocket(socket.id)?.username;
        if (!username) return { friends: [], notFriends: [], pending: [] };
        const notFriends = await this.friendService.getAllNotFriendsUsernames(username);
        const pendingList = await this.notificationService.getPendingUsers(username);
        const notFriendList = notFriends.filter((notFriend) => !pendingList.includes(notFriend));
        const friendList = await this.friendService.getAllFriendUsernames(username);
        return { friends: friendList, notFriends: notFriendList, pending: pendingList };
    }

    @SubscribeMessage(FriendEvent.NEW_USER)
    async addNewUser(@MessageBody() username: string) {
        this.server.emit(FriendEvent.ADD_NOT_FRIEND, username);
    }
}
