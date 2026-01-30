import { QUESTION_DURATION_MAX, QUESTION_DURATION_MIN } from '@app/constants/time-constants';
import { QuestionDto } from '@app/model/dto/question/question.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsString, Max, Min, ValidateNested } from 'class-validator';

export class GameDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Min(QUESTION_DURATION_MIN)
    @Max(QUESTION_DURATION_MAX)
    duration: number;

    @ApiProperty({ type: [QuestionDto] })
    @IsArray()
    @ArrayMinSize(1)
    @Type(() => QuestionDto)
    @IsObject({ each: true })
    @ValidateNested({ each: true })
    questions: QuestionDto[];

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    private: boolean;

    creator: string;
}
