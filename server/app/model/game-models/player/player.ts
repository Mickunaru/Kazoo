import { Client } from '@app/model/game-models/client/client';
import { BONUS_MULTIPLIER } from '@common/constants/game-constants';
import { PlayerStatus } from '@common/interfaces/player-info';

export class Player extends Client {
    score: number = 0;
    bonusCount: number = 0;
    pointsGained: number = 0;
    bonusPointsGained: number = 0;
    answerValue: string = '';
    status: PlayerStatus = PlayerStatus.Pending;
    percentageGiven: number = 0;
    teamName: string = '';
    imageUrl: string = '';

    receivePoints(points: number) {
        this.score += points;
        this.pointsGained = points;
    }

    receiveBonusPoints() {
        this.bonusPointsGained = this.pointsGained * BONUS_MULTIPLIER;
        this.score += this.bonusPointsGained;
        this.bonusCount++;
    }

    clearPoints() {
        this.pointsGained = 0;
        this.bonusPointsGained = 0;
    }

    isInGame() {
        return this.status === PlayerStatus.Submitted || this.status === PlayerStatus.Pending;
    }
}
