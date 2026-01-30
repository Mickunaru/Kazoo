import { FriendsGateway } from '@app/gateways/friends/friends.gateway';
import { NotificationGateway } from '@app/gateways/notification/notification.gateway';
import { Notification, notificationSchema } from '@app/model/database/notification';
import { ShopItem, shopItemSchema } from '@app/model/database/shop-item';
import { User, userSchema } from '@app/model/database/user';
import { ConnectionModule } from '@app/module/connection/connection.module';
import { FirebaseModule } from '@app/module/firebase/firebase.module';
import { FriendService } from '@app/services/friend/friend.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { UserManagerService } from '@app/services/user-manager/user-manager.service';
import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Notification.name, schema: notificationSchema },
            { name: User.name, schema: userSchema },
            { name: ShopItem.name, schema: shopItemSchema },
        ]),
        ConnectionModule,
        FirebaseModule,
    ],
    providers: [Logger, NotificationService, NotificationGateway, FriendService, FriendsGateway, UserManagerService],
    exports: [FriendService],
})
export class NotificationModule {}
