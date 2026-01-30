import { getRandomPointsNumber } from '@app/constants/game-test-utils';
import { BONUS_MULTIPLIER } from '@common/constants/game-constants';
import { Player } from './player';

describe('Player', () => {
    let player: Player;
    beforeEach(() => {
        player = new Player('id', 'name');
    });

    it('constructor should initialize param properties', () => {
        expect(player.name).toEqual('name');
        expect(player.socketId).toEqual('id');
    });

    it('receivePoints should stack Points', () => {
        const points = getRandomPointsNumber();
        const points2 = getRandomPointsNumber();

        player.receivePoints(points);
        player.receivePoints(points2);

        expect(player.pointsGained).toBe(points2);
        expect(player.score).toBe(points + points2);
    });

    it('receiveBonusPoints should add bonus points to player', () => {
        player.pointsGained = getRandomPointsNumber();
        player.score = player.pointsGained;

        player.receiveBonusPoints();

        expect(player.bonusPointsGained).toBe(player.pointsGained * BONUS_MULTIPLIER);
        expect(player.score).toBe(player.pointsGained * (1 + BONUS_MULTIPLIER));
        expect(player.bonusCount).toBe(1);
    });

    it('clearPoints should clear player points', () => {
        player.pointsGained = getRandomPointsNumber();
        player.bonusPointsGained = getRandomPointsNumber();
        player.clearPoints();
        expect(player.pointsGained).toBe(0);
        expect(player.bonusPointsGained).toBe(0);
    });
});
