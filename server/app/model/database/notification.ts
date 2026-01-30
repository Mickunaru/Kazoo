import { removeUnderscoreId } from '@app/utils/transform-utils';
import { NotificationType } from '@common/enum/notification-type';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: removeUnderscoreId,
    },
    timestamps: {
        createdAt: 'createdAt',
    },
    toObject: {
        virtuals: true,
    },
})
export class Notification {
    @ApiProperty({ name: 'id' })
    _id?: string;

    @ApiProperty()
    @Prop({ required: true })
    type: NotificationType;

    @ApiProperty()
    @Prop({ required: true })
    recipientUsername: string;

    @ApiProperty()
    @Prop({ required: true })
    senderUsername: string;

    @ApiProperty()
    @Prop({ required: false })
    data?: string;

    @ApiProperty()
    @Prop()
    createdAt: Date;
}

export const notificationSchema = SchemaFactory.createForClass(Notification);
