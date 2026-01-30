import { Component, Input } from '@angular/core';
import { SHOP_DISPLAY_PLACEHOLDER } from '@app/shop/components/shop-display/shop-display-placeholder';
import { ShopService } from '@app/shop/services/shop/shop.service';
import { ShopItem } from '@common/interfaces/shop-item';

@Component({
    selector: 'app-vanity-display',
    templateUrl: './vanity-display.component.html',
    styleUrls: ['../shop-display.component.scss'],
})
export class VanityDisplayComponent {
    @Input({ required: true }) itemList!: ShopItem[];
    protected readonly imagePlaceholder = SHOP_DISPLAY_PLACEHOLDER;

    constructor(readonly shopService: ShopService) {}

    borderClass(item: ShopItem): string {
        return this.shopService.isOwned(item.name) ? 'owned-border' : 'border';
    }

    isSelected(id: string): boolean {
        return id === this.shopService.selecteditem;
    }
}
