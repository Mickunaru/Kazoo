import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { INTERACTIVE_PLAYER_LIST_COLUMNS } from '@app/game/constants/displayed-columns';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { PlayerInfo, PlayerStatus } from '@common/interfaces/player-info';
import { RoomEvent } from '@common/socket-events/room-event';

@Component({
    selector: 'app-interactive-player-list',
    templateUrl: './interactive-player-list.component.html',
    styleUrls: ['./interactive-player-list.component.scss'],
})
export class InteractivePlayerListComponent implements OnInit, OnDestroy {
    dataSource: MatTableDataSource<PlayerInfo>;
    displayedColumns = INTERACTIVE_PLAYER_LIST_COLUMNS;

    constructor(private readonly webSocketService: WebsocketService) {}

    ngOnInit(): void {
        this.setupPlayerInfoListener();
    }

    ngOnDestroy() {
        this.webSocketService.removeAllListeners(RoomEvent.UPDATE_PLAYERS_STATS);
    }

    statusToCssClass(status: PlayerStatus): string {
        switch (status) {
            case PlayerStatus.Left:
            case PlayerStatus.Eliminated:
                return 'player-left';
            case PlayerStatus.Pending:
                return 'player-pending';
            case PlayerStatus.Submitted:
                return 'player-submitted';
        }
    }

    private setupPlayerInfoListener() {
        this.webSocketService.on(RoomEvent.UPDATE_PLAYERS_STATS, (playersStats?: PlayerInfo[]) => {
            this.dataSource = new MatTableDataSource(playersStats ?? []);
        });
        this.webSocketService.send(RoomEvent.UPDATE_PLAYERS_STATS);
    }
}
