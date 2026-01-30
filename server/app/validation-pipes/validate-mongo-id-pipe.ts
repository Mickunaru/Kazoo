import { INVALID_ID_ERROR } from '@app/constants/error-message-constants';
import { BadRequestException, Param, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

export class ValidateMongoIdPipe implements PipeTransform<string> {
    transform(value: string) {
        if (!Types.ObjectId.isValid(value)) {
            throw new BadRequestException(INVALID_ID_ERROR);
        }
        return value;
    }
}

export const mongoIdParam = (param = 'id'): ParameterDecorator => Param(param, new ValidateMongoIdPipe());
