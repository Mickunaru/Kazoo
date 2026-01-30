import { ShopController } from '@app/controllers/shop/shop.controller';
import { ShopItem, shopItemSchema } from '@app/model/database/shop-item';
import { User, userSchema } from '@app/model/database/user';
import { CurrencyModule } from '@app/module/currency/currency.module';
import { FirebaseModule } from '@app/module/firebase/firebase.module';
import { UserManagerModule } from '@app/module/user-manager/user-manager.module';
import { ShopService } from '@app/services/shop/shop.service';
import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        UserManagerModule,
        FirebaseModule,
        CurrencyModule,
        MongooseModule.forFeature([
            { name: ShopItem.name, schema: shopItemSchema },
            { name: User.name, schema: userSchema },
        ]),
    ],
    providers: [ShopService, Logger],
    controllers: [ShopController],
    exports: [ShopService],
})
export class ShopModule {}
