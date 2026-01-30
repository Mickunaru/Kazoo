import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { FriendService } from './friend.service';

describe('FriendService', () => {
    let service: FriendService;
    let websocketServiceSpy: jasmine.SpyObj<WebsocketService>;

    beforeEach(() => {
        websocketServiceSpy = jasmine.createSpyObj('WebsocketService', ['on', 'sendWithAck', 'send', 'removeAllListeners']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: WebsocketService, useValue: websocketServiceSpy }],
        });
        service = TestBed.inject(FriendService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
