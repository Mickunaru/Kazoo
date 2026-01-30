import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type ChoicesDocument = Choice & Document;

@Schema()
export class Choice {
    @ApiProperty()
    @Prop({ required: true })
    text: string;

    @ApiProperty()
    @Prop({ required: true })
    isCorrect: boolean;
}

export const choiceSchema = SchemaFactory.createForClass(Choice);
