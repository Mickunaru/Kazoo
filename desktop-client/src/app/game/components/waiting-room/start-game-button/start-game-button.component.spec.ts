import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ParticipantService } from '@app/game/services/participant/participant.service';
import { RoomService } from '@app/home/services/room/room.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { StartGameButtonComponent } from './start-game-button.component';

describe('StartGameButtonComponent', () => {
    let component: StartGameButtonComponent;
    let fixture: ComponentFixture<StartGameButtonComponent>;
    let participantsServiceStub: jasmine.SpyObj<ParticipantService>;
    let webSocketServiceStub: jasmine.SpyObj<WebsocketService>;
    let roomServiceStub: jasmine.SpyObj<RoomService>;
    let snackBarStub: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        participantsServiceStub = jasmine.createSpyObj('ParticipantService', { participants: [] });
        webSocketServiceStub = jasmine.createSpyObj('WebsocketService', ['send']);
        roomServiceStub = jasmine.createSpyObj('RoomService', ['']);
        snackBarStub = jasmine.createSpyObj('MatSnackBar', ['open']);
        TestBed.configureTestingModule({
            declarations: [StartGameButtonComponent],
            providers: [
                { provide: ParticipantService, useValue: participantsServiceStub },
                { provide: WebsocketService, useValue: webSocketServiceStub },
                { provide: RoomService, useValue: roomServiceStub },
                { provide: MatSnackBar, useValue: snackBarStub },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(StartGameButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
