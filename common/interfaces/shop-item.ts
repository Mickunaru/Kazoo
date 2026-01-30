import { ShopItemType } from '../enum/shop-item-type';
export interface ShopItem {
    id: string;
    name: string;
    type: ShopItemType;
    cost: number;
    imageUrl: string;
    soundUrl?: string;
}
