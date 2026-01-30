import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ParticipantService } from '@app/game/services/participant/participant.service';
import { TeamService } from '@app/game/services/team/team.service';
import { RoomService } from '@app/home/services/room/room.service';
import { PlayerListComponent } from './player-list.component';

describe('PlayerListComponent', () => {
    let component: PlayerListComponent;
    let fixture: ComponentFixture<PlayerListComponent>;
    let participantsServiceStub: jasmine.SpyObj<ParticipantService>;
    let roomServiceStub: jasmine.SpyObj<RoomService>;
    let teamServiceStub: jasmine.SpyObj<TeamService>;

    beforeEach(() => {
        teamServiceStub = jasmine.createSpyObj('TeamService', ['']);
        participantsServiceStub = jasmine.createSpyObj('ParticipantService', [
            'clearParticipants',
            'initializeParticipantsListener',
            'removeParticipantsListener',
        ]);
        roomServiceStub = jasmine.createSpyObj('RoomService', ['']);
        TestBed.configureTestingModule({
            declarations: [PlayerListComponent],
            providers: [
                { provide: ParticipantService, useValue: participantsServiceStub },
                { provide: RoomService, useValue: roomServiceStub },
                { provide: TeamService, useValue: teamServiceStub },
            ],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [HttpClientModule],
        });
        fixture = TestBed.createComponent(PlayerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
