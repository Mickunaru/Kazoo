import { User, userSchema } from '@app/model/database/user';
import { CurrencyService } from '@app/services/currency/currency.service';
import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: userSchema }])],
    providers: [CurrencyService, Logger],
    exports: [CurrencyService],
})
export class CurrencyModule {}
