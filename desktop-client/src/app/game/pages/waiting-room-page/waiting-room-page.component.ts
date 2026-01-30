import { Component, OnDestroy, OnInit } from '@angular/core';
import { TimerService } from '@app/game/services/timer/timer.service';
import { RoomService } from '@app/home/services/room/room.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-test-game-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnInit, OnDestroy {
    timerSubscription: Subscription;

    constructor(
        readonly timerService: TimerService,
        readonly roomService: RoomService,
    ) {}

    ngOnInit() {
        this.timerSubscription = this.timerService.timerEnded.subscribe(() => {
            this.roomService.navigateToGamePage();
        });
    }

    ngOnDestroy() {
        this.timerSubscription?.unsubscribe();
    }

    copyRoomIdToClipboard() {
        navigator.clipboard.writeText(this.roomService.roomId);
    }
}
