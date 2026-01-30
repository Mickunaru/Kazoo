import { AdminModule } from '@app/admin/admin.module';
import { ChatModule } from '@app/chat/chat.module';
import { WaitingRoomController } from '@app/controllers/waiting-room/waiting-room.controller';
import { GameManagerGateway } from '@app/gateways/game-manager/game-manager.gateway';
import { HomeLobbyGate } from '@app/gateways/home-lobby/home-lobby.gateway';
import { RoomsSettingGateway } from '@app/gateways/room-settings/room-settings.gateway';
import { TimerGateway } from '@app/gateways/timer/timer.gateway';
import { Game, gameSchema } from '@app/model/database/game';
import { ConnectionModule } from '@app/module/connection/connection.module';
import { CurrencyModule } from '@app/module/currency/currency.module';
import { NotificationModule } from '@app/module/notification/notification.module';
import { RandomGameModule } from '@app/module/random-game/random-game.module';
import { UserManagerModule } from '@app/module/user-manager/user-manager.module';
import { GameLobbyService } from '@app/services/game-lobby/game-lobby.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { HomeLobbyService } from '@app/services/home-lobby/home-lobby.service';
import { PowerUpService } from '@app/services/power-up/power-up.service';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { S3Service } from '@app/services/s3-upload/s3.service';
import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
        AdminModule,
        ConnectionModule,
        NotificationModule,
        RandomGameModule,
        CurrencyModule,
        ChatModule,
        UserManagerModule,
    ],
    providers: [
        Logger,
        RoomsManagerService,
        GameManagerGateway,
        RoomsSettingGateway,
        TimerGateway,
        HomeLobbyGate,
        HomeLobbyService,
        GameManagerService,
        GameLobbyService,
        PowerUpService,
        S3Service,
    ],
    controllers: [WaitingRoomController],
    exports: [RoomsManagerService],
})
export class RoomManagementModule {}
