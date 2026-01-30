import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { UserCurrency } from '@common/interfaces/user';
import { HomeEvent } from '@common/socket-events/home-event';

@Component({
    selector: 'app-money-display',
    templateUrl: './money-display.component.html',
    styleUrls: ['./money-display.component.scss'],
})
export class MoneyDisplayComponent implements OnInit, OnDestroy {
    constructor(
        readonly webSocketService: WebsocketService,
        readonly userAuthService: UserAuthService,
    ) {}

    ngOnInit() {
        this.webSocketService.on<UserCurrency>(HomeEvent.UPDATE_USER_MONEY, (userCurrency) => {
            if (!userCurrency || !this.userAuthService.curUser) return;
            this.userAuthService.curUser.currency = userCurrency.currency;
        });
    }

    ngOnDestroy(): void {
        this.webSocketService.removeAllListeners(HomeEvent.UPDATE_USER_MONEY);
    }
}
