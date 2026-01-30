import { ChatRoomManagerService } from '@app/chat/chat-room-manager.service';
import { ConnectionService } from '@app/services/connection/connection.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server } from 'socket.io';
import { ChatGateway } from './chat.gateway';

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let serverStub: SinonStubbedInstance<Server>;
    let loggerStub: SinonStubbedInstance<Logger>;
    let chatRoomsManagerServiceStub: SinonStubbedInstance<ChatRoomManagerService>;
    let connectionServiceStub: SinonStubbedInstance<ConnectionService>;

    beforeEach(async () => {
        serverStub = createStubInstance<Server>(Server);
        loggerStub = createStubInstance(Logger);
        chatRoomsManagerServiceStub = createStubInstance(ChatRoomManagerService);
        connectionServiceStub = createStubInstance(ConnectionService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                { provide: Logger, useValue: loggerStub },
                { provide: ChatRoomManagerService, useValue: chatRoomsManagerServiceStub },
                { provide: ConnectionService, useValue: connectionServiceStub },
            ],
        }).compile();

        gateway = module.get(ChatGateway);
        gateway['server'] = serverStub;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
