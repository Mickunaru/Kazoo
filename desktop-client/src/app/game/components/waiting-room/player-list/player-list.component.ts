import { Component, OnDestroy, OnInit } from '@angular/core';
import { ParticipantService } from '@app/game/services/participant/participant.service';
import { TeamService } from '@app/game/services/team/team.service';
import { TimerService } from '@app/game/services/timer/timer.service';
import { RoomService } from '@app/home/services/room/room.service';

@Component({
    selector: 'app-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent implements OnInit, OnDestroy {
    // eslint-disable-next-line max-params
    constructor(
        readonly participantService: ParticipantService,
        readonly roomService: RoomService,
        readonly teamService: TeamService,
        readonly timerService: TimerService,
    ) {}

    ngOnInit() {
        this.participantService.clearParticipants();
        this.participantService.initializeParticipantsListener();
    }

    ngOnDestroy() {
        this.participantService.removeParticipantsListener();
    }
}
