import { PowerUpGateway } from '@app/gateways/power-up/power-up.gateway';
import { ConnectionModule } from '@app/module/connection/connection.module';
import { UserManagerModule } from '@app/module/user-manager/user-manager.module';
import { Logger, Module } from '@nestjs/common';
import { RoomManagementModule } from 'app/module/room-management/room-management.module';

@Module({
    imports: [ConnectionModule, RoomManagementModule, UserManagerModule],
    providers: [Logger, PowerUpGateway],
    controllers: [],
    exports: [],
})
export class PowerUpModule {}
