import { UserManagerController } from '@app/controllers/user-manager/user-manager.controller';
import { ShopItem, shopItemSchema } from '@app/model/database/shop-item';
import { User, userSchema } from '@app/model/database/user';
import { FirebaseModule } from '@app/module/firebase/firebase.module';
import { UserManagerService } from '@app/services/user-manager/user-manager.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
    imports: [
        FirebaseModule,
        MongooseModule.forFeature([
            { name: User.name, schema: userSchema },
            { name: ShopItem.name, schema: shopItemSchema },
        ]),
    ],
    providers: [UserManagerService],
    controllers: [UserManagerController],
    exports: [UserManagerService],
})
export class UserManagerModule {}
