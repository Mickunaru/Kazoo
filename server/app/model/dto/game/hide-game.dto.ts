import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class HideGameDto {
    @ApiProperty()
    @IsBoolean()
    isHidden: boolean;
}
