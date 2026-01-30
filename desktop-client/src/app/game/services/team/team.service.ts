import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { TeamCreationResponse } from '@common/enum/team-creation-response';
import { Team, TeamId } from '@common/interfaces/team';
import { RoomEvent } from '@common/socket-events/room-event';
@Injectable({
    providedIn: 'root',
})
export class TeamService {
    teams: Team[] = [];
    teamName: string = '';
    team?: Team;

    constructor(
        private readonly websocketService: WebsocketService,
        private readonly snackBar: MatSnackBar,
    ) {}

    async createTeam(name: string) {
        this.teamName = name;
        const creationResponse = await this.websocketService.sendWithAck<TeamId, TeamCreationResponse>(RoomEvent.CREATE_TEAM, { name });
        switch (creationResponse) {
            case TeamCreationResponse.TEAM_NAME_TAKEN:
                this.snackBar.open("Nom de l'équipe existe déjà.");
                this.teamName = '';
                break;
            case TeamCreationResponse.MAXIMUM_TEAM_LIMIT_REACHED:
                this.snackBar.open("Le nombre maximal d'équipe a été atteint.");
                this.teamName = '';
                break;
            case TeamCreationResponse.TEAM_CREATED:
                break;
        }
    }

    selectTeam(name: string) {
        this.teamName = name;
        this.websocketService.send(RoomEvent.SELECT_TEAM, { name });
    }

    getTeam(teamName: string): Team | undefined {
        return this.teams.find((team) => team.name === teamName);
    }

    setup() {
        this.websocketService.on<Team[]>(RoomEvent.UPDATE_TEAMS, (teams?: Team[]) => {
            if (!teams) return;
            this.teams = teams;
            this.team = this.getTeam(this.teamName);
        });
        this.websocketService.send(RoomEvent.UPDATE_TEAMS);
    }

    removeListeners() {
        this.websocketService.removeAllListeners(RoomEvent.UPDATE_TEAMS);
    }

    resetManager() {
        this.teamName = '';
        this.team = undefined;
        this.teams = [];
        this.removeListeners();
    }
}
