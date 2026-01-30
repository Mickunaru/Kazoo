import { getFakeGame } from '@app/constants/game-test-utils';
import {
    ANSWERS_MOCK,
    ID_MOCK,
    OPEN_ENDED_ANSWER,
    PLAYER_CREDENTIAL_MOCK,
    PLAYER_NAME_1,
    PLAYER_NAME_MOCK,
    SOCKET_ID_MOCK,
    TIME_ANSWERED,
} from '@app/constants/test-utils';
import { NEXT_QUESTION_COUNTDOWN, QUESTION_DURATION_MIN } from '@app/constants/time-constants';
import { User } from '@app/model/database/user';
import { GameMaster } from '@app/model/game-models/game-master/game-master';
import { Timer } from '@app/model/game-models/timer/timer';
import { OPEN_ENDED_DURATION } from '@common/constants/waiting-constants';
import { QuestionType } from '@common/enum/question-type';
import { GameConfigDto } from '@common/interfaces/game-config-dto';
import { PlayerStatus } from '@common/interfaces/player-info';
import { Subject } from 'rxjs';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Room } from './room';

describe('Room', () => {
    let room: Room;
    let timerStub: SinonStubbedInstance<Timer>;

    beforeEach(() => {
        room = new Room(getFakeGame(), PLAYER_NAME_1, ID_MOCK, {} as GameConfigDto);
        timerStub = createStubInstance(Timer);
        timerStub.end = new Subject();
        jest.spyOn(timerStub, 'startCountdown');
        Object.defineProperty(room, 'timer', { value: timerStub });
    });

    it('constructor should initialize properties', () => {
        expect(room.game).not.toBeNull();
        expect(room.gameMaster).toBeInstanceOf(GameMaster);
    });

    it('get currentQuestion should get current question', () => {
        expect(room.currentQuestion).toEqual(room.game.questions[0]);
        expect(room['currentQuestionIndex']).toEqual(0);
    });

    it('get isLock should return lock value', () => {
        room['locked'] = true;
        expect(room.isLocked).toEqual(true);
    });

    it('newRoomCode should generate room code of 4 digits', () => {
        const MIN_ID = '1000';
        jest.spyOn(global.Math, 'random').mockReturnValue(0);
        expect(Room.generateCode()).toEqual(MIN_ID);
    });

    it('newRoomCode should generate room code of 4 digits', () => {
        const MAX_ID = '9999';
        const MAX_RANDOM_VALUE = 0.9999999999999;
        jest.spyOn(global.Math, 'random').mockReturnValue(MAX_RANDOM_VALUE);
        expect(Room.generateCode()).toEqual(MAX_ID);
    });

    it('isPlayerNameValid should be valid if not in banned list and not in player list', () => {
        room.players.addPlayer('socketId', { username: 'player2', avatar: '' } as User);
        expect(room.isPlayerNameValid(PLAYER_NAME_MOCK)).toBe(true);
    });

    it('isPlayerNameValid should be invalid if in banned list', () => {
        room['bannedUserNames'].add(PLAYER_NAME_MOCK.toLowerCase());
        room.players.addPlayer('', PLAYER_CREDENTIAL_MOCK);
        expect(room.isPlayerNameValid(PLAYER_NAME_MOCK)).toBe(false);
    });

    it('isPlayerNameValid should be valid if not in player list', () => {
        room.players.addPlayer('socketId', PLAYER_CREDENTIAL_MOCK);
        expect(room.isPlayerNameValid(PLAYER_NAME_MOCK + '1')).toBe(true);
    });

    it('isPlayerNameValid should be invalid if in player list', () => {
        room.players.addPlayer('socketId', PLAYER_CREDENTIAL_MOCK);
        expect(room.isPlayerNameValid(PLAYER_NAME_MOCK)).toBe(false);
    });

    it('banPlayer should remove player and add to ban list', () => {
        room.players.addPlayer(SOCKET_ID_MOCK, PLAYER_CREDENTIAL_MOCK);
        room.banPlayer(PLAYER_NAME_MOCK);
        expect(room['bannedUserNames'].has(PLAYER_NAME_MOCK)).toEqual(true);
    });

    it('switchLockState should toggle room lock', () => {
        room.switchLockState();
        expect(room['locked']).toEqual(true);
        room.switchLockState();
        expect(room['locked']).toEqual(false);
    });

    it('validateAnswer should give points to player', () => {
        const answers = room.currentQuestion.choices.map((choice) => choice.isCorrect);
        room.players.addPlayer(SOCKET_ID_MOCK, PLAYER_CREDENTIAL_MOCK);
        const player = room.players.getPlayerFromName(PLAYER_NAME_MOCK);

        jest.spyOn(player as never, 'receivePoints').mockImplementation(jest.fn() as never);
        jest.spyOn(room, 'updatePlayerToReceiveBonus').mockImplementation(jest.fn());
        room.validatePlayerAnswer(SOCKET_ID_MOCK, answers);
        expect(player?.receivePoints).toBeCalledWith(room.currentQuestion.points);
        expect(room.updatePlayerToReceiveBonus).toHaveBeenCalled();
    });

    it('validateAnswer should not add points to player', () => {
        room.players.addPlayer(SOCKET_ID_MOCK, PLAYER_CREDENTIAL_MOCK);
        const player = room.players.getPlayerFromName(PLAYER_NAME_MOCK);

        jest.spyOn(player as never, 'receivePoints');

        room.validatePlayerAnswer(SOCKET_ID_MOCK, ANSWERS_MOCK);
        expect(player?.receivePoints).not.toBeCalled();
    });

    it('savePlayerAnswer should save player answer', () => {
        room.players.addPlayer(SOCKET_ID_MOCK, PLAYER_CREDENTIAL_MOCK);
        const player = room.players.getPlayerFromName(PLAYER_NAME_MOCK);
        room.savePlayerAnswer(player?.socketId as string, OPEN_ENDED_ANSWER);
        expect(player?.answerValue as string).toBe(OPEN_ENDED_ANSWER);
    });

    it('updatePlayerToReceiveBonus should set player as fastest', () => {
        room['fastestResponses'] = 0;
        room.updatePlayerToReceiveBonus(PLAYER_NAME_MOCK, TIME_ANSWERED);
        expect(room['fastestResponses']).toBe(TIME_ANSWERED);
        expect(room['playerToReceiveBonus']).toBe(PLAYER_NAME_MOCK);
    });

    it('updatePlayerToReceiveBonus should remove bonus if 2 players respond at the same time', () => {
        room['fastestResponses'] = TIME_ANSWERED;
        room['playerToReceiveBonus'] = PLAYER_NAME_MOCK;
        room.updatePlayerToReceiveBonus(PLAYER_NAME_MOCK, TIME_ANSWERED);
        expect(room['playerToReceiveBonus']).toBe('');
    });

    it('giveBonusToFastestPlayer should give bonus to playerToReceiveBonus', () => {
        room.players.addPlayer(SOCKET_ID_MOCK, PLAYER_CREDENTIAL_MOCK);
        const player = room.players.getPlayerFromName(PLAYER_NAME_MOCK);
        room['playerToReceiveBonus'] = PLAYER_NAME_MOCK;

        jest.spyOn(player as never, 'receiveBonusPoints');

        room.giveBonusToFastestPlayer();
        expect(player?.receiveBonusPoints).toBeCalled();
    });

    it('loadNextQuestion should set properties up for next questions', () => {
        room.loadNextQuestion();
        expect(room['currentQuestionIndex']).toEqual(1);
    });

    it('onQuestionTransitionEnd should wait before switching questions', async () => {
        jest.spyOn(room, 'startNextQuestionTimer').mockImplementation();
        const promise = room.onQuestionTransitionEnd();
        expect(room.timer.startCountdown).toBeCalledWith(NEXT_QUESTION_COUNTDOWN);
        room.timer.end.next();
        await promise;
    });

    it('onQuestionTransitionEnd should start the next questions timer after the first timer end', async () => {
        jest.spyOn(room, 'startNextQuestionTimer').mockImplementation();
        const promise = room.onQuestionTransitionEnd();
        expect(room.startNextQuestionTimer).not.toBeCalled();
        room.timer.end.next();
        await promise;
        expect(room.startNextQuestionTimer).toBeCalled();
    });

    it('should start a timer equal to the game duration if the question is multi choice', () => {
        room.currentQuestion.type = QuestionType.MultiChoice;
        room.game.duration = QUESTION_DURATION_MIN;
        room.startNextQuestionTimer();
        expect(room.timer.startCountdown).toBeCalledWith(QUESTION_DURATION_MIN);
    });

    it('should start a timer for open-ended question if the question is open-ended', () => {
        room.currentQuestion.type = QuestionType.OpenEnded;
        room.game.duration = QUESTION_DURATION_MIN;
        room.startNextQuestionTimer();
        expect(room.timer.startCountdown).toBeCalledWith(OPEN_ENDED_DURATION);
    });

    it('should not start a timer for index out of range', () => {
        Object.defineProperty(room, 'currentQuestion', { value: undefined });
        room.game.duration = QUESTION_DURATION_MIN;
        room.startNextQuestionTimer();
        expect(room.timer.startCountdown).not.toBeCalled();
    });

    it('should return the locked state', () => {
        room['locked'] = true;
        expect(room.isLocked).toBeTruthy();
        room['locked'] = false;
        expect(room.isLocked).toBeFalsy();
    });

    it('should be true if all player have answered', () => {
        room.players.addPlayer(SOCKET_ID_MOCK, PLAYER_CREDENTIAL_MOCK);
        room.players.forEach((player) => {
            player.status = PlayerStatus.Submitted;
        });
        expect(room.haveAllPlayerAnswered()).toEqual(true);
    });
});
