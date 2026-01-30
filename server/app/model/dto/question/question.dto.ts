import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { QUESTION_POINTS_MAX, QUESTION_POINTS_MIN } from '@common/constants/game-constants';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class QuestionDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    type: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    text: string;

    @ApiProperty()
    @IsNotEmpty()
    @Min(QUESTION_POINTS_MIN)
    @Max(QUESTION_POINTS_MAX)
    @IsNumber()
    points: number;

    @ApiProperty({ type: [QuestionDto] })
    @Type(() => ChoiceDto || undefined)
    choices: ChoiceDto[];

    lowerBound?: number;
    upperBound?: number;
    answer?: number;
    precision?: number;
    imageUrl?: string;
    uuid?: string;
    creator?: string;
}
