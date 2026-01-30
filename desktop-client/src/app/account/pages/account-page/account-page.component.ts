import { Component } from '@angular/core';
import { UserConfigService } from '@app/account/services/user-config/user-config.service';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { ShopService } from '@app/shop/services/shop/shop.service';

@Component({
    selector: 'app-account-page',
    templateUrl: './account-page.component.html',
    styleUrls: ['./account-page.component.scss'],
})
export class AccountPageComponent {
    // eslint-disable-next-line max-params
    constructor(
        readonly userAuthService: UserAuthService,
        readonly shopService: ShopService,
        readonly userConfigService: UserConfigService,
    ) {}

    getAvatar(): string {
        if (this.userAuthService.curUser?.avatar) {
            return `${this.userAuthService.curUser?.avatar}?${Date.now()}`;
        }
        return '';
    }
}
