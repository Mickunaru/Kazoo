import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SERVER_URL_API } from '@app/constants/server-url-and-api-constant';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { CURRENCY_ENDPOINT, SHOP_ENDPOINT } from '@common/constants/endpoint-constants';
import { ShopItemType } from '@common/enum/shop-item-type';
import { PowerUpsCount } from '@common/interfaces/power-ups-count';
import { ShopItem } from '@common/interfaces/shop-item';
import { User } from '@common/interfaces/user';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ShopService {
    fetchedItems: ShopItem[];
    selecteditem?: string = undefined;
    private readonly baseUrl: string = `${SERVER_URL_API}/${SHOP_ENDPOINT}`;
    private isBuyingItem = false;

    constructor(
        private readonly http: HttpClient,
        readonly userAuthService: UserAuthService,
        private readonly snackBar: MatSnackBar,
    ) {}

    get powerUps(): ShopItem[] {
        return this.fetchedItems?.filter((item: ShopItem) => item.type === ShopItemType.POWER_UP);
    }

    get vanityItems(): ShopItem[] {
        return this.fetchedItems?.filter((item: ShopItem) => item.type !== ShopItemType.POWER_UP);
    }

    get ownedAvatars(): ShopItem[] {
        return this.fetchedItems?.filter((item: ShopItem) => item.type === ShopItemType.AVATAR && this.isOwned(item.name));
    }

    get ownedThemes(): ShopItem[] {
        return this.fetchedItems?.filter((item: ShopItem) => item.type === ShopItemType.THEME && this.isOwned(item.name));
    }

    getAmount(name: string): number {
        return this.userAuthService.curUser?.powerUpsCount[name as keyof PowerUpsCount] ?? 0;
    }

    decreaseAmount(name: string): void {
        const user = this.userAuthService.curUser;
        if (!user) return;
        user.powerUpsCount[name as keyof PowerUpsCount]--;
    }

    async getShopItems() {
        this.fetchedItems = await firstValueFrom(this.http.get<ShopItem[]>(this.baseUrl));
    }

    selectItem(id: string) {
        this.selecteditem = id;
    }

    isOwned(name: string): boolean {
        return !!this.userAuthService.curUser?.vanityItems.find((itemName: string) => itemName === name);
    }

    async buySelectedItem(id: string): Promise<void> {
        if (this.isBuyingItem) return;
        this.isBuyingItem = true;
        try {
            this.userAuthService.curUser = await this.buyItem(id);
            this.snackBar.open('Item acheté', 'close');
        } catch (response: unknown) {
            if (response instanceof HttpErrorResponse) {
                if (response.status === HttpStatusCode.Unauthorized) {
                    this.snackBar.open("Vous n'avez pas suffisamment d'argent pour acheter l'item", 'close');
                } else {
                    this.snackBar.open("Une erreur est survenu lors de l'achat de l'item", 'close');
                }
            }
        }
        this.isBuyingItem = false;
    }

    async getCurrency(): Promise<number> {
        return firstValueFrom(this.http.get<number>(`${this.baseUrl}/${CURRENCY_ENDPOINT}`));
    }

    private async buyItem(id: string | undefined): Promise<User> {
        return await firstValueFrom(this.http.put<User>(`${this.baseUrl}/${id}`, null, this.userAuthService.requestOptions()));
    }
}
