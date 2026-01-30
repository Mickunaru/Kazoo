import { PipeTransform } from '@nestjs/common';

export class ParseStringPipe implements PipeTransform<string | number, string> {
    transform(value: string | number) {
        return value?.toString() ?? '';
    }
}
