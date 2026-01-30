/* eslint-disable @typescript-eslint/naming-convention */
import { DocumentNotFoundError } from '@app/exceptions/document-not-found-exception';
import { Game, GameDocument } from '@app/model/database/game';
import { GameDto } from '@app/model/dto/game/game.dto';
import { HideGameDto } from '@app/model/dto/game/hide-game.dto';
import { UserManagerService } from '@app/services/user-manager/user-manager.service';
import { GameVisibility } from '@common/enum/game-visibility';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameLibraryService {
    constructor(
        @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
        private readonly userManager: UserManagerService,
    ) {}

    async getAllGames(uid: string): Promise<Game[]> {
        const user = await this.userManager.getUserById(uid);
        return this.gameModel.find({ $or: [{ creator: user?.username }, { private: false }] });
    }

    async getPublicGames(uid: string): Promise<Game[]> {
        const user = await this.userManager.getUserById(uid);
        return await this.gameModel.find({ isHidden: false, $or: [{ creator: user?.username }, { private: false }] });
    }

    async getGame(id: string): Promise<Game> {
        const game = await this.gameModel.findById(id);
        if (!game) throw new DocumentNotFoundError('ID for game not found');

        return game;
    }

    async getGameVisibility(id: string): Promise<GameVisibility> {
        try {
            const game = await this.gameModel.findById(id, { isHidden: true });
            if (!game) return GameVisibility.DELETED;

            return game.isHidden ? GameVisibility.HIDDEN : GameVisibility.PUBLIC;
        } catch {
            return GameVisibility.DELETED;
        }
    }

    async createGame(gameDto: GameDto, uid: string): Promise<Game> {
        await this.addUserToGameDto(gameDto, uid);
        return this.gameModel.create(gameDto);
    }

    async updateGame(id: string, gameDto: GameDto): Promise<Game> {
        return this.gameModel.findByIdAndUpdate(id, gameDto, { upsert: true, new: true });
    }

    async deleteGame(id: string): Promise<Game> {
        const game = await this.gameModel.findByIdAndDelete(id);
        if (!game) throw new DocumentNotFoundError('ID for game not found');

        return game;
    }

    async hideGame(id: string, hideGameDto: HideGameDto): Promise<Game> {
        const game = await this.gameModel.findByIdAndUpdate(id, hideGameDto, { new: true });
        if (!game) {
            throw new DocumentNotFoundError('ID for game not found');
        }
        return game;
    }

    async updateGameQuestionImage(questionId: string, newImageUrl: string) {
        await this.gameModel.updateOne({ 'questions.uuid': questionId }, { $set: { 'questions.$.imageUrl': newImageUrl } });
    }

    private async addUserToGameDto(gameDto: GameDto, uid: string) {
        const user = await this.userManager.getUserById(uid);
        if (!user) throw Error('User Not found');

        gameDto.creator = user.username;
    }
}
