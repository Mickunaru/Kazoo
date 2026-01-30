import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { ShopItem } from '@app/model/database/shop-item';
import { User, UserDocument } from '@app/model/database/user';
import { UserDto } from '@app/model/dto/user/user.dto';
import { UserManagerService } from '@app/services/user-manager/user-manager.service';
import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';

describe('UserManagerService', () => {
    let service: UserManagerService;
    let userModelStub: SinonStubbedInstance<Model<UserDocument>>;
    let shopItemModelStub: SinonStubbedInstance<Model<ShopItem>>;
    let loggerStub: SinonStubbedInstance<Logger>;

    beforeEach(async () => {
        userModelStub = createStubInstance(Model) as unknown as SinonStubbedInstance<Model<UserDocument>>;
        shopItemModelStub = createStubInstance(Model) as unknown as SinonStubbedInstance<Model<ShopItem>>;
        loggerStub = createStubInstance(Logger);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserManagerService,
                {
                    provide: getModelToken(User.name),
                    useValue: userModelStub,
                },
                {
                    provide: getModelToken(ShopItem.name),
                    useValue: shopItemModelStub,
                },
                {
                    provide: Logger,
                    useValue: loggerStub,
                },
            ],
        }).compile();

        service = module.get<UserManagerService>(UserManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createUser', () => {
        it('should create a new user with the provided DTO', async () => {
            // Arrange
            const userDto: UserDto = {
                uid: 'test-uid-123',
                email: 'test@example.com',
                username: 'testuser',
                avatar: 'avatar-url',
                friendsIds: [],
                vanityItems: [],
                powerUpsCount: { tricheur: 0, vitesse: 0, confusion: 0, surge: 0, tornade: 0 },
                currency: 0,
                fcmToken: '',
            };

            const expectedUser: User = {
                uid: userDto.uid,
                email: userDto.email,
                username: userDto.username,
                avatar: userDto.avatar,
                friendNames: [],
                vanityItems: userDto.vanityItems || [],
                powerUpsCount: userDto.powerUpsCount || { tricheur: 0, vitesse: 0, confusion: 0, surge: 0, tornade: 0 },
                currency: userDto.currency || 0,
                chatRooms: [],
                createdAt: new Date(),
                lastConnection: new Date(),
                fcmToken: '',
            };

            userModelStub.create = stub().callsFake(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return Promise.resolve(expectedUser) as any;
            });

            const result = await service.createUser(userDto);

            expect(userModelStub.create.calledOnceWith(userDto)).toBe(true);
            expect(result).toEqual(expectedUser);
        });
    });
});
