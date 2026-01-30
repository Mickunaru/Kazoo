import { Component, OnInit } from '@angular/core';
import { ShopService } from '@app/shop/services/shop/shop.service';
@Component({
    selector: 'app-shop',
    templateUrl: './shop.component.html',
    styleUrls: ['./shop.component.scss'],
})
export class ShopComponent implements OnInit {
    constructor(readonly shopService: ShopService) {}
    ngOnInit() {
        this.shopService.getShopItems();
    }
}
