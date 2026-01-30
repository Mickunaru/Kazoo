import { inject } from '@angular/core';
import { CanDeactivateFn, RouterStateSnapshot } from '@angular/router';
import { PageUrl } from '@app/enum/page-url';
import { GameManagerService } from '@app/game/services/game-manager/game-manager.service';
import { PowerUpService } from '@app/game/services/power-up/power-up.service';
import { TeamService } from '@app/game/services/team/team.service';
import { TimerService } from '@app/game/services/timer/timer.service';
import { RoomService } from '@app/home/services/room/room.service';

interface ComponentCanDeactivate {}

export const leaveRoomGuard: CanDeactivateFn<ComponentCanDeactivate> = (
    component,
    currentRoute,
    currentState,
    nextState: RouterStateSnapshot,
    // eslint-disable-next-line max-params
): boolean => {
    const gameManagerService = inject(GameManagerService);
    const roomService = inject(RoomService);
    const timerService = inject(TimerService);
    const powerUpService = inject(PowerUpService);
    const teamService = inject(TeamService);

    const leaveRoomURls = [PageUrl.RESULTS, PageUrl.GAME_MASTER, PageUrl.GAME, PageUrl.WAITING_ROOM];
    const isStayingInRoom = leaveRoomURls.some((endPoint) => nextState.url.includes(endPoint));

    if (!isStayingInRoom) {
        powerUpService.resetListeners();
        roomService.resetManager();
        gameManagerService.resetManager();
        timerService.removeTimerListeners();
        timerService.resetTimer();
        teamService.resetManager();
    }

    return true;
};
