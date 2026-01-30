import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

describe('FirebaseModule', () => {
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [ConfigModule],
        }).compile();
    });

    it('should compile the module', async () => {
        expect(module).toBeDefined();
        expect(module.get(ConfigModule)).toBeDefined();
    });
});
