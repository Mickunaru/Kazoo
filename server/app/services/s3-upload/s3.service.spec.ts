import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';

describe('S3Service', () => {
    let service: S3Service;

    beforeEach(async () => {
        const mockConfigService = {
            get: jest.fn((key: string) => {
                const mockConfig = {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    S3_REGION: 'MR.WORLDWIDE',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    S3_ACCESS_KEY: 'mock-access-key',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    S3_SECRET_KEY: 'mock-secret-key',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    S3_BUCKET_NAME: 'mock-bucket',
                };
                return mockConfig[key];
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [S3Service, { provide: ConfigService, useValue: mockConfigService }, { provide: Logger, useValue: { log: jest.fn() } }],
        }).compile();

        service = module.get<S3Service>(S3Service);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
