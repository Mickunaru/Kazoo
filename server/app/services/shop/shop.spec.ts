import { Logger } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { ShopItem, shopItemSchema } from '@app/model/database/shop-item';
import { User, userSchema } from '@app/model/database/user';
import { UserManagerService } from '@app/services/user-manager/user-manager.service';
import { Connection } from 'mongoose';
import { ShopService } from './shop.service';

describe('ShopService', () => {
    let service: ShopService;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoServer.getUri()),
                MongooseModule.forFeature([
                    { name: ShopItem.name, schema: shopItemSchema },
                    { name: User.name, schema: userSchema },
                ]),
            ],
            providers: [
                ShopService,
                { provide: Logger, useValue: console },
                {
                    provide: UserManagerService,
                    useValue: {
                        getUserById: jest.fn(),
                    },
                },
            ],
        }).compile();
        connection = await module.get(getConnectionToken());
        service = module.get<ShopService>(ShopService);
    });

    afterAll(async () => {
        await connection.close();
        await mongoServer.stop();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
