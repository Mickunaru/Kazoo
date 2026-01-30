import { Component } from '@angular/core';
import { UserConfigService } from '@app/account/services/user-config/user-config.service';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { ShopService } from '@app/shop/services/shop/shop.service';
@Component({
    selector: 'app-shop-page',
    templateUrl: './shop-page.component.html',
    styleUrls: ['./shop-page.component.scss'],
})
export class ShopPageComponent {
    constructor(
        readonly userService: UserAuthService,
        readonly shopService: ShopService,
        readonly userConfigService: UserConfigService,
    ) {}

    getAvatar(): string {
        return this.userService.curUser?.avatar ?? '';
    }
}
