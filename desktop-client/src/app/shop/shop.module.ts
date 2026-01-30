import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppMaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { PowerUpDisplayComponent } from './components/shop-display/power-up-display/power-up-display.component';
import { VanityDisplayComponent } from './components/shop-display/vanity-display/vanity-display.component';
import { ShopComponent } from './components/shop/shop.component';
import { ShopPageComponent } from './pages/shop-page/shop-page.component';

@NgModule({
    declarations: [ShopComponent, ShopPageComponent, PowerUpDisplayComponent, VanityDisplayComponent],
    imports: [AppMaterialModule, CommonModule, SharedModule, FormsModule],
    exports: [ShopPageComponent],
})
export class ShopModule {}
