import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ACKNOWLEDGE_TEXT, GameJoinErrorMessage } from '@app/constants/error-message';
import { GameModeNameEnum } from '@app/game/enum/game-mode-name';
import { RoomStateName } from '@app/game/enum/room-state-name';
import { HomeLobbyService } from '@app/home/services/home-lobby/home-lobby.service';
import { RoomService } from '@app/home/services/room/room.service';
import { GameMode } from '@common/enum/game-mode';
import { RoomAccessStatus } from '@common/enum/room-access-status';
import { RoomState } from '@common/enum/room-state';
import { ActiveGame } from '@common/interfaces/active-game';

@Component({
    selector: 'app-game-list',
    templateUrl: './game-list.component.html',
    styleUrls: ['./game-list.component.scss'],
})
export class GameListComponent {
    isProcessing = false;
    constructor(
        readonly homeLobbyService: HomeLobbyService,
        private readonly roomService: RoomService,
        private readonly snackBar: MatSnackBar,
    ) {}

    getGameType(activeGame: ActiveGame) {
        switch (activeGame.gameConfig.gameMode) {
            case GameMode.CLASSIC:
                return GameModeNameEnum.CLASSIC;
            case GameMode.ELIMINATION:
                return GameModeNameEnum.ELIMINATION;
            case GameMode.TEAM:
                return GameModeNameEnum.TEAM;
        }
    }

    getRoomStateName(activeGame: ActiveGame) {
        switch (activeGame.roomState) {
            case RoomState.FINISHED:
                return RoomStateName.FINISHED;
            case RoomState.IN_GAME:
                return RoomStateName.IN_GAME;
            case RoomState.LOCKED:
                return RoomStateName.LOCKED;
            case RoomState.OPEN:
                return RoomStateName.OPEN;
        }
    }

    async joinGame(roomId: string) {
        if (this.isProcessing) return;
        this.isProcessing = true;
        const roomAccessStatus = await this.roomService.canPlayerJoinRoom(roomId);
        this.handleResponse(roomAccessStatus);

        if (roomAccessStatus === RoomAccessStatus.OPENED) await this.roomService.playerJoinRoom(roomId);
        this.isProcessing = false;
    }

    private handleResponse(roomAccessStatus: RoomAccessStatus) {
        switch (roomAccessStatus) {
            case RoomAccessStatus.LOCKED:
                this.snackBar.open(GameJoinErrorMessage.LOCKED, ACKNOWLEDGE_TEXT);
                break;
            case RoomAccessStatus.HIDDEN:
                this.snackBar.open(GameJoinErrorMessage.HIDDEN, ACKNOWLEDGE_TEXT);
                break;
            case RoomAccessStatus.DELETED:
                this.snackBar.open(GameJoinErrorMessage.DELETED, ACKNOWLEDGE_TEXT);
                break;
            case RoomAccessStatus.NOT_ENOUGH_MONEY:
                this.snackBar.open(GameJoinErrorMessage.NOT_ENOUGH_MONEY, ACKNOWLEDGE_TEXT);
                break;
            case RoomAccessStatus.MAX_PLAYER_COUNT_REACHED:
                this.snackBar.open(GameJoinErrorMessage.MAX_PLAYER_COUNT_REACHED, ACKNOWLEDGE_TEXT);
                break;
        }
    }
}
