import { ID_MOCK, INVALID_ID } from '@app/constants/test-utils';
import { BadRequestException } from '@nestjs/common';
import { ValidateMongoIdPipe } from './validate-mongo-id-pipe';

describe('Validation Id Pipe', () => {
    it('Validation Pipe Return Valid Id', () => {
        const pipe = new ValidateMongoIdPipe();
        expect(pipe.transform(ID_MOCK)).toEqual(ID_MOCK);
    });

    it('Validation Pipe Should Throw BadRequestException when Invalid Id', () => {
        const pipe = new ValidateMongoIdPipe();
        expect(() => pipe.transform(INVALID_ID)).toThrowError(BadRequestException);
    });

    it('Validation Pipe Should Throw BadRequestException when empty string', () => {
        const pipe = new ValidateMongoIdPipe();
        expect(() => pipe.transform('')).toThrowError(BadRequestException);
    });

    it('Validation Pipe Should Throw BadRequestException when undefined', () => {
        const pipe = new ValidateMongoIdPipe();
        expect(() => pipe.transform(undefined as unknown as string)).toThrowError(BadRequestException);
    });
});
