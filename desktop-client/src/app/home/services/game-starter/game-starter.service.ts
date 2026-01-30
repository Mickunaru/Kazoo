import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameLibraryService } from '@app/admin/services/game-library/game-library.service';
import { GameStarterErrorMessage } from '@app/constants/error-message';
import { GameStartError, GameStartErrorTypes } from '@app/home/errors/game-start-error';
import { RandomGameService } from '@app/home/services/random-game/random-game.service';
import { RoomService } from '@app/home/services/room/room.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { GameVisibility } from '@common/enum/game-visibility';
import { GameConfigDto } from '@common/interfaces/game-config-dto';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameStarterService {
    // Justification :
    // WebsocketService is needed to communicate the start of the game to all players.
    // RoomService is needed to create the room.
    // GameLibraryService is needed to get the game for testing and to verify a game's availability.
    // eslint-disable-next-line max-params
    constructor(
        private readonly socketService: WebsocketService,
        private readonly roomService: RoomService,
        private readonly gameLibraryService: GameLibraryService,
        private readonly randomGameService: RandomGameService,
    ) {}

    async startGame(gameConfig: GameConfigDto): Promise<void> {
        if (gameConfig.gameId === null) {
            await this.verifyIfHasEnoughQuestions(gameConfig.questionCount);
        } else {
            await this.verifyIfGameAvailable(gameConfig.gameId);
        }

        try {
            await this.roomService.createRoomAndJoin(gameConfig, this.socketService.id);
        } catch (err) {
            if (
                err instanceof HttpErrorResponse &&
                err.status === HttpStatusCode.BadRequest &&
                err.error.message === 'Organizer does not have enough money'
            ) {
                throw new GameStartError(GameStarterErrorMessage.NOT_ENOUGH_MONEY, GameStartErrorTypes.NOT_ENOUGH_MONEY);
            }
            throw new GameStartError(GameStarterErrorMessage.IMPOSSIBLE, GameStartErrorTypes.IMPOSSIBLE);
        }
    }

    private async verifyIfGameAvailable(gameId: string): Promise<void> {
        const { visibility } = await this.gameLibraryService.getGameVisibility(gameId);
        switch (visibility) {
            case GameVisibility.HIDDEN:
                throw new GameStartError(GameStarterErrorMessage.HIDDEN, GameStartErrorTypes.HIDDEN);
            case GameVisibility.DELETED:
                throw new GameStartError(GameStarterErrorMessage.DELETED, GameStartErrorTypes.DELETED);
        }
    }

    private async verifyIfHasEnoughQuestions(questionCount: number) {
        const hasEnoughQuestions = await firstValueFrom(this.randomGameService.hasEnoughQuestionForRandomGame(questionCount));
        if (!hasEnoughQuestions) throw new GameStartError(GameStarterErrorMessage.NOT_ENOUGH_QUESTIONS, GameStartErrorTypes.NOT_ENOUGH_QUESTIONS);
    }
}
