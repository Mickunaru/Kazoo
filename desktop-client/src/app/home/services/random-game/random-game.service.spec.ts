import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RandomGameService } from '@app/home/services/random-game/random-game.service';
import { RoomService } from '@app/home/services/room/room.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { GAME_AVAILABILITY_ENDPOINT } from '@common/constants/endpoint-constants';

describe('RandomGameService', () => {
    let service: RandomGameService;
    let routerSpy: jasmine.SpyObj<Router>;
    let roomServiceSpy: jasmine.SpyObj<RoomService>;
    let socketServiceSpy: jasmine.SpyObj<WebsocketService>;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        roomServiceSpy = jasmine.createSpyObj('RoomService', ['createRoomAndJoin']);
        socketServiceSpy = jasmine.createSpyObj('WebsocketService', ['connect', 'connect']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: WebsocketService, useValue: socketServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: RoomService, useValue: roomServiceSpy },
            ],
        });
        service = TestBed.inject(RandomGameService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should check if question bank has enough questions', () => {
        const QUESTION_NUMBER = 5;
        service.hasEnoughQuestionForRandomGame(QUESTION_NUMBER).subscribe((value) => {
            expect(value).toBeTrue();
        });
        const req = httpTestingController.expectOne(`${service['baseUrl']}/${GAME_AVAILABILITY_ENDPOINT}?count=5`);
        expect(req.request.method).toEqual('GET');
        req.flush(true);
    });
});
