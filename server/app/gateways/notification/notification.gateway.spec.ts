import { SocketMap } from '@app/class/socket-map/socket-map';
import { SOCKET_ID_1 } from '@app/constants/test-utils';
import { ConnectionService } from '@app/services/connection/connection.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { UserManagerService } from '@app/services/user-manager/user-manager.service';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Server } from 'socket.io';
import { NotificationGateway } from './notification.gateway';

describe('NotificationGateway', () => {
    let gateway: NotificationGateway;
    let notifiactionServiceStub: SinonStubbedInstance<NotificationService>;
    let connectionServiceStub: SinonStubbedInstance<ConnectionService>;
    let userManagerServiceStub: SinonStubbedInstance<UserManagerService>;
    let emitMock: jest.Mock;
    let serverStub: Server;
    const username2 = 'username2';

    beforeEach(async () => {
        notifiactionServiceStub = createStubInstance<NotificationService>(NotificationService);
        connectionServiceStub = createStubInstance<ConnectionService>(ConnectionService);
        userManagerServiceStub = createStubInstance<UserManagerService>(UserManagerService);
        serverStub = createStubInstance<Server>(Server);

        emitMock = jest.fn();

        serverStub = {
            to: jest.fn(() => {
                return { emit: emitMock };
            }),
            emit: emitMock,
        } as unknown as Server;

        const socketMapMock: Partial<SocketMap> = {
            getUserFromSocket: jest.fn(() => {
                return { username: username2, uid: '', imageUrl: '' };
            }),
            getSocketFromName: jest.fn(() => {
                return SOCKET_ID_1;
            }),
        };

        connectionServiceStub.userMap = socketMapMock as SocketMap;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationGateway,
                { provide: NotificationService, useValue: notifiactionServiceStub },
                { provide: ConnectionService, useValue: connectionServiceStub },
                { provide: UserManagerService, useValue: userManagerServiceStub },
            ],
        }).compile();

        gateway = module.get<NotificationGateway>(NotificationGateway);
        gateway['server'] = serverStub;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
