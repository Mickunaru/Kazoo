import { Component, Input } from '@angular/core';
import { SHOP_DISPLAY_PLACEHOLDER } from '@app/shop/components/shop-display/shop-display-placeholder';
import { ShopService } from '@app/shop/services/shop/shop.service';
import { POWER_UP_DESCRIPTION } from '@common/constants/power-ups-constants';
import { ShopItem } from '@common/interfaces/shop-item';

@Component({
    selector: 'app-power-up-display',
    templateUrl: './power-up-display.component.html',
    styleUrls: ['../shop-display.component.scss'],
})
export class PowerUpDisplayComponent {
    @Input({ required: true }) itemList: ShopItem[];
    @Input({ required: false }) title?: string;
    protected readonly imagePlaceholder = SHOP_DISPLAY_PLACEHOLDER;

    constructor(readonly shopService: ShopService) {}

    borderClass(item: ShopItem): string {
        return this.shopService.isOwned(item.name) ? 'owned-border' : 'border';
    }

    getDescription(itemName: string): string {
        return POWER_UP_DESCRIPTION[itemName as keyof typeof POWER_UP_DESCRIPTION] || 'Description non disponible';
    }

    capitalizeFirstLetter(s: string): string {
        if (!s) return s;
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
}
