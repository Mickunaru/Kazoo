import { removeUnderscoreId } from '@app/utils/transform-utils';
import { MessageType } from '@common/interfaces/message';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type ChatMessagesDocument = ChatMessage & Document;

@Schema({
    toJSON: {
        versionKey: false,
        transform: removeUnderscoreId,
    },
})
export class ChatMessage {
    @ApiProperty({ name: 'id' })
    _id?: string;

    @ApiProperty()
    @Prop({ required: true, index: true })
    room: string;

    @ApiProperty()
    @Prop({ required: true })
    author: string;

    @ApiProperty()
    @Prop({ required: true })
    text: string;

    @ApiProperty()
    @Prop({ required: true })
    date: Date;

    @ApiProperty()
    @Prop({ required: true })
    type: MessageType;

    @ApiProperty()
    @Prop({ required: false })
    duration?: number;
}

export const chatMessageSchema = SchemaFactory.createForClass(ChatMessage);
