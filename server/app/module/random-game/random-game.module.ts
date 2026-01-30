import { RandomGameController } from '@app/controllers/random-game/random-game.controller';
import { Question, questionSchema } from '@app/model/database/question';
import { RandomGameService } from '@app/services/random-game/random-game.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
    imports: [MongooseModule.forFeature([{ name: Question.name, schema: questionSchema }])],
    providers: [RandomGameService],
    controllers: [RandomGameController],
    exports: [RandomGameService],
})
export class RandomGameModule {}
