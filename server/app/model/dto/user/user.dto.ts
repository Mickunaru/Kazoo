import { PowerUpsCount } from '@common/interfaces/power-ups-count';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    uid: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    avatar: string;

    @ApiProperty()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    friendsIds: string[];

    @ApiProperty()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    vanityItems: string[];

    @ApiProperty()
    @IsOptional()
    powerUpsCount: PowerUpsCount;

    @ApiProperty()
    @IsOptional()
    currency: number;

    @ApiProperty()
    @IsOptional()
    fcmToken: string;
}
