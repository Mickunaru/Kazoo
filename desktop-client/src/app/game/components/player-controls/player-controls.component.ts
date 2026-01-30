import { Component, OnInit } from '@angular/core';
import { PowerUpService } from '@app/game/services/power-up/power-up.service';
import { RoomService } from '@app/home/services/room/room.service';
import { ShopService } from '@app/shop/services/shop/shop.service';
import { POWER_UP_DESCRIPTION, SUCCESS_RESPONSE } from '@common/constants/power-ups-constants';
import { ShopItem } from '@common/interfaces/shop-item';

@Component({
    selector: 'app-player-controls',
    templateUrl: './player-controls.component.html',
    styleUrls: ['./player-controls.component.scss'],
})
export class PlayerControlsComponent implements OnInit {
    powerUps: ShopItem[] = [];
    readonly powerUpsDescriptions: Record<string, string> = POWER_UP_DESCRIPTION;

    constructor(
        readonly shopService: ShopService,
        readonly powerUpService: PowerUpService,
        readonly roomService: RoomService,
    ) {}

    async ngOnInit(): Promise<void> {
        await this.shopService.getShopItems();
        this.powerUps = this.shopService.powerUps;
    }

    async handlePowerUp(powerUpName: string) {
        const message = await this.powerUpService.requestPowerUp(powerUpName);
        if (message === SUCCESS_RESPONSE) {
            this.shopService.decreaseAmount(powerUpName);
        }
    }
}
