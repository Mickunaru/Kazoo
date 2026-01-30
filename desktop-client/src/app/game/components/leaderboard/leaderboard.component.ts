import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { LEADERBOARD_COLUMNS } from '@app/game/constants/displayed-columns';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { RoomService } from '@app/home/services/room/room.service';
import { GameMode } from '@common/enum/game-mode';
import { PlayerInfo } from '@common/interfaces/player-info';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
    displayedColumns = LEADERBOARD_COLUMNS;
    dataSource: MatTableDataSource<PlayerInfo>;
    gameModeEnum = GameMode;
    constructor(
        readonly gameStateService: GameStateService,
        readonly roomService: RoomService,
    ) {}

    ngOnInit() {
        this.dataSource = new MatTableDataSource(this.gameStateService.playerInfo);
    }
}
