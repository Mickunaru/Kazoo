import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ACKNOWLEDGE_TEXT, StartGameErrorMessage } from '@app/constants/error-message';
import { RoomService } from '@app/home/services/room/room.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { StartGameStatus } from '@common/enum/start-game-status';
import { RoomEvent } from '@common/socket-events/room-event';

@Component({
    selector: 'app-start-game-button',
    templateUrl: './start-game-button.component.html',
    styleUrls: ['./start-game-button.component.scss'],
})
export class StartGameButtonComponent {
    @Input() isDisabled: boolean;

    // eslint-disable-next-line max-params
    constructor(
        private readonly webSocketService: WebsocketService,
        readonly roomService: RoomService,
        private readonly snackBar: MatSnackBar,
    ) {}

    async startGame() {
        const result = await this.webSocketService.sendWithAck<undefined, StartGameStatus>(RoomEvent.START_GAME);
        switch (result) {
            case StartGameStatus.NOT_ENOUGH_PLAYERS:
                this.snackBar.open(StartGameErrorMessage.NOT_ENOUGH_PLAYERS, ACKNOWLEDGE_TEXT);
                break;
            case StartGameStatus.NOT_ENOUGH_TEAMS:
                this.snackBar.open(StartGameErrorMessage.NOT_ENOUGH_TEAMS, ACKNOWLEDGE_TEXT);
                break;
            case StartGameStatus.UNLOCKED:
                this.snackBar.open(StartGameErrorMessage.UNLOCKED, ACKNOWLEDGE_TEXT);
                break;
            case StartGameStatus.PLAYER_HAS_NO_TEAM:
                this.snackBar.open(StartGameErrorMessage.PLAYER_HAS_NO_TEAM, ACKNOWLEDGE_TEXT);
                break;
            case StartGameStatus.NOT_ENOUGH_PLAYERS_PER_TEAM:
                this.snackBar.open(StartGameErrorMessage.NOT_ENOUGH_PLAYERS_PER_TEAM, ACKNOWLEDGE_TEXT);
                break;
        }
    }
}
