import { FireBaseAuthGuard } from '@app/guards/firebase-auth-guard';
import { User, UserDocument } from '@app/model/database/user';
import { ConnectionService } from '@app/services/connection/connection.service';
import { ShopService } from '@app/services/shop/shop.service';
import { ShopItem } from '@common/interfaces/shop-item';
import { Test, TestingModule } from '@nestjs/testing';
import { ShopController } from './shop.controller';

describe('ShopController', () => {
    let controller: ShopController;

    beforeEach(async () => {
        const mockShopService = {
            getAllShopItems: jest.fn().mockResolvedValue([
                { id: '1', name: '', cost: 0 },
                { id: '2', name: '', cost: 0 },
            ] as ShopItem[]),
            buyItem: jest.fn().mockResolvedValue({ id: 'user123', username: 'testUser' } as UserDocument),
        };

        const mockConnectionService = {
            authentificateUser: jest.fn().mockResolvedValue('user123'),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ShopController],
            providers: [
                {
                    provide: ShopService,
                    useValue: mockShopService,
                },
                {
                    provide: FireBaseAuthGuard,
                    useValue: { canActivate: jest.fn().mockReturnValue(true) },
                },
                {
                    provide: ConnectionService,
                    useValue: mockConnectionService,
                },
                { provide: User, useValue: {} },
            ],
        }).compile();
        controller = module.get<ShopController>(ShopController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
