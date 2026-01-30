import { FireBaseAuthGuard, principal } from '@app/guards/firebase-auth-guard';
import { UserDocument } from '@app/model/database/user';
import { ShopService } from '@app/services/shop/shop.service';
import { SHOP_ENDPOINT } from '@common/constants/endpoint-constants';
import { ShopItem } from '@common/interfaces/shop-item';
import { Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
@Controller(SHOP_ENDPOINT)
export class ShopController {
    constructor(private readonly shopService: ShopService) {}

    @Get()
    async getAllShopItems(): Promise<ShopItem[]> {
        return await this.shopService.getAllShopItems();
    }

    @UseGuards(FireBaseAuthGuard)
    @Put(':id')
    async buyItem(@Param('id') id: string, @principal() uid: string): Promise<UserDocument> {
        return await this.shopService.buyItem(id, uid);
    }
}
