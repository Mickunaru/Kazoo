import { NOT_ENOUGH_QUESTIONS } from '@app/constants/error-message-constants';
import { RANDOM_GAME_DURATION, RANDOM_GAME_NAME } from '@app/constants/random-game-defaults';
import { Game } from '@app/model/database/game';
import { Question } from '@app/model/database/question';
import { QuestionType } from '@common/enum/question-type';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class RandomGameService {
    constructor(@InjectModel(Question.name) private readonly questionModel: Model<Question>) {}

    async generateGame(questionCount: number): Promise<Game> {
        const questions = await this.getRandomQuestions(questionCount);
        if (questions.length < questionCount) {
            throw new BadRequestException(NOT_ENOUGH_QUESTIONS);
        }

        const game = new Game();
        game.questions = questions;
        game.duration = RANDOM_GAME_DURATION;
        game.title = RANDOM_GAME_NAME;
        game.id = null;
        return game;
    }

    async countAvailableQuestionsForRandomGame() {
        return await this.questionModel.count({ type: { $in: [QuestionType.MultiChoice, QuestionType.Estimation] } });
    }

    private async getRandomQuestions(questionCount: number): Promise<Question[]> {
        return await this.questionModel
            .aggregate()
            .match({ type: { $in: [QuestionType.MultiChoice, QuestionType.Estimation] } })
            .sample(questionCount)
            .exec();
    }
}
