import { removeUnderscoreId } from '@app/utils/transform-utils';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Question } from './question';

export type GameDocument = Game & Document;

@Schema({
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: removeUnderscoreId,
    },
    timestamps: {
        updatedAt: 'lastModification',
    },
    toObject: {
        virtuals: true,
    },
})
export class Game {
    @ApiProperty({ name: 'id' })
    _id?: string;

    @ApiProperty()
    @Prop({ required: true })
    title: string;

    @ApiProperty()
    @Prop({ required: true })
    description: string;

    @ApiProperty()
    @Prop({ required: true })
    duration: number;

    @ApiProperty({ type: [Question] })
    @Prop({ required: true })
    questions: Question[];

    @ApiProperty()
    @Prop({ required: true })
    private: boolean;

    @ApiProperty()
    @Prop({ required: true })
    creator: string;

    @ApiProperty()
    @Prop({ default: true })
    isHidden: boolean;

    @ApiProperty()
    @Prop()
    lastModification: Date;

    id: string | null;
}

export const gameSchema = SchemaFactory.createForClass(Game);
