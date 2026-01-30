import { removeUnderscoreId } from '@app/utils/transform-utils';
import { ShopItemType } from '@common/enum/shop-item-type';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type ShopDocument = ShopItem & Document;

@Schema({
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: removeUnderscoreId,
    },
})
export class ShopItem {
    @ApiProperty({ name: 'id' })
    _id?: string;

    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    type: ShopItemType;

    @ApiProperty()
    @Prop({ required: true })
    cost: number;

    @ApiProperty()
    @Prop({ required: false })
    imageUrl: string;

    @ApiProperty()
    @Prop({ required: false })
    soundUrl: string;
}

export const shopItemSchema = SchemaFactory.createForClass(ShopItem);
