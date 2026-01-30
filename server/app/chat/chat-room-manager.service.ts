/* eslint-disable no-underscore-dangle */
// For the use of _id
import { MongoErrorCode } from '@app/constants/mongo-error-code';
import { ChatMessage, ChatMessagesDocument } from '@app/model/database/chat-messages';
import { ChatRoom, ChatRoomsDocument } from '@app/model/database/chat-room';
import { User, UserDocument } from '@app/model/database/user';
import { ConnectionService } from '@app/services/connection/connection.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { S3Service } from '@app/services/s3-upload/s3.service';
import { ChatRoomDto } from '@common/interfaces/chat-room';
import { ChatEventMap } from '@common/interfaces/event-maps';
import { ChatRoomType, GENERAL_CHAT_NAME, Message, MessageType } from '@common/interfaces/message';
import { WsErrorDto } from '@common/interfaces/ws-error-dto';
import { ChatEvent } from '@common/socket-events/chat-event';
import { HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RemoteSocket, Server, Socket } from 'socket.io';
import { ChatErrorMessage } from './chat.const';
import { ProfanityService } from './profanity-service/profanity.service';

@Injectable()
export class ChatRoomManagerService {
    server: Server;

    // Its mainly models
    // eslint-disable-next-line max-params
    constructor(
        private readonly connectionService: ConnectionService,
        private readonly profanityService: ProfanityService,
        private readonly s3Service: S3Service,
        private readonly notificationService: NotificationService,
        private logger: Logger,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(ChatRoom.name) private readonly chatRoomModel: Model<ChatRoomsDocument>,
        @InjectModel(ChatMessage.name) private readonly chatMessageModel: Model<ChatMessagesDocument>,
    ) {}

    async sendRealtimeMessage(messageObj: Message, client: Socket): Promise<Message> {
        const user = this.connectionService.userMap.getUserFromSocket(client.id);
        if (!user) throw Error('User Does Not exists');
        const clientName = user.username;

        const avatar = (await this.userModel.findOne({ username: clientName }))?.avatar;
        if (!avatar) this.logger.warn(`Avatar is NULL ${avatar}`);

        const cleanedText = this.profanityService.clean(messageObj.text);
        const formattedMessage: Message = {
            author: clientName,
            text: cleanedText,
            date: new Date(),
            room: messageObj.room,
            type: messageObj.type,
            duration: messageObj.duration,
            avatar: avatar ?? '',
        };

        await this.chatMessageModel.create(formattedMessage);

        let tokens: string[] = [];
        if (messageObj.room === GENERAL_CHAT_NAME) {
            tokens = (await this.userModel.find({ fcmToken: { $ne: '' }, username: { $ne: clientName } }, { fcmToken: 1, _id: 0 })).map(
                (obj) => obj.fcmToken,
            );
        } else {
            const room = await this.getRoomByName(messageObj.room);
            if (!room) throw new Error('Room Not found');
            const members = room.members.filter((username) => username !== clientName);
            tokens = (await this.userModel.find({ username: { $in: members }, fcmToken: { $ne: '' } }, { fcmToken: 1, _id: 0 })).map(
                (obj) => obj.fcmToken,
            );
        }

        for (const token of tokens) {
            this.notificationService.sendPushNotification(token, `${clientName}: ${cleanedText}`);
        }

        return formattedMessage;
    }

