import { removeUnderscoreId } from '@app/utils/transform-utils';
import { GENERAL_CHAT_NAME } from '@common/interfaces/message';
import { PowerUpsCount } from '@common/interfaces/power-ups-count';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
export type UserDocument = User & Document;

@Schema({
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: removeUnderscoreId,
    },
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'lastConnection',
    },
    toObject: {
        virtuals: true,
    },
})
export class User {
    @ApiProperty({ name: 'id' })
    _id?: string;

    @ApiProperty()
    @Prop({ index: true, unique: true, required: true })
    uid: string;

    @ApiProperty()
    @Prop({ unique: true, required: true })
    username: string;

    @ApiProperty()
    @Prop({ unique: true, required: true })
    email: string;

    @ApiProperty()
    @Prop({ required: true })
    avatar: string;

    @ApiProperty()
    @Prop({ type: [String], default: [] })
    friendNames: string[];

    @ApiProperty()
    @Prop({ type: [String], default: [] })
    vanityItems: string[];

    @ApiProperty()
    @Prop({ type: Object, default: { tricheur: 0, vitesse: 0, confusion: 0, surge: 0, tornade: 0 } })
    powerUpsCount: PowerUpsCount;

    @ApiProperty()
    @Prop({ type: Number, default: 0 })
    currency: number;

    @ApiProperty()
    @Prop()
    createdAt: Date;

    @ApiProperty()
    @Prop()
    lastConnection: Date;

    @ApiProperty()
    @Prop({ type: [Object], default: [{ name: GENERAL_CHAT_NAME, unreadMessages: 0 }] })
    chatRooms: UserChatRoomData[];

    @ApiProperty()
    @Prop({ required: false, default: '' })
    fcmToken: string;
}

export interface UserChatRoomData {
    name: string;
    unreadMessages: number;
}

export const userSchema = SchemaFactory.createForClass(User);
