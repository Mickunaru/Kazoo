import { ConnectionService } from '@app/services/connection/connection.service';
import { CurrencyService } from '@app/services/currency/currency.service';
import { FriendService } from '@app/services/friend/friend.service';
import { UserManagerService } from '@app/services/user-manager/user-manager.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameLobbyService } from './game-lobby.service';

describe('GameLobbyService', () => {
    let service: GameLobbyService;
    let connectionServiceStub: SinonStubbedInstance<ConnectionService>;
    let friendServiceStub: SinonStubbedInstance<FriendService>;
    let currencyServiceStub: SinonStubbedInstance<CurrencyService>;
    let userManagerServiceStub: SinonStubbedInstance<UserManagerService>;
    beforeEach(async () => {
        friendServiceStub = createStubInstance(FriendService);
        currencyServiceStub = createStubInstance(CurrencyService);
        connectionServiceStub = createStubInstance(ConnectionService);
        userManagerServiceStub = createStubInstance(UserManagerService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameLobbyService,
                { provide: ConnectionService, useValue: connectionServiceStub },
                { provide: FriendService, useValue: friendServiceStub },
                { provide: CurrencyService, useValue: currencyServiceStub },
                { provide: UserManagerService, useValue: userManagerServiceStub },
                Logger,
            ],
        }).compile();

        service = module.get<GameLobbyService>(GameLobbyService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
