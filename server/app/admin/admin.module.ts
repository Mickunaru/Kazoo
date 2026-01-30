import { GameLibraryController } from '@app/admin/controllers/game-library/game-library.controller';
import { QuestionLibraryController } from '@app/admin/controllers/question-library/question-library.controller';
import { GameLibraryService } from '@app/admin/services/game-library/game-library.service';
import { QuestionService as QuestionLibraryService } from '@app/admin/services/question/question.service';
import { Game, gameSchema } from '@app/model/database/game';
import { Question, questionSchema } from '@app/model/database/question';
import { FirebaseModule } from '@app/module/firebase/firebase.module';
import { S3Module } from '@app/module/S3-upload/s3.module';
import { UserManagerModule } from '@app/module/user-manager/user-manager.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
    imports: [
        UserManagerModule,
        S3Module,
        FirebaseModule,
        MongooseModule.forFeature([
            { name: Question.name, schema: questionSchema },
            { name: Game.name, schema: gameSchema },
        ]),
    ],
    providers: [QuestionLibraryService, GameLibraryService],
    controllers: [QuestionLibraryController, GameLibraryController],
    exports: [GameLibraryService],
})
export class AdminModule {}
