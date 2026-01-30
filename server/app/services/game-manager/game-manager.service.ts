import { Player } from '@app/model/game-models/player/player';
import { Room } from '@app/model/game-models/room/room';
import { GameMode } from '@common/enum/game-mode';
import { QuestionType } from '@common/enum/question-type';
import { GameManagerMap } from '@common/interfaces/event-maps';
import { PlayerAnswerForReview } from '@common/interfaces/player-answer-for-review';
import { PlayerDrawingAnswer } from '@common/interfaces/player-drawing-answer';
import { PlayerStatus } from '@common/interfaces/player-info';
import { PlayerReview } from '@common/interfaces/player-review';
import { QuestionAnswer } from '@common/interfaces/question-answer';
import { GameEvent } from '@common/socket-events/game-event';
import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class GameManagerService {
    server: Server<GameManagerMap>;

    processPlayerAnswer(room: Room) {
        room.timer.stopCountdown();
        switch (room.currentQuestionType) {
            case QuestionType.MultiChoice:
            case QuestionType.Estimation:
                this.processAnswerForPlayers(room);
                break;
            case QuestionType.OpenEnded:
            case QuestionType.Drawing:
                this.sendToReview(room);
                break;
        }
    }

    processPlayerReviews(room: Room, reviews: PlayerReview[]) {
        reviews.forEach((review) => {
            const player = room.players.getPlayerFromName(review.name);
            if (!player) return;
            player.receivePoints(room.currentQuestion.points * review.percentageGiven);
            player.percentageGiven = review.percentageGiven;
        });
        this.sendAnswersToClients(room);
    }

    sendDrawingsToPlayer(socketId: string, room: Room) {
        if (room.currentQuestionType !== QuestionType.Drawing) return;
        const playersDrawings: PlayerDrawingAnswer[] = [];
        room.players.activePlayers.forEach(([name, player]) => {
            if (!player) return;
            playersDrawings.push({ name, awsKey: player.answerValue });
        });

        this.server.to(socketId).emit(GameEvent.GET_DRAWINGS, playersDrawings);
    }

    private processAnswerForPlayers(room: Room) {
        room.giveBonusToFastestPlayer();
        this.sendAnswersToClients(room);
    }

    private sendToReview(room: Room) {
        let playersAnswers: PlayerAnswerForReview[] = [];
        room.players.activePlayers.forEach(([name, player]) => {
            playersAnswers.push({ name, answer: player.answerValue, questionType: room.currentQuestionType });
        });
        if (room.gameConfig.gameMode === GameMode.TEAM) {
            // Simple Shuffle
            playersAnswers = playersAnswers
                .map((answer) => ({ answer, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ answer }) => answer);
        } else {
            playersAnswers.sort((playerA, playerB) => playerA.name.localeCompare(playerB.name));
        }
        this.server.emit(GameEvent.REVIEW_IN_PROGRESS);
        this.server.to(room.gameMaster.socketId).emit(GameEvent.SEND_REVIEWS, playersAnswers);
    }

    private sendAnswersToClients(room: Room) {
        room.players.playerNotLeft.forEach(([, player]) => {
            const answer = this.getQuestionAnswer(player, room);
            Logger.warn(`Sent to palyer ${player.name}`);
            this.server.to(player.socketId).emit(GameEvent.SEND_ANSWERS, answer);
        });
        if (room.isRandomGame) {
            this.eliminatePlayer(room);
        } else {
            Logger.warn('SENT to game master', 'game manager');
            this.server.to(room.gameMaster.socketId).emit(GameEvent.SEND_ANSWERS);
        }
    }

    private getQuestionAnswer(player: Player, room: Room): QuestionAnswer {
        const questionType = room.currentQuestionType;
        const { bonusPointsGained, pointsGained, score, percentageGiven } = player;
        switch (questionType) {
            case QuestionType.MultiChoice:
            case QuestionType.Estimation:
                return {
                    questionType,
                    answers: room.getCurrentQuestionRightAnswers(questionType),
                    pointsGained,
                    bonusPointsGained,
                    score,
                };
            case QuestionType.OpenEnded:
                return { questionType, pointsGained, score, percentageGiven };
            case QuestionType.Drawing:
                return { questionType, pointsGained, score, percentageGiven };
        }
    }

    private eliminatePlayer(room: Room) {
        let wasAnyPlayerEliminated = false;
        if (room.players.activePlayerCount <= 1) return;
        room.players.forEach((player: Player) => {
            const answers = this.getQuestionAnswer(player, room);
            if (answers.pointsGained > 0 || !player.isInGame()) return;

            this.server.to(player.socketId).emit(GameEvent.PLAYER_ELIMINATED);
            player.status = PlayerStatus.Eliminated;
            wasAnyPlayerEliminated = true;
        });

        if (!wasAnyPlayerEliminated && room.players.activePlayerCount > 1) {
            const player = room.players.getPlayerFromName(room.playerToBeEliminated);
            if (!player) return;
            this.server.to(player.socketId).emit(GameEvent.PLAYER_ELIMINATED);
            player.status = PlayerStatus.Eliminated;
        }
    }
}
