import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitter } from 'stream';
import { AdminModule } from './admin/admin.module';
import { ChatModule } from './chat/chat.module';
import { ConnectionModule } from './module/connection/connection.module';
import { NotificationModule } from './module/notification/notification.module';
import { PowerUpModule } from './module/power-up/power-up.module';
import { RoomManagementModule } from './module/room-management/room-management.module';
import { S3Module } from './module/S3-upload/s3.module';
import { ShopModule } from './module/shop/shop.module';
import { UserManagerModule } from './module/user-manager/user-manager.module';

const MAX_EVENT_LISTENERS = 20;
EventEmitter.setMaxListeners(MAX_EVENT_LISTENERS);
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, cache: true }),
        MongooseModule.forRootAsync({
            imports: [
                ConfigModule,
                AdminModule,
                RoomManagementModule,
                ChatModule,
                UserManagerModule,
                ShopModule,
                ConnectionModule,
                NotificationModule,
                S3Module,
                PowerUpModule,
            ],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'),
            }),
        }),
    ],
    providers: [Logger],
})
export class AppModule {}
