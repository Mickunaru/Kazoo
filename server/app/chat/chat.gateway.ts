/* eslint-disable @typescript-eslint/member-ordering */
// For lifecycle method
import { ChatRoomManagerService } from '@app/chat/chat-room-manager.service';
import { ChatRoomDto } from '@common/interfaces/chat-room';
import { ChatEventMap } from '@common/interfaces/event-maps';
import { ChatRoomType, Message } from '@common/interfaces/message';
import { SoundboardRequest } from '@common/interfaces/soundboard-request';
import { ChatEvent } from '@common/socket-events/chat-event';
import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayInit {
    @WebSocketServer() server: Server<ChatEventMap>;
    constructor(
        private readonly chatRoomManagerService: ChatRoomManagerService,
        private readonly logger: Logger,
    ) {}

    afterInit(server: Server) {
        this.chatRoomManagerService.server = server;
    }

    @SubscribeMessage(ChatEvent.SEND_MESSAGE)
    async handleMessage(@ConnectedSocket() client: Socket<ChatEventMap>, @MessageBody() message: Message) {
        try {
            const formattedMessage = await this.chatRoomManagerService.sendRealtimeMessage(message, client);
            const socketRoomId = await this.chatRoomManagerService.getSocketRoomId(message.room);
            if (!socketRoomId) throw Error(`Socket Room Id is null ${socketRoomId}`);
            await this.chatRoomManagerService.updateUnseen(message.room);
            this.server.to(socketRoomId).emit(ChatEvent.SEND_MESSAGE, formattedMessage);
            Logger.log(`Message sent by '${client.id}' in '${message.room}'`, 'Chat');
        } catch (error) {
            this.logger.error(error);
        }
    }

    @SubscribeMessage(ChatEvent.SEND_CHAT_HISTORY)
    async handleChatHistory(@MessageBody() roomName: string): Promise<Message[]> {
        return this.chatRoomManagerService.getMessages(roomName);
    }

    @SubscribeMessage(ChatEvent.CREATE_CHAT_ROOM)
    async createRoom(@ConnectedSocket() client: Socket<ChatEventMap>, @MessageBody() roomName: string) {
        const room = await this.chatRoomManagerService.createRoom(roomName, ChatRoomType.CUSTOM, false, client);
        client.broadcast.emit(ChatEvent.CREATE_CHAT_ROOM, room);
        return room;
    }

    @SubscribeMessage(ChatEvent.GET_OTHER_ROOMS)
    async getRooms(@ConnectedSocket() client: Socket<ChatEventMap>): Promise<ChatRoomDto[]> {
        return this.chatRoomManagerService.getOtherRooms(client);
    }

    @SubscribeMessage(ChatEvent.GET_JOINED_ROOMS)
    async getJoinedRooms(@ConnectedSocket() client: Socket<ChatEventMap>): Promise<ChatRoomDto[] | void> {
        return this.chatRoomManagerService.getJoinedRooms(client);
    }

    @SubscribeMessage(ChatEvent.JOIN_ROOM)
    async joinRoom(@ConnectedSocket() client: Socket<ChatEventMap>, @MessageBody() roomName: string): Promise<ChatRoomDto | undefined> {
        return this.chatRoomManagerService.joinRoom(client, roomName);
    }

    @SubscribeMessage(ChatEvent.LEAVE_ROOM)
    async leaveRoom(@ConnectedSocket() client: Socket<ChatEventMap>, @MessageBody() roomName: string): Promise<ChatRoomDto | undefined> {
        const room = await this.chatRoomManagerService.leaveRoom(roomName, client);
        if (!room) return undefined;
        return { unreadMessages: 0, ...room };
    }

    @SubscribeMessage(ChatEvent.DELETE_ROOM)
    async deleteRoom(@MessageBody() roomName: string) {
        await this.chatRoomManagerService.deleteRoom(roomName);
    }

    @SubscribeMessage(ChatEvent.SEND_SOUND)
    async handleSound(@MessageBody() req: SoundboardRequest) {
        const socketRoomId = await this.chatRoomManagerService.getSocketRoomId(req.room);
        if (!socketRoomId) {
            this.logger.error(`Socket Room Id is nullish: ${socketRoomId}`);
            return;
        }
        this.server.to(socketRoomId).emit(ChatEvent.SEND_SOUND, req.sound);
    }

    @SubscribeMessage(ChatEvent.SEE_UNREAD_MESSAGES)
    async handleSeeUnreadMessages(@ConnectedSocket() client: Socket<ChatEventMap>, @MessageBody() roomName: string) {
        await this.chatRoomManagerService.seeUnreadMessages(roomName, client);
    }
}
