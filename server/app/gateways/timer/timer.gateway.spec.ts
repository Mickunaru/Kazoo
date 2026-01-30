import { getFakeGame } from '@app/constants/game-test-utils';
import { GAME_MASTER_ID, PLAYER_NAME_1, ROOM_ID_MOCK } from '@app/constants/test-utils';
import { MULTI_CHOICE_PANIC_LIMIT, OPEN_ENDED_PANIC_LIMIT } from '@app/constants/time-constants';
import { Room } from '@app/model/game-models/room/room';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { QuestionType } from '@common/enum/question-type';
import { GameConfigDto } from '@common/interfaces/game-config-dto';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { TimerGateway } from './timer.gateway';

describe('TimerGateway', () => {
    let gateway: TimerGateway;
    let roomManagerService: SinonStubbedInstance<RoomsManagerService>;
    let socketMock: Socket;
    let room: Room;
    let emitMock: jest.Mock;
    let serverMock: Server;
    beforeEach(async () => {
        emitMock = jest.fn();
        roomManagerService = createStubInstance<RoomsManagerService>(RoomsManagerService);
        serverMock = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TimerGateway,
                {
                    provide: RoomsManagerService,
                    useValue: roomManagerService,
                },
                {
                    provide: Logger,
                    useValue: createStubInstance(Logger),
                },
            ],
        }).compile();

        socketMock = {
            id: GAME_MASTER_ID,
            rooms: new Set(['1234']),
        } as unknown as Socket;

        serverMock = {
            rooms: new Set(['1234']),
            to: jest.fn(() => {
                return { emit: emitMock };
            }),
            emit: emitMock,
        } as unknown as Server;
        gateway = module.get<TimerGateway>(TimerGateway);
        room = new Room(getFakeGame(), PLAYER_NAME_1, GAME_MASTER_ID, {} as GameConfigDto);
        gateway['server'] = serverMock;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should stop countdown', () => {
        jest.spyOn(room.timer, 'stopCountdown').mockImplementation(jest.fn());
        roomManagerService.getRoomIdWithClientId.returns(ROOM_ID_MOCK);
        roomManagerService.getRoom.returns(room);
        gateway.stopTimer(socketMock);
        expect(room.timer.stopCountdown).toHaveBeenCalled();
    });

    it('should exit stop countdown when room id is undefined', () => {
        jest.spyOn(room.timer, 'stopCountdown');
        roomManagerService.getRoomIdWithClientId.returns(undefined);
        gateway.stopTimer(socketMock);
        expect(room.timer.stopCountdown).not.toHaveBeenCalled();
    });

    it('should resume countdown', () => {
        jest.spyOn(room.timer, 'resumeCountdown').mockImplementation(jest.fn());
        roomManagerService.getRoomIdWithClientId.returns(ROOM_ID_MOCK);
        roomManagerService.getRoom.returns(room);

        gateway.resumeTimer(socketMock);
        expect(room.timer.resumeCountdown).toHaveBeenCalled();
    });

    it('should exit resume timer when room id is undefined', () => {
        jest.spyOn(roomManagerService, 'getRoom');
        roomManagerService.getRoomIdWithClientId.returns(undefined);
        gateway.resumeTimer(socketMock);
        expect(roomManagerService.getRoom).not.toHaveBeenCalled();
    });

    it('should enter panic mode', () => {
        room.timer.time = 0;
        room.timer.isPanicked = false;
        jest.spyOn(room.timer, 'togglePanicMode').mockImplementation(jest.fn());
        jest.spyOn(gateway, 'isEligibleForPanicToggle').mockReturnValue(true);
        roomManagerService.getRoomIdWithClientId.returns(ROOM_ID_MOCK);
        roomManagerService.getRoom.returns(room);

        gateway.panicTimer(socketMock);
        expect(room.timer.togglePanicMode).toHaveBeenCalled();
    });

    it('should not enter panic mode if not eligible', () => {
        room.timer.time = 0;
        room.timer.isPanicked = false;
        jest.spyOn(room.timer, 'togglePanicMode').mockImplementation(jest.fn());
        jest.spyOn(gateway, 'isEligibleForPanicToggle').mockReturnValue(false);
        roomManagerService.getRoomIdWithClientId.returns(ROOM_ID_MOCK);
        roomManagerService.getRoom.returns(room);
        gateway.panicTimer(socketMock);
        expect(room.timer.togglePanicMode).not.toHaveBeenCalled();
    });

    it('should exit panic timer when room id is undefined', () => {
        jest.spyOn(roomManagerService, 'getRoom');
        roomManagerService.getRoomIdWithClientId.returns(undefined);
        gateway.panicTimer(socketMock);
        expect(roomManagerService.getRoom).not.toHaveBeenCalled();
    });

    it('should be eligible for panic toggle if question type is multi-choice and if time is above threshold', () => {
        room.timer.time = MULTI_CHOICE_PANIC_LIMIT + 1;
        room.timer.isPanicked = false;
        room.currentQuestion.type = QuestionType.MultiChoice;
        expect(gateway.isEligibleForPanicToggle(room)).toBe(true);
    });

    it('should be eligible for panic toggle if question type is open-ended and if time is above threshold', () => {
        room.timer.time = OPEN_ENDED_PANIC_LIMIT + 1;
        room.timer.isPanicked = false;
        room.currentQuestion.type = QuestionType.OpenEnded;
        expect(gateway.isEligibleForPanicToggle(room)).toBe(true);
    });

    it('should not be eligible for panic toggle if already panicked', () => {
        room.timer.time = OPEN_ENDED_PANIC_LIMIT + 1;
        room.timer.isPanicked = true;
        room.currentQuestion.type = QuestionType.OpenEnded;
        expect(gateway.isEligibleForPanicToggle(room)).toBe(false);
    });

    it('should not be eligible for panic toggle if question type is multi-choice and if time is below threshold', () => {
        room.timer.time = MULTI_CHOICE_PANIC_LIMIT - 1;
        room.timer.isPanicked = false;
        room.currentQuestion.type = QuestionType.MultiChoice;
        expect(gateway.isEligibleForPanicToggle(room)).toBe(false);
    });

    it('should not be eligible for panic toggle if question type is open-ended and if time is below threshold', () => {
        room.timer.time = OPEN_ENDED_PANIC_LIMIT - 1;
        room.timer.isPanicked = false;
        room.currentQuestion.type = QuestionType.OpenEnded;
        expect(gateway.isEligibleForPanicToggle(room)).toBe(false);
    });
});
