import { ShopItem } from '@app/model/database/shop-item';
import { UserDocument } from '@app/model/database/user';
import { UserManagerService } from '@app/services/user-manager/user-manager.service';
import { ShopItemType } from '@common/enum/shop-item-type';
import { ShopItem as itemInterface } from '@common/interfaces/shop-item';
import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class ShopService {
    constructor(
        private readonly logger: Logger,
        private readonly userManagerService: UserManagerService,
        @InjectModel(ShopItem.name) private readonly shopItemModel,
    ) {}

    async getAllShopItems(): Promise<itemInterface[]> {
        return this.shopItemModel.find({ cost: { $ne: 0 } });
    }

    async buyItem(id: string, uid: string): Promise<UserDocument> {
        const item: ShopItem = await this.getShopItemById(id);

        const user: UserDocument | null = await this.userManagerService.getUserById(uid);
        if (!user) throw new BadRequestException();

        if (user.currency < item.cost) throw new UnauthorizedException('Manque de fonds');
        switch (item.type) {
            case ShopItemType.POWER_UP:
                user.powerUpsCount[item.name]++;
                user.markModified('powerUpsCount');
                break;
            default:
                user.vanityItems.push(item.name);
                break;
        }
        user.currency -= item.cost;
        this.logger.log(`Item with id ${id} bought by user with id ${uid}`);
        return user.save();
    }

    async getShopItemById(id: string): Promise<ShopItem> {
        return this.shopItemModel.findById(id);
    }

    async addItem(item: itemInterface) {
        try {
            await this.shopItemModel.create(item);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
    async deleteItem(id: string) {
        await this.shopItemModel.findByIdAndDelete(id);
    }

    async updateItem(id: string, item: itemInterface) {
        await this.shopItemModel.findByIdAndUpdate(id, item, { upsert: true, new: true });
    }
}
