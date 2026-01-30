import { getFakeMultiChoiceDto } from '@app/constants/game-test-utils';
import { ID_MOCK } from '@app/constants/test-utils';
import { DocumentNotFoundError } from '@app/exceptions/document-not-found-exception';
import { Question, QuestionDocument, questionSchema } from '@app/model/database/question';
import { UserDocument } from '@app/model/database/user';
import { QuestionDto } from '@app/model/dto/question/question.dto';
import { UserManagerService } from '@app/services/user-manager/user-manager.service';
import { QuestionType } from '@common/enum/question-type';
import { Logger } from '@nestjs/common';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { QuestionService } from './question.service';

describe('QuestionService', () => {
    let service: QuestionService;
    let questionModel: Model<QuestionDocument>;
    let userManagerStub: SinonStubbedInstance<UserManagerService>;

    beforeEach(async () => {
        questionModel = {} as unknown as Model<QuestionDocument>;
        userManagerStub = createStubInstance(UserManagerService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuestionService,
                {
                    provide: getModelToken(Question.name),
                    useValue: questionModel,
                },
                { provide: UserManagerService, useValue: userManagerStub },
            ],
        }).compile();

        service = module.get<QuestionService>(QuestionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

describe('QuestionServiceEndToEnd', () => {
    let service: QuestionService;
    let questionModel: Model<QuestionDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;
    let questionDto: QuestionDto;
    let userManagerStub: SinonStubbedInstance<UserManagerService>;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
    });

    beforeEach(async () => {
        userManagerStub = createStubInstance(UserManagerService);

        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Question.name, schema: questionSchema }]),
            ],

            providers: [QuestionService, Logger, { provide: UserManagerService, useValue: userManagerStub }],
        }).compile();

        service = module.get<QuestionService>(QuestionService);
        questionModel = module.get<Model<QuestionDocument>>(getModelToken(Question.name));
        connection = await module.get(getConnectionToken());
        await questionModel.deleteMany({});
        questionDto = getFakeMultiChoiceDto();
    });

    const questionValidator = (updatedQuestion: Question, updateQuestionDto: QuestionDto) => {
        expect(updatedQuestion.type).toEqual(QuestionType.MultiChoice);
        expect(updatedQuestion.text).toEqual(updateQuestionDto.text);
        expect(updatedQuestion.points).toEqual(updateQuestionDto.points);
        for (let j = 0; j < updatedQuestion.choices.length; j++) {
            expect(updatedQuestion.choices[j].text).toEqual(updateQuestionDto.choices[j].text);
            expect(updatedQuestion.choices[j].isCorrect).toEqual(updateQuestionDto.choices[j].isCorrect);
        }
    };

    afterEach(async () => {
        await connection.close();
    });

    afterAll(async () => {
        await mongoServer.stop();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(questionModel).toBeDefined();
    });

    it('getQuestions() return all questions in database', async () => {
        expect((await service.getQuestions()).length).toEqual(0);
        await questionModel.create(questionDto);
        expect((await service.getQuestions()).length).toEqual(1);
    });

    it('getQuestion() return question with the specified id', async () => {
        const createdQuestion = await questionModel.create(questionDto);
        expect(await service.getQuestion(createdQuestion.id)).toEqual(expect.objectContaining(questionDto));
    });

    it('getQuestion() should fail if question does not exist', async () => {
        await expect(service.getQuestion(ID_MOCK)).rejects.toThrowError(DocumentNotFoundError);
    });

    it('updateQuestion() should create question if question does not exist', async () => {
        const updatedQuestion = await service.updateQuestion(ID_MOCK, questionDto);
        questionValidator(updatedQuestion, questionDto);
    });

    it('updateQuestion() should fail if mongo query failed', async () => {
        jest.spyOn(questionModel, 'findByIdAndUpdate').mockRejectedValue('');
        await expect(service.updateQuestion(ID_MOCK, questionDto)).rejects.toEqual('');
    });

    it('updateQuestion() should update question', async () => {
        const createdQuestion = await questionModel.create(questionDto);
        const updateQuestionDto = getFakeMultiChoiceDto();
        const updatedQuestion = await service.updateQuestion(createdQuestion.id, updateQuestionDto);
        questionValidator(updatedQuestion, updateQuestionDto);
    });

    it('deleteQuestion() should delete the question', async () => {
        const newQuestion = await questionModel.create(questionDto);
        await service.deleteQuestion(newQuestion.id);
        expect(await questionModel.countDocuments()).toEqual(0);
    });

    it('deleteQuestion() should fail if the question does not exist', async () => {
        await expect(service.deleteQuestion(ID_MOCK)).rejects.toThrowError(DocumentNotFoundError);
    });

    it('deleteQuestion() should fail if mongo query failed', async () => {
        jest.spyOn(questionModel, 'findByIdAndDelete').mockRejectedValue('');
        await expect(service.deleteQuestion(ID_MOCK)).rejects.toEqual('');
    });

    it('createQuestion() should add the question to the DB', async () => {
        userManagerStub.getUserById.resolves({ username: 'name' } as UserDocument);
        const newQuestion = await service.createQuestion(questionDto, 'name');
        expect(await questionModel.countDocuments()).toEqual(1);
        expect(newQuestion).toEqual(expect.objectContaining(questionDto));
    });
});
