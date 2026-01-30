import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { RoomService } from './room.service';

describe('RoomService', () => {
    let service: RoomService;
    let httpTestingController: HttpTestingController;
    let webSocketServiceSpy: jasmine.SpyObj<WebsocketService>;
    let router: jasmine.SpyObj<Router>;
    beforeEach(() => {
        router = jasmine.createSpyObj('Router', ['navigate']);
        webSocketServiceSpy = jasmine.createSpyObj('WebsocketService', ['connect', 'send', 'sendWithAck']);
        TestBed.configureTestingModule({
            providers: [
                { provide: WebsocketService, useValue: webSocketServiceSpy },
                { provide: Router, useValue: router },
            ],
            imports: [HttpClientTestingModule],
        });

        service = TestBed.inject(RoomService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    afterEach(() => {
        httpTestingController.verify();
    });
});
