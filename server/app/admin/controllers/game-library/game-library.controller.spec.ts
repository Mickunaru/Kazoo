import { GameLibraryService } from '@app/admin/services/game-library/game-library.service';
import { FAKE_GAMES, GAME_MOCK, ID_MOCK, NOT_FOUND_MESSAGE, UID_MOCK } from '@app/constants/test-utils';
import { DocumentNotFoundError } from '@app/exceptions/document-not-found-exception';
import { FireBaseAuthGuard } from '@app/guards/firebase-auth-guard';
import { Game } from '@app/model/database/game';
import { User } from '@app/model/database/user';
import { GameDto } from '@app/model/dto/game/game.dto';
import { HideGameDto } from '@app/model/dto/game/hide-game.dto';
import { ConnectionService } from '@app/services/connection/connection.service';
import { S3Service } from '@app/services/s3-upload/s3.service';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameLibraryController } from './game-library.controller';

describe('GameLibraryController', () => {
    let controller: GameLibraryController;
    let gameLibraryService: SinonStubbedInstance<GameLibraryService>;
    let s3Service: SinonStubbedInstance<S3Service>;
    const mockConnectionService = {};
    const gameDtoInstance = plainToInstance(GameDto, GAME_MOCK);
    const hideGameDtoInstance = plainToInstance(HideGameDto, GAME_MOCK);

    beforeEach(async () => {
        gameLibraryService = createStubInstance(GameLibraryService);
        s3Service = createStubInstance(S3Service);

        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameLibraryController],
            providers: [
                {
                    provide: GameLibraryService,
                    useValue: gameLibraryService,
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

        controller = module.get<GameLibraryController>(GameLibraryController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getAllGames() should return all games', async () => {
        gameLibraryService.getAllGames.resolves(FAKE_GAMES);

        const games = await controller.getAllGames(UID_MOCK);
        expect(games).toBe(FAKE_GAMES);
    });

    it('getPublicGames() should return list of games', async () => {
        gameLibraryService.getPublicGames.resolves(FAKE_GAMES);

        const games = await controller.getPublicGames(UID_MOCK);
        expect(games).toBe(FAKE_GAMES);
    });

    it('createGame() should return created Game', async () => {
        gameLibraryService.createGame.resolves(GAME_MOCK);

        const newGame = await controller.createGame(gameDtoInstance, 'name');
        expect(newGame.title).toEqual(GAME_MOCK.title);
    });

    it('updateGame() should return update Game', async () => {
        gameLibraryService.updateGame.resolves(GAME_MOCK);

        const newGame = await controller.updateGame(ID_MOCK, gameDtoInstance);
        expect(newGame.title).toEqual(GAME_MOCK.title);
    });

    it('updateGame() should return new game Id not found', async () => {
        const game = plainToInstance(Game, GAME_MOCK);
        gameLibraryService.updateGame.resolves(game);

        const newGame = await controller.updateGame(ID_MOCK, gameDtoInstance);
        expect(newGame.title).toEqual(gameDtoInstance.title);
    });

    it('deleteGame() should return deleted Game', async () => {
        gameLibraryService.deleteGame.resolves(GAME_MOCK);

        expect(await controller.deleteGame(ID_MOCK)).toBe(GAME_MOCK);
    });

    it('deleteGame() should throw NotFound if Id not found', async () => {
        gameLibraryService.deleteGame.throws(new DocumentNotFoundError(NOT_FOUND_MESSAGE));
        await expect(controller.deleteGame(ID_MOCK)).rejects.toThrowError(NotFoundException);
        await expect(controller.deleteGame(ID_MOCK)).rejects.toThrow(NOT_FOUND_MESSAGE);
    });

    it('hideGame() should return updated isHidden Game', async () => {
        gameLibraryService.hideGame.resolves(GAME_MOCK);

        const modifiedGame = await controller.hideGame(ID_MOCK, hideGameDtoInstance);
        expect(modifiedGame.isHidden).toEqual(GAME_MOCK.isHidden);
    });

    it('hideGame() should throw NotFound Id not found', async () => {
        gameLibraryService.hideGame.throws(new DocumentNotFoundError(NOT_FOUND_MESSAGE));

        await expect(controller.hideGame(ID_MOCK, hideGameDtoInstance)).rejects.toThrowError(NotFoundException);
        await expect(controller.hideGame(ID_MOCK, hideGameDtoInstance)).rejects.toThrow(NOT_FOUND_MESSAGE);
    });
});
