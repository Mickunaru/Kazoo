import { GameLibraryService } from '@app/admin/services/game-library/game-library.service';
import { ROOM_CODE_GENERATION_ERROR } from '@app/constants/error-message-constants';
import { MAX_ROOM_CODE_TRIES } from '@app/constants/room-constants';
import { Game } from '@app/model/database/game';
import { Room } from '@app/model/game-models/room/room';
import { ConnectionService } from '@app/services/connection/connection.service';
import { CurrencyService } from '@app/services/currency/currency.service';
import { RandomGameService } from '@app/services/random-game/random-game.service';
import { GameMode } from '@common/enum/game-mode';
import { RoomState } from '@common/enum/room-state';
import { ActiveGame } from '@common/interfaces/active-game';
import { GameConfigDto } from '@common/interfaces/game-config-dto';
import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class RoomsManagerService {
    rooms = new Map<string, Room>();
    // eslint-disable-next-line max-params
    constructor(
        private readonly gameLibraryService: GameLibraryService,
        private readonly randomGameGeneratorService: RandomGameService,
        private readonly connectionService: ConnectionService,
        private readonly currencyService: CurrencyService,
        private readonly logger: Logger,
    ) {}

    async createRoom(gameConfig: GameConfigDto, creatorSocketId: string): Promise<string> {
        const userId = this.connectionService.userMap.getUserFromSocket(creatorSocketId);
        if (!userId) throw new BadRequestException('User Does not exist');
        if (
            gameConfig.entryPrice !== 0 &&
            gameConfig.gameMode === GameMode.ELIMINATION &&
            gameConfig.entryPrice > (await this.currencyService.getCurrency(userId.uid))
        )
            throw new BadRequestException('Organizer does not have enough money');

        const game = await this.getGame(gameConfig);

        for (let i = 0; i < MAX_ROOM_CODE_TRIES; i++) {
            const roomId = Room.generateCode();
            if (!this.rooms.has(roomId)) {
                this.rooms.set(roomId, new Room(game, userId.username, creatorSocketId, gameConfig));
                this.logger.log(`Room ${roomId} created by ${userId.username}`, 'RoomManager');
                return roomId;
            }
        }
        throw new ServiceUnavailableException(ROOM_CODE_GENERATION_ERROR);
    }

    getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    destroyRoom(roomId: string) {
        this.logger.log(`Room ${roomId} destroyed`, 'RoomManager');
        return this.rooms.delete(roomId);
    }

    getRoomIdWithClientId(clientId: string): string | undefined {
        for (const roomEntry of this.rooms.entries()) {
            if (roomEntry[1].gameMaster.isActiveGameMaster(clientId)) return roomEntry[0];
            if (roomEntry[1].players.hasNotLeft(clientId)) return roomEntry[0];
        }
        return undefined;
    }

    isGameMaster(socketId: string): boolean {
        const room = this.getRoomIdWithClientId(socketId);
        return !!room && this.getRoom(room)?.gameMaster.socketId === socketId;
    }

    getActiveGames(friends: Set<string>): ActiveGame[] {
        const activeGames: ActiveGame[] = [];
        this.rooms.forEach((room: Room, roomId) => {
            if (room.gameConfig.isFriendsOnly && !friends.has(room.gameMaster.name)) return;
            if (room.roomState === RoomState.FINISHED) return;
            if (room.gameMaster.hasLeft && (room.roomState === RoomState.OPEN || room.roomState === RoomState.LOCKED)) return;
            if (room.gameMaster.hasLeft && room.gameConfig.gameMode !== GameMode.ELIMINATION) return;
            if (room.roomState === RoomState.IN_GAME && room.players.playerNotLeftCount === 0) return;
            activeGames.push({
                roomId,
                gameConfig: room.gameConfig,
                playerCount: room.players.activePlayerCount,
                gameTitle: room.game.title,
                roomState: room.roomState,
            });
        });
        return activeGames;
    }

    private async getGame(gameConfig: GameConfigDto): Promise<Game> {
        if (gameConfig.gameId === null) {
            return await this.randomGameGeneratorService.generateGame(gameConfig.questionCount);
        } else {
            return await this.gameLibraryService.getGame(gameConfig.gameId);
        }
    }
}
