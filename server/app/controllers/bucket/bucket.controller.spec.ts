import { FireBaseAuthGuard } from '@app/guards/firebase-auth-guard';
import { ConnectionService } from '@app/services/connection/connection.service';
import { S3Service } from '@app/services/s3-upload/s3.service';
import { Test, TestingModule } from '@nestjs/testing';
import { BucketController } from './bucket.controller';

describe('BucketController', () => {
    let controller: BucketController;

    beforeEach(async () => {
        const mockConnectionService = {
            authentificateUser: jest.fn().mockResolvedValue('user123'),
        };
        const s3Service = { getSignedUrl: jest.fn().mockResolvedValue('signedURL') };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [BucketController],
            providers: [
                {
                    provide: FireBaseAuthGuard,
                    useValue: { canActivate: jest.fn().mockReturnValue(true) },
                },
                {
                    provide: ConnectionService,
                    useValue: mockConnectionService,
                },
                { provide: S3Service, useValue: s3Service },
            ],
        }).compile();

        controller = module.get<BucketController>(BucketController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
