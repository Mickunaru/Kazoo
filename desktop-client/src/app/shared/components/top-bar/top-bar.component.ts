import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NotificationService } from '@app/account/services/notification/notification.service';
import { PageUrl } from '@app/enum/page-url';
import { LeaveGameDialogComponent } from '@app/game/components/leave-game-dialog/leave-game-dialog.component';
import { RoomService } from '@app/home/services/room/room.service';
import { ThemeConfigService } from '@app/shared/services/themeConfig/theme-config.service';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { ShopService } from '@app/shop/services/shop/shop.service';
import { ShopItem } from '@common/interfaces/shop-item';

@Component({
    selector: 'app-top-bar',
    templateUrl: './top-bar.component.html',
    styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent implements OnInit {
    ownedThemes: ShopItem[] = [];
    // eslint-disable-next-line max-params
    constructor(
        readonly themeConfigService: ThemeConfigService,
        readonly shopService: ShopService,
        readonly userAuthService: UserAuthService,
        readonly roomService: RoomService,
        private readonly dialog: MatDialog,
        private readonly router: Router,
        protected readonly notificationService: NotificationService,
    ) {}

    async ngOnInit() {
        await this.shopService.getShopItems();
        this.userAuthService.updateUser();
    }

    showExitDialog(func: () => void, isLoggout = false): void {
        if (!this.roomService.roomId || isLoggout) {
            func();
            return;
        }
        const dialogRef = this.dialog.open(LeaveGameDialogComponent, {
            data: {
                title: 'Attention!',
                description: 'Êtes-vous certain de vouloir quitter la partie ?',
                cancelText: 'Annuler',
                confirmText: 'Quitter',
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                func();
            }
        });
    }

    signOut() {
        this.userAuthService.signOut();
        window.location.reload();
    }

    goToHome() {
        this.goTo(PageUrl.HOME);
    }

    goToShop() {
        this.goTo(PageUrl.SHOP);
    }

    goToAccount() {
        this.goTo(PageUrl.ACCOUNT);
    }

    goToAdmin() {
        this.goTo(PageUrl.ADMIN);
    }

    private goTo(path: string): void {
        this.router.navigate([`/${PageUrl.APP_PREFIX}/${path}`]);
    }
}
