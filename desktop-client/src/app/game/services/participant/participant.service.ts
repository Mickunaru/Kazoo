import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SNACK_CLOSE_ICON_ACTION } from '@app/constants/snack-bar-constants';
import { PageUrl } from '@app/enum/page-url';
import { PLAYER_BANNED_MESSAGE } from '@app/game/constants/banned-message';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { PlayerDto } from '@common/interfaces/playerDto';
import { RoomEvent } from '@common/socket-events/room-event';

@Injectable({
    providedIn: 'root',
})
export class ParticipantService {
    participants: PlayerDto[] = [];

    constructor(
        private webSocketService: WebsocketService,
        private readonly router: Router,
        private readonly snackBar: MatSnackBar,
    ) {}

    initializeParticipantsListener() {
        this.setupParticipantsListListener();
        this.setupParticipantsBanListener();
        this.updateParticipants();
    }

    removeParticipantsListener() {
        this.webSocketService.removeAllListeners(RoomEvent.UPDATE_PARTICIPANT_LIST);
        this.webSocketService.removeAllListeners(RoomEvent.BAN);
    }

    removeParticipant(playerName: string) {
        this.webSocketService.send(RoomEvent.BAN, playerName);
    }

    clearParticipants() {
        this.participants = [];
    }

    private updateParticipants() {
        this.webSocketService.send(RoomEvent.UPDATE_PARTICIPANT_LIST);
    }

    private setupParticipantsListListener() {
        this.webSocketService.on(RoomEvent.UPDATE_PARTICIPANT_LIST, (participants?: PlayerDto[]) => {
            if (participants) this.participants = participants;
        });
    }

    private setupParticipantsBanListener() {
        this.webSocketService.on(RoomEvent.BAN, () => {
            this.router.navigate([`/${PageUrl.APP_PREFIX}/${PageUrl.HOME}`]);
            this.snackBar.open(PLAYER_BANNED_MESSAGE, SNACK_CLOSE_ICON_ACTION);
        });
    }
}
