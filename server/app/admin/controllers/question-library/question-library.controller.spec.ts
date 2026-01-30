import { QuestionService } from '@app/admin/services/question/question.service';
import { ID_MOCK, NOT_FOUND_MESSAGE, QUESTION_MOCK } from '@app/constants/test-utils';
import { DocumentNotFoundError } from '@app/exceptions/document-not-found-exception';
import { FireBaseAuthGuard } from '@app/guards/firebase-auth-guard';
import { Question } from '@app/model/database/question';
import { User } from '@app/model/database/user';
import { QuestionDto } from '@app/model/dto/question/question.dto';
import { ConnectionService } from '@app/services/connection/connection.service';
import { S3Service } from '@app/services/s3-upload/s3.service';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { QuestionLibraryController } from './question-library.controller';

describe('QuestionController', () => {
    let controller: QuestionLibraryController;
    let questionService: SinonStubbedInstance<QuestionService>;
    let s3Service: SinonStubbedInstance<S3Service>;
    const mockConnectionService = {};
    const questionDtoInstance = plainToInstance(QuestionDto, QUESTION_MOCK);

    beforeEach(async () => {
        questionService = createStubInstance(QuestionService);
        s3Service = createStubInstance(S3Service);

        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuestionLibraryController],
            providers: [
                {
                    provide: QuestionService,
                    useValue: questionService,
                },
                {
                    provide: FireBaseAuthGuard,
                    useValue: { canActivate: jest.fn().mockReturnValue(true) },
                },
                {
                    provide: ConnectionService,
                    useValue: mockConnectionService,
                },
                { provide: User, useValue: {} },
                { provide: S3Service, useValue: s3Service },
            ],
        }).compile();

        controller = module.get<QuestionLibraryController>(QuestionLibraryController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getQuestions() should return all questions', async () => {
        const fakeQuestions = [new Question(), new Question()];
        questionService.getQuestions.resolves(fakeQuestions);

        const questions = await controller.getQuestions();
        expect(questions).toBe(fakeQuestions);
    });

    it('getQuestion() should return question', async () => {
        const question = { id: ID_MOCK } as unknown as Question;
        questionService.getQuestion.resolves(question);

        expect(await controller.getQuestion(ID_MOCK)).toBe(question);
    });

    it('getQuestion() should throw NotFound', async () => {
        questionService.getQuestion.throws(new DocumentNotFoundError(NOT_FOUND_MESSAGE));

        await expect(controller.getQuestion(ID_MOCK)).rejects.toThrowError(NotFoundException);
        await expect(controller.getQuestion(ID_MOCK)).rejects.toThrow(NOT_FOUND_MESSAGE);
    });

    it('createQuestion() should return created Question', async () => {
        questionService.createQuestion.resolves(QUESTION_MOCK);

        const newQuestion = await controller.createQuestion(questionDtoInstance, 'name');
        expect(newQuestion.text).toEqual(QUESTION_MOCK.text);
    });

    it('updateQuestion() should return update Question', async () => {
        questionService.updateQuestion.resolves(QUESTION_MOCK);

        const newQuestion = await controller.updateQuestion(ID_MOCK, questionDtoInstance);
        expect(newQuestion.text).toEqual(QUESTION_MOCK.text);
    });

    it('updateQuestion() should throw NotFound Id not found', async () => {
        const question = plainToInstance(Question, { text: 'question' });
        questionService.updateQuestion.resolves(question);

        const newGame = await controller.updateQuestion(ID_MOCK, questionDtoInstance);
        expect(newGame.text).toEqual(questionDtoInstance.text);
    });

    it('deleteQuestion() should return delete Question', async () => {
        questionService.deleteQuestion.resolves(QUESTION_MOCK);

        expect(await controller.deleteQuestion(ID_MOCK)).toBe(QUESTION_MOCK);
    });

    it('deleteQuestion() should throw NotFound if Id not found', async () => {
        questionService.deleteQuestion.throws(new DocumentNotFoundError(NOT_FOUND_MESSAGE));

        await expect(controller.deleteQuestion(ID_MOCK)).rejects.toThrowError(NotFoundException);
        await expect(controller.deleteQuestion(ID_MOCK)).rejects.toThrow(NOT_FOUND_MESSAGE);
    });
});
