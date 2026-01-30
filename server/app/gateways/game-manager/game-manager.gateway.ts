/* eslint-disable @typescript-eslint/member-ordering */
// For lifecycle method
import { CONSOLATION_PRIZE, WIN_PRIZE } from '@app/constants/room-constants';
import { Player } from '@app/model/game-models/player/player';
import { Room } from '@app/model/game-models/room/room';
import { CurrencyService } from '@app/services/currency/currency.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { HomeLobbyService } from '@app/services/home-lobby/home-lobby.service';
import { PowerUpService } from '@app/services/power-up/power-up.service';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { GameMode } from '@common/enum/game-mode';
import { RoomState } from '@common/enum/room-state';
import { TimerType } from '@common/enum/timer-type';
import { GameManagerMap } from '@common/interfaces/event-maps';
import { ListWrapper } from '@common/interfaces/list-wrapper';
import { PlayerAnswer } from '@common/interfaces/player-answer';
import { PlayerStatus } from '@common/interfaces/player-info';
import { PlayerPrize } from '@common/interfaces/player-prize';
import { PlayerReview } from '@common/interfaces/player-review';
import { GameEvent } from '@common/socket-events/game-event';
import { HomeEvent } from '@common/socket-events/home-event';
import { RoomEvent } from '@common/socket-events/room-event';
import { TimerEvent } from '@common/socket-events/timer-event';
import { Logger } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { firstValueFrom, take, timer } from 'rxjs';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class GameManagerGateway implements OnGatewayInit, OnGatewayDisconnect {
    @WebSocketServer() server: Server<GameManagerMap>;
    // eslint-disable-next-line max-params
    constructor(
        private readonly roomsManagerService: RoomsManagerService,
        private readonly homeLobbyService: HomeLobbyService,
        private readonly gameManagerService: GameManagerService,
        private readonly powerUpService: PowerUpService,
        private readonly currencyService: CurrencyService,
        private readonly logger: Logger,
    ) {}

    @SubscribeMessage(RoomEvent.LEAVE_GAME)
    async clientLeavesGame(@ConnectedSocket() client: Socket<GameManagerMap>) {
        await this.handleDisconnect(client);
    }

    async handleDisconnect(client: Socket<GameManagerMap>) {
        const roomId = this.roomsManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return;
        const waitTime = 500;
        await firstValueFrom(timer(waitTime).pipe(take(1)));
        const room = this.roomsManagerService.getRoom(roomId);
        if (!room) return;

        if (!room.everyPlayerSubmitted && room.roomState === RoomState.IN_GAME && room.haveAllPlayerAnswered()) {
            this.logger.log('PLAYER LEFT NEXT ALL PLAYERS SUBMIT', 'GAME');
            room.everyPlayerSubmitted = true;
            this.gameManagerService.processPlayerAnswer(room);
            this.automaticallyGoToNextQuestion(roomId, room);
        }
    }

    afterInit(server: Server) {
        this.gameManagerService.server = server;
        this.powerUpService.server = server;
    }

    @SubscribeMessage(GameEvent.NEXT_QUESTION)
    async nextQuestion(@ConnectedSocket() client: Socket<GameManagerMap>) {
        const roomId = this.roomsManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return;
        const room = this.roomsManagerService.getRoom(roomId);
        if (!room) return;

        try {
            await this.goToNextQuestion(roomId, room);
        } catch (error) {
            this.logger.error(error, 'RoomManager');
        }
    }

    @SubscribeMessage(GameEvent.SUBMIT_ANSWER)
    submitQuestion(@ConnectedSocket() client: Socket<GameManagerMap>, @MessageBody() playerAnswer: PlayerAnswer) {
        const roomId = this.roomsManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return;
        const room = this.roomsManagerService.getRoom(roomId);
        if (!room) return;

        if (room.gameConfig.arePowerUpsEnabled) this.powerUpService.activatePowerUpOnSubmit(client.id, roomId, room);

        room.submitAnswer(client.id, playerAnswer);
        this.sendUpdatePlayerStats(room);
        if (room.haveAllPlayerAnswered() && !room.everyPlayerSubmitted) {
            this.logger.log('ALL PLAYERS SUBMIT', 'GAME');
            room.everyPlayerSubmitted = true;
            this.gameManagerService.processPlayerAnswer(room);
            this.automaticallyGoToNextQuestion(roomId, room);
        }
    }

    @SubscribeMessage(GameEvent.SEND_REVIEWS)
    respondedToReviews(@ConnectedSocket() client: Socket, @MessageBody() { list: reviews }: ListWrapper<PlayerReview>) {
        const roomId = this.roomsManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return;
        const room = this.roomsManagerService.getRoom(roomId);
        if (!room) return;

        this.gameManagerService.processPlayerReviews(room, reviews);
        this.sendUpdatePlayerStats(room);
    }

    @SubscribeMessage(GameEvent.GET_DRAWINGS)
    getDrawings(@ConnectedSocket() client: Socket) {
        const roomId = this.roomsManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return;
        const room = this.roomsManagerService.getRoom(roomId);
        if (!room) return;

        this.gameManagerService.sendDrawingsToPlayer(client.id, room);
    }

    @SubscribeMessage(RoomEvent.UPDATE_PLAYERS_STATS)
    updatePlayerStats(@ConnectedSocket() client: Socket) {
        const roomId = this.roomsManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return;
        const room = this.roomsManagerService.getRoom(roomId);
        if (!room) return;

        this.sendUpdatePlayerStats(room);
    }

    private async goToNextQuestion(roomId: string, room: Room) {
        const nextQuestion = room.loadNextQuestion();
        const continueToNextQuestion = nextQuestion && (!room.isRandomGame || room.players.activePlayerCount > 1);

        if (continueToNextQuestion) {
            this.logger.log(`${roomId} Going to next Question`);
            this.sendUpdatePlayerStats(room);
            await this.waitForQuestionTransition(roomId, room);
            this.server.to(roomId).emit(GameEvent.NEXT_QUESTION, nextQuestion);
            this.server.to(roomId).emit(TimerEvent.TIMER_STARTED, TimerType.AnswerDuration);
            if (room.gameConfig.arePowerUpsEnabled) {
                Logger.log('Enable power ups');
                this.powerUpService.enablePowerUps(roomId, room);
            }
        } else {
            this.logger.log(`${roomId} Going to next End Game`);
            room.setEndGameState();
            if (room.isRandomGame) await this.waitForQuestionTransition(roomId, room);
            room.timer.destroy();
            await this.giveMoneyToWinningPlayers(room);
            this.homeLobbyService.destroyRoom(roomId);
            this.server.to(roomId).emit(GameEvent.GAME_FINISHED, this.getPlayerInfoByRank(room));
        }
    }

    private async waitForQuestionTransition(roomId: string, room: Room) {
        this.server.to(roomId).emit(TimerEvent.TIMER_STARTED, TimerType.QuestionTransition);
        await room.onQuestionTransitionEnd();
    }

    private automaticallyGoToNextQuestion(roomId: string, room: Room) {
        if (room.isRandomGame) {
            this.goToNextQuestion(roomId, room);
        }
    }

    private getPlayerInfoByRank(room: Room) {
        const playerInfo = room.getPlayersStats();
        playerInfo.sort((playerA, playerB) => {
            const scoreA = playerA.score;
            const scoreB = playerB.score;
            return scoreA === scoreB ? playerA.username.localeCompare(playerB.username) : Number(scoreB) - Number(scoreA);
        });
        playerInfo.forEach((player, index) => {
            player.rank = index + 1;
        });
        return playerInfo;
    }

    private sendUpdatePlayerStats(room: Room) {
        if (room.isRandomGame) return;
        this.server.to(room.gameMaster.socketId).emit(RoomEvent.UPDATE_PLAYERS_STATS, room.getPlayersStats());
    }

    private async giveMoneyToWinningPlayers(room: Room) {
        switch (room.gameConfig.gameMode) {
            case GameMode.TEAM:
                {
                    const scoreByTeam = room.players.allPlayers.reduce((playerCountPerTeam, [, player]) => {
                        if (!player.teamName) return playerCountPerTeam;
                        playerCountPerTeam.set(player.teamName, (playerCountPerTeam.get(player.teamName) ?? 0) + player.score);
                        return playerCountPerTeam;
                    }, new Map<string, number>());

                    const countByTeam = room.players.activePlayers.reduce((playerCountPerTeam, [, player]) => {
                        if (!player.teamName) return playerCountPerTeam;
                        playerCountPerTeam.set(player.teamName, (playerCountPerTeam.get(player.teamName) ?? 0) + 1);
                        return playerCountPerTeam;
                    }, new Map<string, number>());

                    const highestScore = Math.max(...Array.from(scoreByTeam).map(([, score]) => score));
                    const winningTeams = new Set(
                        Array.from(scoreByTeam)
                            .filter(([, score]) => score === highestScore)
                            .map(([team]) => team),
                    );

                    const playerToWinConsolationPrizeCount = room.players.activePlayers.reduce(
                        (playerCount, [, player]) => (winningTeams.has(player.teamName) ? playerCount + 1 : playerCount),
                        0,
                    );

                    const promises: Promise<unknown>[] = [];
                    const consolationPrize = Math.ceil(room.moneyPool / 3 / playerToWinConsolationPrizeCount);
                    const winnerPrize = Math.ceil((room.moneyPool * 2) / 3);
                    for (const [, player] of room.players.activePlayers) {
                        const playerCountInTeam = countByTeam.get(player.teamName) ?? 1;
                        const prize = winningTeams.has(player.teamName)
                            ? { potPrize: winnerPrize / playerCountInTeam, gamePrize: WIN_PRIZE }
                            : { potPrize: consolationPrize, gamePrize: CONSOLATION_PRIZE };
                        promises.push(this.sendMoneyToPlayer(player, prize));
                    }
                    await Promise.all(promises);
                }
                break;
            case GameMode.CLASSIC:
            case GameMode.ELIMINATION: {
                const highestScore = Math.max(...room.players.activePlayers.map(([, player]) => player.score));
                const promises: Promise<unknown>[] = [];

                const playerToWinConsolationPrizeCount = room.players.playerNotLeft.reduce(
                    (playerCount, [, player]) => (!this.prizeCondition(player, room, highestScore) ? playerCount + 1 : playerCount),
                    0,
                );

                const consolationPrize = Math.ceil(room.moneyPool / 3 / playerToWinConsolationPrizeCount);
                const winnerPrize = Math.ceil((room.moneyPool * 2) / 3);
                for (const [, player] of room.players.playerNotLeft) {
                    const prize = this.prizeCondition(player, room, highestScore)
                        ? { potPrize: winnerPrize, gamePrize: WIN_PRIZE }
                        : { potPrize: consolationPrize, gamePrize: CONSOLATION_PRIZE };
                    promises.push(this.sendMoneyToPlayer(player, prize));
                }
                await Promise.all(promises);
            }
        }
    }

    private prizeCondition(player: Player, room: Room, highestScore: number) {
        switch (room.gameConfig.gameMode) {
            case GameMode.ELIMINATION:
                return player.status !== PlayerStatus.Eliminated;
            case GameMode.CLASSIC:
                return player.score === highestScore && (player.score !== 0 || room.players.activePlayerCount === 1);
        }
    }

    private async sendMoneyToPlayer(player: Player, prize: PlayerPrize) {
        const currency = await this.currencyService.addCurrencyUsername(player.name, prize.gamePrize + prize.potPrize);
        this.server.to(player.socketId).emit(HomeEvent.UPDATE_USER_MONEY, { currency });
        this.server.to(player.socketId).emit(GameEvent.MONEY_PRIZE, prize);
    }
}
