import { ChatRoomManagerService } from '@app/chat/chat-room-manager.service';
import { UserId } from '@app/interfaces/connection/user-id.interface';
import { ConnectionService } from '@app/services/connection/connection.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { ConnectionGateway } from './connection.gateway';

describe('ChatGateway', () => {
    let gateway: ConnectionGateway;
    let serverStub: SinonStubbedInstance<Server>;
    let connectionServiceStub: SinonStubbedInstance<ConnectionService>;
    let chatRoomManagerServiceStub: SinonStubbedInstance<ChatRoomManagerService>;
    let socketMock: Socket;

    beforeEach(async () => {
        serverStub = createStubInstance<Server>(Server);
        connectionServiceStub = createStubInstance(ConnectionService);
        chatRoomManagerServiceStub = createStubInstance(ChatRoomManagerService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConnectionGateway,
                { provide: ConnectionService, useValue: connectionServiceStub },
                { provide: ChatRoomManagerService, useValue: chatRoomManagerServiceStub },
            ],
        }).compile();

        socketMock = { id: 'socket-123' } as unknown as Socket;

        gateway = module.get(ConnectionGateway);
        gateway['server'] = serverStub;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should call signIn and connectUser on userLogin', () => {
        const user: UserId = { uid: '456', username: 'user-456' };

        const signInSpy = jest.spyOn(connectionServiceStub, 'signIn');
        const connectUserSpy = jest.spyOn(chatRoomManagerServiceStub, 'connectUser');

        gateway.userLogin(socketMock as unknown as Socket, user);

        expect(signInSpy).toHaveBeenCalledWith('socket-123', user);
        expect(connectUserSpy).toHaveBeenCalledWith(socketMock);
    });

    it('should call signout on handleDisconnect', async () => {
        const signoutSpy = jest.spyOn(connectionServiceStub, 'signout');

        await gateway.handleDisconnect(socketMock as unknown as Socket);

        expect(signoutSpy).toHaveBeenCalledWith('socket-123');
    });
});
