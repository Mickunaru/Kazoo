import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PageUrl } from '@app/enum/page-url';
import { GameManagerService } from '@app/game/services/game-manager/game-manager.service';
import { PowerUpService } from '@app/game/services/power-up/power-up.service';
import { TimerService } from '@app/game/services/timer/timer.service';

export const enterRoomGuard: CanActivateFn = (): boolean => {
    const timerService = inject(TimerService);
    const gameManager = inject(GameManagerService);
    const powerUpService = inject(PowerUpService);
    const router = inject(Router);

    const leaveRoomURls = [PageUrl.RESULTS, PageUrl.GAME_MASTER, PageUrl.GAME, PageUrl.WAITING_ROOM];

    const previousPage = router.getCurrentNavigation()?.previousNavigation?.finalUrl?.toString();
    const previousEndpoint = previousPage?.split('/').pop();

    const entersRoomPages = !previousEndpoint || leaveRoomURls.every((endPoint) => previousEndpoint !== endPoint);
    if (entersRoomPages) {
        gameManager.setupManager();
        timerService.setTimerListeners();
        powerUpService.setupManager();
    }
    return true;
};
