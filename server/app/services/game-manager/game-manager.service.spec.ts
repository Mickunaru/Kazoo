import { Test, TestingModule } from '@nestjs/testing';
import { GameManagerService } from './game-manager.service';

describe('GameManagerService', () => {
    let service: GameManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameManagerService],
        }).compile();

        service = module.get<GameManagerService>(GameManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
