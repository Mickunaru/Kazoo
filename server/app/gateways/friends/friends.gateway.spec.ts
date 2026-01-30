import { ConnectionService } from '@app/services/connection/connection.service';
import { FriendService } from '@app/services/friend/friend.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { FriendsGateway } from './friends.gateway';

describe('FriendsGateway', () => {
    let gateway: FriendsGateway;
    let notifiactionServiceStub: SinonStubbedInstance<NotificationService>;
    let connectionServiceStub: SinonStubbedInstance<ConnectionService>;
    let friendServiceStub: SinonStubbedInstance<FriendService>;

    beforeEach(async () => {
        notifiactionServiceStub = createStubInstance<NotificationService>(NotificationService);
        connectionServiceStub = createStubInstance<ConnectionService>(ConnectionService);
        friendServiceStub = createStubInstance<FriendService>(FriendService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FriendsGateway,
                { provide: NotificationService, useValue: notifiactionServiceStub },
                { provide: ConnectionService, useValue: connectionServiceStub },
                { provide: FriendService, useValue: friendServiceStub },
            ],
        }).compile();

        gateway = module.get<FriendsGateway>(FriendsGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
