import { S3Service } from '@app/services/s3-upload/s3.service';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { ChatController } from './chat.controller';

describe('ChatController', () => {
    let controller: ChatController;
    let s3Service: SinonStubbedInstance<S3Service>;

    beforeEach(async () => {
        s3Service = createStubInstance(S3Service);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChatController],
            providers: [
                {
                    provide: S3Service,
                    useValue: s3Service,
                },
            ],
        }).compile();

        controller = module.get<ChatController>(ChatController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
