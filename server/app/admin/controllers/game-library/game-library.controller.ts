import { GameLibraryService } from '@app/admin/services/game-library/game-library.service';
import { FireBaseAuthGuard, principal } from '@app/guards/firebase-auth-guard';
import { Game } from '@app/model/database/game';
import { GameDto } from '@app/model/dto/game/game.dto';
import { HideGameDto } from '@app/model/dto/game/hide-game.dto';
import { S3Service } from '@app/services/s3-upload/s3.service';
import { mongoIdParam } from '@app/validation-pipes/validate-mongo-id-pipe';
import { GAME_LIBRARY_ENDPOINT, GAME_VISIBILITY_ENDPOINT, IMAGES_ENDPOINT, PUBLIC_GAMES_ENDPOINT } from '@common/constants/endpoint-constants';
import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Game-Library')
@Controller(GAME_LIBRARY_ENDPOINT)
@UseGuards(FireBaseAuthGuard)
export class GameLibraryController {
    constructor(
        private readonly gameLibraryService: GameLibraryService,
        private readonly s3Service: S3Service,
    ) {}

    @ApiOkResponse({ description: 'Gets all games', type: Game, isArray: true })
    @Get()
    async getAllGames(@principal() uid: string) {
        return await this.gameLibraryService.getAllGames(uid);
    }

    @ApiOkResponse({ description: 'Gets all public games', type: Game, isArray: true })
    @Get(PUBLIC_GAMES_ENDPOINT)
    async getPublicGames(@principal() uid: string) {
        return await this.gameLibraryService.getPublicGames(uid);
    }

    @ApiOkResponse({ description: 'Gets game visibility' })
    @Get(`${GAME_VISIBILITY_ENDPOINT}/:id`)
    async getGameVisibility(@mongoIdParam() id: string) {
        const visibility = await this.gameLibraryService.getGameVisibility(id);
        return { visibility };
    }

    @Put(`${IMAGES_ENDPOINT}/:questionId`)
    @UseInterceptors(FileInterceptor('file'))
    async uploadQuestionImage(@UploadedFile() file: Express.Multer.File, @Param('questionId') questionId: string) {
        const { url } = await this.s3Service.putImage(questionId, file, 'games');
        await this.gameLibraryService.updateGameQuestionImage(questionId, url);
    }

    @Delete(`${IMAGES_ENDPOINT}/:questionId`)
    async deleteQuestionImage(@Param('questionId') questionId: string) {
        await this.s3Service.deleteQuestionImage(`${questionId}.png`, 'games');
        await this.gameLibraryService.updateGameQuestionImage(questionId, '');
    }

    @ApiCreatedResponse({ description: 'Creates new game', type: Game })
    @ApiBadRequestResponse({ description: 'Return BAD_REQUEST http status when id is invalid MongoDB ID' })
    @Post()
    async createGame(@Body() gameDto: GameDto, @principal() uid: string) {
        return await this.gameLibraryService.createGame(gameDto, uid);
    }

    @ApiOkResponse({ description: 'Updates new question or creates new one if does not exist', type: Game })
    @ApiBadRequestResponse({ description: 'Return BAD_REQUEST http status when id is invalid MongoDB ID' })
    @Put(':id')
    async updateGame(@mongoIdParam() id: string, @Body() gameDto: GameDto) {
        return await this.gameLibraryService.updateGame(id, gameDto);
    }

    @ApiOkResponse({ description: 'Deletes a game', type: Game })
    @ApiNotFoundResponse({ description: 'Return NOT_FOUND http status when request fails' })
    @ApiBadRequestResponse({ description: 'Return BAD_REQUEST http status when id is invalid MongoDB ID' })
    @Delete(':id')
    async deleteGame(@mongoIdParam() id: string) {
        try {
            return await this.gameLibraryService.deleteGame(id);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    @ApiOkResponse({ description: 'Hides a game', type: Game })
    @ApiNotFoundResponse({ description: 'Return NOT_FOUND http status when request fails' })
    @ApiBadRequestResponse({ description: 'Return BAD_REQUEST http status when id is invalid MongoDB ID' })
    @Patch(':id')
    async hideGame(@mongoIdParam() id: string, @Body() hideGameDto: HideGameDto) {
        try {
            return await this.gameLibraryService.hideGame(id, hideGameDto);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }
}
