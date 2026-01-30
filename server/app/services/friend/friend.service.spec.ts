import { User, UserDocument, userSchema } from '@app/model/database/user';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { FriendService } from './friend.service';

describe('FriendService', () => {
    let service: FriendService;
    let friendsModel: Model<UserDocument>;

    beforeEach(async () => {
        friendsModel = {
            create: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            deleteOne: jest.fn(),
        } as unknown as Model<UserDocument>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FriendService,
                {
                    provide: getModelToken(User.name),
                    useValue: friendsModel,
                },
            ],
        }).compile();

        service = module.get<FriendService>(FriendService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

describe('FriendsServiceWithFakeDB', () => {
    let service: FriendService;
    let friendsModel: Model<UserDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;
    let fakeUser1: User;
    let fakeUser2: User;
    const fakeUsername = 'fakeUsername';
    let userModel: Model<User>;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
    });

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
            ],
            providers: [FriendService],
        }).compile();

        service = module.get<FriendService>(FriendService);
        friendsModel = module.get<Model<UserDocument>>(getModelToken(User.name));
        userModel = module.get<Model<User>>(getModelToken(User.name));
        connection = await module.get<Connection>(getConnectionToken());

        await friendsModel.deleteMany({});

        fakeUser1 = {
            uid: '00001',
            email: 'a@a',
            username: 'user1',
            avatar: '-',
        } as User;
        fakeUser2 = {
            uid: '00002',
            email: 'b@b',
            username: 'user2',
            avatar: '-',
        } as User;
    });

    afterEach(async () => {
        await connection.close();
    });

    afterAll(async () => {
        await mongoServer.stop();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(friendsModel).toBeDefined();
    });

    it('addFriend() should add to friend list, not empty', async () => {
        const fakeUserModel1 = await userModel.create(fakeUser1);
        fakeUserModel1.friendNames.push(fakeUsername);
        await fakeUserModel1.save();
        await userModel.create(fakeUser2);
        await service.addFriend(fakeUser1.username, fakeUser2.username);
        const result = (await userModel.findOne({ uid: fakeUser1.uid })) as User;
        expect(result.friendNames.length).toEqual(2);
        expect(result.friendNames).toContain(fakeUser2.username);
    });

    it('addFriend() should add to friend list, empty', async () => {
        await userModel.create(fakeUser1);
        await userModel.create(fakeUser2);
        await service.addFriend(fakeUser1.username, fakeUser2.username);
        const result = (await userModel.findOne({ uid: fakeUser1.uid })) as User;
        expect(result.friendNames.length).toEqual(1);
        expect(result.friendNames).toContain(fakeUser2.username);
    });

    it('removeFriend() should remove friend from list, user attribute', async () => {
        const fakeUserModel1 = await userModel.create(fakeUser1);
        fakeUserModel1.friendNames.push(fakeUser2.username);
        fakeUserModel1.save();

        const fakeUserModel2 = await userModel.create(fakeUser2);
        fakeUserModel2.friendNames.push(fakeUser1.username);
        fakeUserModel2.save();

        await service.removeFriend(fakeUser1.username, fakeUser2.username);
        const result = (await userModel.findOne({ uid: fakeUser1.uid })) as User;
        expect(result.friendNames.length).toEqual(0);
        expect(result.friendNames).not.toContain(fakeUser2.username);
    });

    it('getFriends() should get list of users that are friends', async () => {
        const fakeUserModel1 = await userModel.create(fakeUser1);
        fakeUserModel1.friendNames.push(fakeUser2.username);
        fakeUserModel1.save();

        const result: string[] = await service.getAllFriendUsernames(fakeUser1.username);
        expect(result.length).toEqual(1);
        expect(result[0]).toEqual(fakeUser2.username);
    });

    it('getNotFriends() should get list of users that are not friends', async () => {
        await userModel.create(fakeUser1);
        await userModel.create(fakeUser2);
        const result: string[] = await service.getAllNotFriendsUsernames(fakeUser1.username);
        expect(result.length).toEqual(1);
        expect(result[0]).toEqual(fakeUser2.username);
    });
});
