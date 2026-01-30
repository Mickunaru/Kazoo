import { GAME_MASTER_ID } from '@app/constants/test-utils';
import { DocumentNotFoundError } from '@app/exceptions/document-not-found-exception';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { GameConfigDto } from '@common/interfaces/game-config-dto';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { WaitingRoomController } from './waiting-room.controller';

describe('WaitingRoomController', () => {
    let controller: WaitingRoomController;
    let roomsManagerServiceStub: SinonStubbedInstance<RoomsManagerService>;
    beforeEach(async () => {
        roomsManagerServiceStub = createStubInstance(RoomsManagerService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WaitingRoomController],
            providers: [{ provide: RoomsManagerService, useValue: roomsManagerServiceStub }],
        }).compile();

        controller = module.get<WaitingRoomController>(WaitingRoomController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create a new room', () => {
        roomsManagerServiceStub.createRoom.resolves('roomId');
        expect(controller.createRoom({} as GameConfigDto, GAME_MASTER_ID)).resolves.toEqual({ roomId: 'roomId' });
    });

    it('should throw a not found exception when the specified game does not exist', async () => {
        roomsManagerServiceStub.createRoom.rejects(new DocumentNotFoundError('error'));
        expect(controller.createRoom({} as GameConfigDto, GAME_MASTER_ID)).rejects.toThrow(NotFoundException);
    });

    it('should propagate errors other than not found when creating a room', async () => {
        class SpecificError extends Error {}
        roomsManagerServiceStub.createRoom.rejects(new SpecificError());
        expect(controller.createRoom({} as GameConfigDto, GAME_MASTER_ID)).rejects.toThrow(SpecificError);
    });
});
