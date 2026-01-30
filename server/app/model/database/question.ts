import { removeUnderscoreId } from '@app/utils/transform-utils';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Choice } from './choice';

export type QuestionDocument = Question & Document;

@Schema({
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: removeUnderscoreId,
    },
    timestamps: {
        updatedAt: 'lastModification',
    },
})
export class Question {
    @ApiProperty()
    @Prop({ index: true, unique: true })
    uuid: string;

    @ApiProperty()
    @Prop({ required: true })
    type: string;

    @ApiProperty()
    @Prop({ unique: true, required: true })
    text: string;

    @ApiProperty()
    @Prop({ required: true })
    points: number;

    @ApiProperty({ type: [Choice] })
    @Prop({ required: false })
    choices: Choice[];

    @ApiProperty({ name: 'id' })
    _id?: string;

    @ApiProperty()
    @Prop()
    lastModification: Date;

    @ApiProperty()
    @Prop({ default: 0 })
    lowerBound: number;

    @ApiProperty()
    @Prop({ default: 0 })
    upperBound: number;

    @ApiProperty()
    @Prop({ default: 0 })
    answer: number;

    @ApiProperty()
    @Prop({ default: 0 })
    precision: number;

    @ApiProperty()
    @Prop({ default: '' })
    imageUrl: string;

    @ApiProperty()
    @Prop({ required: true })
    creator: string;
}

export const questionSchema = SchemaFactory.createForClass(Question);
