import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PARTICIPANT_ARRAY_MOCK } from '@app/constants/test-utils';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { RoomEvent } from '@common/socket-events/room-event';
import { ParticipantService } from './participant.service';

describe('ParticipantServiceService', () => {
    let service: ParticipantService;
    let webSocketServiceSpy: jasmine.SpyObj<WebsocketService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        webSocketServiceSpy = jasmine.createSpyObj('WebsocketService', ['on', 'send']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        TestBed.configureTestingModule({
            providers: [
                { provide: WebsocketService, useValue: webSocketServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
            ],
        });

        service = TestBed.inject(ParticipantService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize participants', () => {
        webSocketServiceSpy.on.and.callFake(<T>(event: string, callback: (value?: T) => void) => {
            if (RoomEvent.UPDATE_PARTICIPANT_LIST === event) {
                callback(PARTICIPANT_ARRAY_MOCK as T);
            }
        });
        service.initializeParticipantsListener();
        expect(webSocketServiceSpy.on).toHaveBeenCalled();
        expect(service.participants).toEqual(PARTICIPANT_ARRAY_MOCK);
    });

    it('should ban participant', () => {
        webSocketServiceSpy.on.and.callFake(<T>(event: string, callback: (value?: T) => void) => {
            if (RoomEvent.BAN === event) {
                callback();
            }
        });
        routerSpy.navigate.and.stub();
        service.initializeParticipantsListener();
        expect(routerSpy.navigate).toHaveBeenCalled();
    });

    it('should remove participant', () => {
        const playerId = PARTICIPANT_ARRAY_MOCK[0].id;
        service.removeParticipant(playerId);
        expect(webSocketServiceSpy.send).toHaveBeenCalledWith(RoomEvent.BAN, playerId);
    });

    it('should clear participants', () => {
        service.participants = PARTICIPANT_ARRAY_MOCK;
        service.clearParticipants();
        expect(service.participants).toEqual([]);
    });
});
