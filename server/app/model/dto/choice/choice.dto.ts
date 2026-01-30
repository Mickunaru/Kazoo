import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ChoiceDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    text: string;

    @ApiProperty()
    @IsBoolean()
    isCorrect: boolean;
}
