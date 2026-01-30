import { DocumentNotFoundError } from '@app/exceptions/document-not-found-exception';
import { Notification, NotificationDocument, notificationSchema } from '@app/model/database/notification';
import { NotificationDto } from '@app/model/dto/notification/notification.dto';
import { NotificationType } from '@common/enum/notification-type';
import { Logger } from '@nestjs/common';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, Types } from 'mongoose';
import { NotificationService } from './notification.service';
describe('NotificationService', () => {
    let service: NotificationService;
    let notificationModel: Model<NotificationDocument>;

    beforeEach(async () => {
        notificationModel = {
            create: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            deleteOne: jest.fn(),
        } as unknown as Model<NotificationDocument>;

        const firebaseAppMock = {
            messaging: () => ({
                send: jest.fn(),
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationService,
                {
                    provide: getModelToken(Notification.name),
                    useValue: notificationModel,
                },
                {
                    provide: 'FIREBASE_APP',
                    useValue: firebaseAppMock,
                },
                Logger,
            ],
        }).compile();

        service = module.get<NotificationService>(NotificationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

describe('NotificationServiceWithFakeDB', () => {
    let service: NotificationService;
    let notificationModel: Model<NotificationDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;
    let fakeNotification: NotificationDto;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
    });

    beforeEach(async () => {
        const firebaseAppMock = {
            messaging: () => ({
                send: jest.fn(),
            }),
        };

        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Notification.name, schema: notificationSchema }]),
            ],
            providers: [
                NotificationService,
                {
                    provide: 'FIREBASE_APP',
                    useValue: firebaseAppMock,
                },
                Logger,
            ],
        }).compile();

        service = module.get<NotificationService>(NotificationService);
        notificationModel = module.get<Model<NotificationDocument>>(getModelToken(Notification.name));
        connection = await module.get(getConnectionToken());

        await notificationModel.deleteMany({});

        fakeNotification = {
            recipientUsername: '12345',
            senderUsername: '54321',
            type: NotificationType.FriendRequest,
        };
    });

    afterEach(async () => {
        await connection.close();
    });

    afterAll(async () => {
        await mongoServer.stop();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(notificationModel).toBeDefined();
    });

    it('createNotification() should add a notification to the DB', async () => {
        const newNotification = await service.createNotification(fakeNotification);
        expect(await notificationModel.countDocuments()).toEqual(1);
        expect(newNotification).toEqual(expect.objectContaining(fakeNotification));
    });

    it('getUserNotifications() should return notifications for a user', async () => {
        await notificationModel.create(fakeNotification);
        const notifications = await service.getUserNotifications(fakeNotification.recipientUsername);
        expect(notifications.length).toEqual(1);
        expect(notifications[0]).toEqual(expect.objectContaining(fakeNotification));
    });

    it('deleteNotification() should delete a notification', async () => {
        const newNotification = await notificationModel.create(fakeNotification);
        expect(await notificationModel.countDocuments()).toEqual(1);
        await service.deleteNotification(newNotification.id);
        expect(await notificationModel.countDocuments()).toEqual(0);
    });

    it('deleteNotification() should throw an error if notification does not exist', async () => {
        const invalidId = new Types.ObjectId().toHexString();
        await expect(service.deleteNotification(invalidId)).rejects.toThrowError(DocumentNotFoundError);
    });
});