    async updateUnseen(room: string) {
        if (room === GENERAL_CHAT_NAME) {
            await this.userModel.updateMany(
                {}, // all users
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    $inc: { 'chatRooms.$[elem].unreadMessages': 1 },
                },
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    arrayFilters: [{ 'elem.name': room }],
                },
            );
            return;
        }
        const members = (await this.chatRoomModel.findOne({ name: room }))?.members;
        await this.userModel.updateMany(
            { username: { $in: members } },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { $inc: { 'chatRooms.$[elem].unreadMessages': 1 } },
            {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                arrayFilters: [{ 'elem.name': room }],
            },
        );
    }

    async seeUnreadMessages(room: string, socket: Socket) {
        const username = this.connectionService.userMap.getUserFromSocket(socket.id)?.username;
        if (!username) return;

        // eslint-disable-next-line @typescript-eslint/naming-convention
        await this.userModel.updateOne({ username, 'chatRooms.name': room }, { $set: { 'chatRooms.$.unreadMessages': 0 } });
    }

    // eslint-disable-next-line max-params
    async createRoom(name: string, type: ChatRoomType, hasSoundboard: boolean, client?: Socket): Promise<ChatRoom | WsErrorDto> {
        name = name.trim();
        if (!name) return { error: ChatErrorMessage.EMPTY_NAME, code: HttpStatus.BAD_REQUEST };

        const creator = client ? this.connectionService.userMap.getUserFromSocket(client.id)?.username : undefined;
        if (client && !creator) throw new NotFoundException('Client not found');

        try {
            const room = await this.chatRoomModel.create({ name, type, creator, members: creator ? [creator] : [], hasSoundboard });
            await this.userModel.updateOne({ username: creator }, { $push: { chatRooms: { name: room.name, unreadMessages: 0 } } });

            client?.join(room._id.toString());
            this.logger.log(`Room '${name}' created with ID '${room._id.toString()}'`, 'Chat');
            return room;
        } catch (e) {
            if (e.code === MongoErrorCode.DUPLICATE_KEY) return { error: ChatErrorMessage.ROOM_EXISTS, code: HttpStatus.CONFLICT };
            else throw e;
        }
    }

    async getJoinedRooms(socket: Socket): Promise<ChatRoomDto[] | void> {
        const username = this.connectionService.userMap.getUserFromSocket(socket.id)?.username;
        if (!username) return;
        const user = await this.userModel.findOne({ username });
        if (!user) return;

        const chatRooms = await this.chatRoomModel.find({ name: { $in: user.chatRooms.map((room) => room.name) } });
        if (!chatRooms) return;
        if (chatRooms.length === 0) return;
        if (chatRooms.length !== user.chatRooms.length) {
            this.logger.warn(`User ${username} has ${user.chatRooms.length} chat rooms, but only ${chatRooms.length} found in DB`, 'Chat');
        }

        const result: ChatRoomDto[] = [];
        const userRoomsToDelete: string[] = [];
        user.chatRooms.forEach((userRoom) => {
            const room = chatRooms.find((chatRoom) => chatRoom.name === userRoom.name);
            if (!room) {
                userRoomsToDelete.push(userRoom.name);
                return;
            }

            result.push({
                _id: room._id,
                name: room.name,
                type: room.type,
                members: room.members,
                creator: room.creator,
                hasSoundboard: room.hasSoundboard,
                unreadMessages: userRoom.unreadMessages,
            });
        });

        if (userRoomsToDelete.length > 0) {
            const updatedUser = await this.userModel.findOneAndUpdate(
                { username },
                { $pull: { chatRooms: { name: { $in: userRoomsToDelete } } } },
                { new: true },
            );
            this.logger.warn(`User ${username} has ${updatedUser?.chatRooms.length} chat rooms, and ${chatRooms.length} found in DB`, 'Chat');
        }

        return result;
    }

    async getMessages(roomName: string): Promise<Message[]> {
        const messages = await this.chatMessageModel
            .aggregate()
            .match({ room: roomName })
            .sort({ date: 1 })
            .lookup({
                from: 'users',
                localField: 'author',
                foreignField: 'username',
                as: 'authorData',
            })
            .project({
                text: 1,
                date: 1,
                room: 1,
                type: 1,
                author: 1,
                duration: 1,
                avatar: { $arrayElemAt: ['$authorData.avatar', 0] },
            })
            .exec();
        return messages as Message[];
    }

    async connectUser(socket: Socket): Promise<void> {
        const chatRooms = await this.getJoinedRooms(socket);
        if (!chatRooms) return;
        chatRooms.forEach((room) => {
            if (!room || !room._id) {
                this.logger.warn(`Could not join Room ${room.name}`);
                return;
            }
            socket.join(room._id.toString());
        });
    }

    async leaveRoom(roomName: string, socket: Socket): Promise<ChatRoom | undefined> {
        if (roomName === GENERAL_CHAT_NAME) return;
        const username = this.connectionService.userMap.getUserFromSocket(socket.id)?.username;
        if (!username) return;

        await this.userModel.updateOne({ username }, { $pull: { chatRooms: { name: roomName } } });
        const room = await this.chatRoomModel.findOneAndUpdate({ name: roomName }, { $pull: { members: username } }, { new: true });
        if (!room) return; // case where we are leaving a deleted room
        socket.leave(room._id.toString());

        if (room.creator === username && room.members.length > 0) {
            await this.chatRoomModel.updateOne({ name: roomName }, { $set: { creator: room.members[0] } });
            const newCreatorSocket = this.connectionService.userMap.getSocketFromName(room.members[0]);
            if (newCreatorSocket) socket.to(newCreatorSocket).emit(ChatEvent.CREATOR_UPGRADE, roomName);
        }

        if (room.members.length <= 0) {
            await this.deleteRoom(roomName);
        }

        this.logger.log(`Client '${socket.id}' removed from room '${roomName}'`, 'Chat');
        return room;
    }

    async getRoomByName(roomName: string): Promise<ChatRoom | null> {
        const room = await this.chatRoomModel.findOne({ name: roomName });
        return room;
    }

    async getSocketRoomId(roomName: string): Promise<string | null> {
        const room = await this.chatRoomModel.findOne({ name: roomName }, { _id: 1 });
        return room?._id.toString();
    }

    async getOtherRooms(client: Socket): Promise<ChatRoom[]> {
        const username = this.connectionService.userMap.getUserFromSocket(client.id)?.username;
        if (!username) return [];

        const rooms = await this.chatRoomModel.find({ type: ChatRoomType.CUSTOM, members: { $ne: username } });
        return rooms;
    }

    async joinRoom(client: Socket | RemoteSocket<ChatEventMap, unknown>, roomName: string): Promise<ChatRoomDto | undefined> {
        const username = this.connectionService.userMap.getUserFromSocket(client.id)?.username;
        if (!username) return;

        const result = await Promise.all([
            this.userModel.updateOne({ username }, { $push: { chatRooms: { name: roomName, unreadMessages: 0 } } }),
            this.chatRoomModel.findOneAndUpdate({ name: roomName }, { $push: { members: username } }, { new: true }),
        ]);
        const room = result[1] as ChatRoom;
        if (!room._id) return;
        client.join(room._id.toString());
        this.logger.log(`'${username}' added to room '${roomName}'`, 'Chat');

        // weirdly unpacking the room like this: { unreadMessages: 0, ...room } leads to errors
        return {
            name: room.name,
            type: room.type,
            members: room.members,
            creator: room.creator,
            hasSoundboard: room.hasSoundboard,
            unreadMessages: 0,
        };
    }

    async deleteRoom(roomName: string) {
        const room = await this.chatRoomModel.findOne({
            name: roomName,
        });
        if (!room) return; // Room already deleted

        this.server.socketsLeave(room._id.toString());
        this.server.emit(ChatEvent.DELETE_ROOM, roomName);

        const audioMessages = await this.chatMessageModel.find({ room: roomName, type: MessageType.SOUND });
        audioMessages.forEach((message) => {
            const fileName = message.text.split('/').pop();
            if (fileName) this.s3Service.deleteAudioFile(fileName);
        });
        await Promise.all([
            this.chatRoomModel.deleteOne({ name: roomName }),
            this.chatMessageModel.deleteMany({ room: roomName }),
            this.userModel.updateMany({}, { $pull: { chatRooms: { name: roomName } } }),
        ]);

        this.logger.log(`Room '${roomName}' deleted`, 'Chat');
    }

    formatTeamChatId(roomId: string, team: string): string {
        return `${roomId}#${team}#`;
    }

    formatRoomChatId(roomId: string): string {
        return `${roomId}#`;
    }
}
