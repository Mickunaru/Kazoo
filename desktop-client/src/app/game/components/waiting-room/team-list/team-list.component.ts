import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TeamService } from '@app/game/services/team/team.service';
import { RoomService } from '@app/home/services/room/room.service';
import { TEAM_NUMBER_LIMIT } from '@common/constants/team-constants';
import { GameMode } from '@common/enum/game-mode';

@Component({
    selector: 'app-team-list',
    templateUrl: './team-list.component.html',
    styleUrls: ['./team-list.component.scss'],
})
export class TeamListComponent implements OnInit, OnDestroy {
    @Input() isDisabled: boolean;
    teamName: string = '';
    gameModeEnum = GameMode;
    teamNumberLimitConstant = TEAM_NUMBER_LIMIT;

    constructor(
        readonly roomService: RoomService,
        readonly teamService: TeamService,
    ) {}

    ngOnInit() {
        this.teamService.setup();
    }

    async createTeam(teamName: string) {
        if (this.disableTeamCreation()) return;
        await this.teamService.createTeam(teamName.trim());
        this.teamName = '';
    }

    selectTeam(teamName: string) {
        if (this.isDisabled) return;
        if (this.roomService.isGameMaster) return;
        this.teamService.selectTeam(teamName);
    }

    disableTeamCreation() {
        return this.teamService.teams.length >= TEAM_NUMBER_LIMIT || !this.teamName.trim() || this.isDisabled || this.teamName.includes('#');
    }

    blockHash(event: KeyboardEvent): void {
        if (event.key === '#') {
            event.preventDefault();
        }
    }

    ngOnDestroy() {
        this.teamService.removeListeners();
    }
}
