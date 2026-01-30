import { ChatRoomManagerService } from '@app/chat/chat-room-manager.service';
import { ChatGateway } from '@app/chat/chat.gateway';
import { ChatMessage, chatMessageSchema } from '@app/model/database/chat-messages';
import { ChatRoom, chatRoomSchema } from '@app/model/database/chat-room';
import { Notification, notificationSchema } from '@app/model/database/notification';
import { User, userSchema } from '@app/model/database/user';
import { FirebaseModule } from '@app/module/firebase/firebase.module';
import { S3Module } from '@app/module/S3-upload/s3.module';
import { NotificationService } from '@app/services/notification/notification.service';
import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ProfanityService } from './profanity-service/profanity.service';

@Module({
    imports: [
        FirebaseModule,
        MongooseModule.forFeature([
            { name: Notification.name, schema: notificationSchema },
            { name: User.name, schema: userSchema },
            { name: ChatRoom.name, schema: chatRoomSchema },
            { name: ChatMessage.name, schema: chatMessageSchema },
        ]),
        S3Module,
    ],
    providers: [Logger, ChatRoomManagerService, ChatGateway, ProfanityService, NotificationService],
    exports: [ChatRoomManagerService],
    controllers: [ChatController],
})
export class ChatModule {}
