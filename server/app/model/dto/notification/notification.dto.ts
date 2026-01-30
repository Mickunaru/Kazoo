import { NotificationType } from '@common/enum/notification-type';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class NotificationDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    _id?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    type: NotificationType;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    recipientUsername: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    senderUsername: string;

    @ApiProperty()
    @IsString()
    data?: string;
}
