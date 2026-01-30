import { ChatRoomType } from '@common/interfaces/message';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type ChatRoomsDocument = ChatRoom & Document;

@Schema({
    toJSON: {
        versionKey: false,
    },
})
export class ChatRoom {
    @ApiProperty({ name: 'id' })
    _id?: string;

    @ApiProperty()
    @Prop({ required: true, unique: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    type: ChatRoomType;

    @ApiProperty()
    @Prop({ required: true, type: [String], default: [] })
    members: string[];

    @ApiProperty()
    @Prop({ required: false })
    creator: string;

    @ApiProperty()
    @Prop({ required: true, default: false })
    hasSoundboard: boolean;
}

export const chatRoomSchema = SchemaFactory.createForClass(ChatRoom);
