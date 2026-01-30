import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { PageUrl } from '@app/enum/page-url';
import { GameManagerService } from '@app/game/services/game-manager/game-manager.service';
import { PowerUpService } from '@app/game/services/power-up/power-up.service';
import { TeamService } from '@app/game/services/team/team.service';
import { TimerService } from '@app/game/services/timer/timer.service';
import { RoomService } from '@app/home/services/room/room.service';
import { leaveRoomGuard } from './leave-room.guard';

describe('LeaveRoomGuard', () => {
    let gameManagerServiceSpy: jasmine.SpyObj<GameManagerService>;
    let timerServiceSpy: jasmine.SpyObj<TimerService>;
    let powerUpServiceSpy: jasmine.SpyObj<PowerUpService>;
    let roomServiceSpy: jasmine.SpyObj<RoomService>;
    let teamServiceSpy: jasmine.SpyObj<TeamService>;

    beforeEach(() => {
        gameManagerServiceSpy = jasmine.createSpyObj('GameManagerService', ['send', 'resetManager']);
        timerServiceSpy = jasmine.createSpyObj('TimerService', ['send', 'removeTimerListeners', 'resetTimer']);
        powerUpServiceSpy = jasmine.createSpyObj('PowerUpService', ['resetListeners']);
        roomServiceSpy = jasmine.createSpyObj('RoomService', ['resetManager']);
        teamServiceSpy = jasmine.createSpyObj('TeamService', ['resetManager']);
        TestBed.configureTestingModule({
            providers: [
                { provide: GameManagerService, useValue: gameManagerServiceSpy },
                { provide: TimerService, useValue: timerServiceSpy },
                { provide: PowerUpService, useValue: powerUpServiceSpy },
                { provide: RoomService, useValue: roomServiceSpy },
                { provide: TeamService, useValue: teamServiceSpy },
            ],
        });
    });

    it('should alert server that player is leaving game pages', () => {
        gameManagerServiceSpy.resetManager.and.callThrough();
        timerServiceSpy.removeTimerListeners.and.callThrough();
        const canActivatePage = TestBed.runInInjectionContext(
            () =>
                leaveRoomGuard({}, {} as ActivatedRouteSnapshot, {} as RouterStateSnapshot, { url: PageUrl.HOME } as RouterStateSnapshot) as boolean,
        );
        expect(gameManagerServiceSpy.resetManager).toHaveBeenCalled();
        expect(timerServiceSpy.removeTimerListeners).toHaveBeenCalled();
        expect(canActivatePage).toBe(true);
    });
});
