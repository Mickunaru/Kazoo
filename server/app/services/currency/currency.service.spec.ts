import { User, userSchema } from '@app/model/database/user';
import { ShopModule } from '@app/module/shop/shop.module';
import { UserManagerService } from '@app/services/user-manager/user-manager.service';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { CurrencyService } from './currency.service';

jest.mock('firebase-admin', () => ({
    initializeApp: jest.fn().mockReturnValue({
        firestore: jest.fn(),
        auth: jest.fn(),
    }),
    credential: {
        cert: jest.fn(),
    },
}));

describe('CurrencyService', () => {
    let mongoServer: MongoMemoryServer;
    let service: CurrencyService;
    let mongoUri: string;
    let connection: Connection;
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
    });

    const mockUserManagerService = {
        userModel: {
            findOneAndUpdate: jest.fn().mockResolvedValue(null),
            findById: jest.fn().mockResolvedValue({ currency: 0 }),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ShopModule, MongooseModule.forRoot(mongoUri), MongooseModule.forFeature([{ name: User.name, schema: userSchema }])],
            providers: [
                CurrencyService,
                {
                    provide: UserManagerService,
                    useValue: mockUserManagerService,
                },
                { provide: User, useValue: {} },
            ],
        }).compile();
        connection = await module.get(getConnectionToken());
        service = module.get<CurrencyService>(CurrencyService);
    });

    afterAll(async () => {
        await connection.close();
        await mongoServer.stop();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
