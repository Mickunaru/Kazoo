import { Injectable } from '@angular/core';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { ActiveGame, NewPlayerCount, NewRoomState } from '@common/interfaces/active-game';
import { HomeEvent } from '@common/socket-events/home-event';

@Injectable({
    providedIn: 'root',
})
export class HomeLobbyService {
    activeGames: ActiveGame[] = [];
    constructor(private readonly socketService: WebsocketService) {}

    joinHomeLobby() {
        this.activeGames = [];
        this.setupUpdateGameListListener();
        this.setupPlayerCountListener();
        this.setupRemoveGameListener();
        this.setupUpdateRoomStateListener();

        this.socketService.send(HomeEvent.JOIN_HOME_LOBBY);
    }

    leaveHomeLobby() {
        this.socketService.removeAllListeners(HomeEvent.UPDATE_GAME_LIST);
        this.socketService.removeAllListeners(HomeEvent.UPDATE_PLAYER_COUNT);
        this.socketService.removeAllListeners(HomeEvent.UPDATE_ROOM_STATE);
        this.socketService.removeAllListeners(HomeEvent.REMOVE_GAME);
        this.socketService.send(HomeEvent.LEAVE_HOME_LOBBY);
        this.activeGames = [];
    }

    private setupUpdateGameListListener() {
        this.socketService.on(HomeEvent.UPDATE_GAME_LIST, (activeGames?: ActiveGame[]) => {
            if (activeGames) this.activeGames = this.activeGames.concat(activeGames);
        });
    }

    private setupPlayerCountListener() {
        this.socketService.on(HomeEvent.UPDATE_PLAYER_COUNT, (playerCountChange?: NewPlayerCount) => {
            if (!playerCountChange) return;
            const changedGame = this.activeGames.find((activeGame) => activeGame.roomId === playerCountChange.roomId);
            if (!changedGame) return;

            changedGame.playerCount += playerCountChange.playerCount;
        });
    }

    private setupRemoveGameListener() {
        this.socketService.on(HomeEvent.REMOVE_GAME, (roomId?: string) => {
            if (!roomId) return;
            roomId = roomId.toString();

            this.activeGames = this.activeGames.filter((activeGame) => activeGame.roomId !== roomId);
        });
    }

    private setupUpdateRoomStateListener() {
        this.socketService.on(HomeEvent.UPDATE_ROOM_STATE, (newRoomState?: NewRoomState) => {
            if (!newRoomState) return;
            const changedGame = this.activeGames.find((activeGame) => activeGame.roomId === newRoomState.roomId);
            if (!changedGame) return;

            changedGame.roomState = newRoomState.roomState;
        });
    }
}
