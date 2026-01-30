import { RandomGameService } from '@app/services/random-game/random-game.service';
import { GAME_AVAILABILITY_ENDPOINT, RANDOM_GAME_ENDPOINT } from '@common/constants/endpoint-constants';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('questions')
@Controller(RANDOM_GAME_ENDPOINT)
export class RandomGameController {
    constructor(private readonly randomGameService: RandomGameService) {}

    @ApiOperation({ summary: 'Checks if there is enough questions to make a random game' })
    @ApiOkResponse({ description: 'A random game is possible', type: Boolean })
    @Get(GAME_AVAILABILITY_ENDPOINT)
    async hasEnoughQuestionForRandomGame(@Query('count') questionCountNeeded: number): Promise<boolean> {
        const questionCount = await this.randomGameService.countAvailableQuestionsForRandomGame();
        return questionCount >= questionCountNeeded;
    }
}
