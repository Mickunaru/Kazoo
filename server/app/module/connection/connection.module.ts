import { ChatModule } from '@app/chat/chat.module';
import { ConnectionGateway } from '@app/gateways/connection/connection.gateway';
import { FirebaseModule } from '@app/module/firebase/firebase.module';
import { Logger, Module } from '@nestjs/common';

@Module({
    imports: [FirebaseModule, ChatModule],
    providers: [Logger, ConnectionGateway],
    exports: [FirebaseModule],
})
export class ConnectionModule {}
