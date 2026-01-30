import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RoomService } from '@app/home/services/room/room.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { RoomEvent } from '@common/socket-events/room-event';

@Component({
    selector: 'app-lock-button',
    templateUrl: './lock-button.component.html',
    styleUrls: ['./lock-button.component.scss'],
})
export class LockButtonComponent implements OnInit, OnDestroy {
    @Input() isDisabled: boolean;

    constructor(
        readonly roomService: RoomService,
        private readonly webSocketService: WebsocketService,
    ) {}

    ngOnInit() {
        this.setupLockHandler();
    }

    ngOnDestroy() {
        this.webSocketService.removeAllListeners(RoomEvent.SWITCH_LOCK);
    }

    lockRoom() {
        this.webSocketService.send(RoomEvent.SWITCH_LOCK);
    }

    private setupLockHandler() {
        this.webSocketService.on(RoomEvent.SWITCH_LOCK, (lockStatus?: boolean) => {
            if (lockStatus !== undefined) this.roomService.isLocked = lockStatus;
        });
    }
}
