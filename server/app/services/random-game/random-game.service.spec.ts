import { RANDOM_GAME_DURATION, RANDOM_GAME_NAME } from '@app/constants/random-game-defaults';
import { Question, QuestionDocument, questionSchema } from '@app/model/database/question';
import { QuestionType } from '@common/enum/question-type';
import { BadRequestException } from '@nestjs/common';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { RandomGameService } from './random-game.service';

describe('RandomGameService', () => {
    let service: RandomGameService;
    let questionModel: Model<QuestionDocument>;
    let connection: Connection;
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Question.name, schema: questionSchema }]),
            ],
            providers: [RandomGameService],
        }).compile();

        service = module.get<RandomGameService>(RandomGameService);
        questionModel = module.get<Model<QuestionDocument>>(getModelToken(Question.name));
        connection = await module.get(getConnectionToken());
        await questionModel.deleteMany({});
    });

    const insertQuestions = async (model: Model<QuestionDocument>) => {
        await model.collection.insertMany([
            { type: QuestionType.MultiChoice, text: 'A', uuid: 'a' },
            { type: QuestionType.Estimation, text: 'B', uuid: 'b' },
            { type: QuestionType.OpenEnded, text: 'C', uuid: 'c' },
        ]);
    };

    afterEach(async () => {
        await connection.close();
    });

    afterAll(async () => {
        await mongoServer.stop();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should generate a game', async () => {
        const questionsNeeded = 2;
        await insertQuestions(questionModel);

        const resultGame = await service.generateGame(questionsNeeded);
        expect(resultGame.questions.length).toEqual(questionsNeeded);
        expect(resultGame.duration).toEqual(RANDOM_GAME_DURATION);
        expect(resultGame.title).toEqual(RANDOM_GAME_NAME);
        expect(resultGame.id).toBeNull();
    });

    it('should fail to generate a game', async () => {
        const questionsNeeded = 5;
        await insertQuestions(questionModel);
        await expect(service.generateGame(questionsNeeded)).rejects.toThrowError(BadRequestException);
    });

    it('should count available questions', async () => {
        const questionsNeeded = 2;
        await insertQuestions(questionModel);

        expect(await service.countAvailableQuestionsForRandomGame()).toEqual(questionsNeeded);
    });

    it('should get less questions than needed', async () => {
        const questionsNeeded = 5;
        const validQuestions = 2;
        await insertQuestions(questionModel);

        const questions = await service['getRandomQuestions'](questionsNeeded);
        expect(questions.length).toEqual(validQuestions);
        expect(questions[0].text).not.toEqual(questions[1].text);
    });

    it('should get needed question count', async () => {
        const questionsNeeded = 2;
        await insertQuestions(questionModel);

        const questions = await service['getRandomQuestions'](questionsNeeded);
        expect(questions.length).toEqual(questionsNeeded);
        expect(questions[0].text).not.toEqual(questions[1].text);
    });
});
