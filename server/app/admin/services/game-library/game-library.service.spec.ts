import { getFakeGameDto, getFakeHideGameDto } from '@app/constants/game-test-utils';
import { ID_MOCK, UID_MOCK } from '@app/constants/test-utils';
import { DocumentNotFoundError } from '@app/exceptions/document-not-found-exception';
import { Game, GameDocument, gameSchema } from '@app/model/database/game';
import { UserDocument } from '@app/model/database/user';
import { GameDto } from '@app/model/dto/game/game.dto';
import { UserManagerService } from '@app/services/user-manager/user-manager.service';
import { QuestionType } from '@common/enum/question-type';
import { Logger } from '@nestjs/common';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameLibraryService } from './game-library.service';

describe('GameLibraryService', () => {
    let service: GameLibraryService;
    let gameModel: Model<GameDocument>;
    let userManagerStub: SinonStubbedInstance<UserManagerService>;

    beforeEach(async () => {
        userManagerStub = createStubInstance(UserManagerService);

        gameModel = {} as unknown as Model<GameDocument>;
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameLibraryService,
                {
                    provide: getModelToken(Game.name),
                    useValue: gameModel,
                },
                { provide: UserManagerService, useValue: userManagerStub },
            ],
        }).compile();

        service = module.get<GameLibraryService>(GameLibraryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

describe('GameLibraryServiceEndToEnd', () => {
    let service: GameLibraryService;
    let gameModel: Model<GameDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;
    let gameDto: GameDto;
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
                MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
            ],
            providers: [GameLibraryService, Logger, { provide: UserManagerService, useValue: userManagerStub }],
        }).compile();

        service = module.get<GameLibraryService>(GameLibraryService);
        gameModel = module.get<Model<GameDocument>>(getModelToken(Game.name));
        connection = await module.get(getConnectionToken());
        await gameModel.deleteMany({});
        gameDto = plainToInstance(GameDto, getFakeGameDto());
    });

    const gameValidator = (updatedGame: Game, updateGameDto: GameDto, isHidden = true) => {
        expect(updatedGame.title).toEqual(updateGameDto.title);
        expect(updatedGame.description).toEqual(updateGameDto.description);
        expect(updatedGame.duration).toEqual(updateGameDto.duration);
        expect(updatedGame.isHidden).toEqual(isHidden);
        expect(updatedGame.lastModification).toBeInstanceOf(Date);
        for (let i = 0; i < updatedGame.questions.length; i++) {
            expect(updatedGame.questions[i].type).toEqual(QuestionType.MultiChoice);
            expect(updatedGame.questions[i].text).toEqual(updateGameDto.questions[i].text);
            expect(updatedGame.questions[i].points).toEqual(updateGameDto.questions[i].points);
            for (let j = 0; j < updatedGame.questions[i].choices.length; j++) {
                expect(updatedGame.questions[i].choices[j].text).toEqual(updateGameDto.questions[i].choices[j].text);
                expect(updatedGame.questions[i].choices[j].isCorrect).toEqual(updateGameDto.questions[i].choices[j].isCorrect);
            }
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
        expect(gameModel).toBeDefined();
    });

    it('getAllGames() return all games in database', async () => {
        userManagerStub.getUserById.resolves({ username: 'name' } as UserDocument);

        expect((await service.getAllGames(UID_MOCK)).length).toEqual(0);

        await gameModel.create(gameDto);
        expect((await service.getAllGames(UID_MOCK)).length).toEqual(1);
    });

    it('getPublicGames() return all public games in database', async () => {
        userManagerStub.getUserById.resolves({ username: 'name' } as UserDocument);
        expect((await service.getAllGames(UID_MOCK)).length).toEqual(0);

        const createdGame = await gameModel.create(gameDto);
        const createdGame2 = await gameModel.create(gameDto);
        await gameModel.create(gameDto);
        await gameModel.findByIdAndUpdate(createdGame.id, getFakeHideGameDto());
        await gameModel.findByIdAndUpdate(createdGame2.id, getFakeHideGameDto());
        expect((await service.getPublicGames(UID_MOCK)).length).toEqual(2);
    });

    it('getPublicGames() should not return private games in database', async () => {
        userManagerStub.getUserById.resolves({ username: 'name' } as UserDocument);
        expect((await service.getAllGames(UID_MOCK)).length).toEqual(0);

        await gameModel.create(gameDto);
        await gameModel.create(gameDto);
        await gameModel.create(gameDto);
        expect((await service.getPublicGames(UID_MOCK)).length).toEqual(0);
    });

    it('getGame() return game with the specified id', async () => {
        const createdGame = await gameModel.create(gameDto);
        expect(await service.getGame(createdGame.id)).toEqual(expect.objectContaining(gameDto));
    });

    it('getGame() should fail if game does not exist', async () => {
        await expect(service.getGame(ID_MOCK)).rejects.toThrowError(DocumentNotFoundError);
    });

    it('updateGame() should create game if game does not exist', async () => {
        const updateGameDto = gameDto;
        userManagerStub.getUserById.resolves({ username: 'name' } as UserDocument);
        const updatedGame = await service.updateGame(ID_MOCK, updateGameDto);
        gameValidator(updatedGame, updateGameDto);
    });

    it('updateGame() should fail if mongo query failed', async () => {
        jest.spyOn(gameModel, 'findByIdAndUpdate').mockRejectedValue('');
        const updateGameDto = { title: 'title' } as GameDto;
        userManagerStub.getUserById.resolves({ username: 'name' } as UserDocument);
        await expect(service.updateGame(ID_MOCK, updateGameDto)).rejects.toEqual('');
    });

    it('updateGame() should update game', async () => {
        const createdGame = await gameModel.create(gameDto);
        const updateGameDto = getFakeGameDto(3);
        userManagerStub.getUserById.resolves({ username: 'name' } as UserDocument);
        const updatedGame = await service.updateGame(createdGame.id, updateGameDto);
        gameValidator(updatedGame, updateGameDto);
    });

    it('hideGame() should fail if game does not exist', async () => {
        const hideGameDto = getFakeHideGameDto();
        await expect(service.hideGame(ID_MOCK, hideGameDto)).rejects.toThrowError(DocumentNotFoundError);
    });

    it('hideGame() should fail if mongo query failed', async () => {
        jest.spyOn(gameModel, 'findByIdAndUpdate').mockRejectedValue('');
        const hideGameDto = getFakeHideGameDto();
        await expect(service.hideGame(ID_MOCK, hideGameDto)).rejects.toEqual('');
    });

    it('hideGame() should update isHidden game and the rest should remain unchanged', async () => {
        const createdGame = await gameModel.create(gameDto);
        const hideGameDto = getFakeHideGameDto();
        hideGameDto.isHidden = false;
        const updatedGame = await service.hideGame(createdGame.id, hideGameDto);
        gameValidator(updatedGame, gameDto, hideGameDto.isHidden);
    });

    it('deleteGame() should delete the game', async () => {
        const createdGame = await gameModel.create(gameDto);
        await service.deleteGame(createdGame.id);
        expect(await gameModel.countDocuments()).toEqual(0);
    });

    it('deleteGame() should fail if the game does not exist', async () => {
        await expect(service.deleteGame(ID_MOCK)).rejects.toThrowError(DocumentNotFoundError);
    });

    it('deleteGame() should fail if mongo query failed', async () => {
        jest.spyOn(gameModel, 'findByIdAndDelete').mockRejectedValue('');
        await expect(service.deleteGame(ID_MOCK)).rejects.toEqual('');
    });

    it('createGame() should add the game to the DB', async () => {
        userManagerStub.getUserById.resolves({ username: 'name' } as UserDocument);
        const createdGame = await service.createGame(gameDto, UID_MOCK);
        expect(await gameModel.countDocuments()).toEqual(1);
        expect(createdGame).toEqual(expect.objectContaining(gameDto));
    });

    it('createGame() should fail if mongo query failed', async () => {
        jest.spyOn(gameModel, 'create').mockImplementation(async () => Promise.reject(''));
        userManagerStub.getUserById.resolves({ username: 'name' } as UserDocument);
        await expect(service.createGame(gameDto, UID_MOCK)).rejects.toEqual('');
    });

    it('createGame() should create game', async () => {
        userManagerStub.getUserById.resolves({ username: 'name' } as UserDocument);
        const createdGame = await gameModel.create(gameDto);
        gameValidator(createdGame, gameDto);
    });
});
