import { UserManagerController } from '@app/controllers/user-manager/user-manager.controller';
import { User, userSchema } from '@app/model/database/user';
import { UserManagerService } from '@app/services/user-manager/user-manager.service';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { UserManagerModule } from './user-manager.module';

describe('UserManagerModule', () => {
    let module: TestingModule;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        module = await Test.createTestingModule({
            imports: [
                UserManagerModule,
                MongooseModule.forRootAsync({
                    imports: [UserManagerModule],
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
            ],
        })
            .overrideProvider('FIREBASE_APP')
            .useFactory({
                factory: () => null,
            })
            .compile();
        connection = await module.get(getConnectionToken());
    });

    afterAll(async () => {
        await connection.close();
        await mongoServer.stop();
    });

    it('should compile the module', async () => {
        expect(module).toBeDefined();
        expect(module.get(UserManagerService)).toBeDefined();
        expect(module.get(UserManagerController)).toBeDefined();
    });
});
