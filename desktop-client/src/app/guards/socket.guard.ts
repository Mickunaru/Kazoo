import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PageUrl } from '@app/enum/page-url';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';

export const socketGuard: CanActivateFn = (): boolean => {
    const router = inject(Router);
    const webSocketService = inject(WebsocketService);
    const isDefined = webSocketService.isSocketConnected();
    if (!isDefined) {
        router.navigate([`/${PageUrl.LOGIN}`]);
    }
    return isDefined;
};
