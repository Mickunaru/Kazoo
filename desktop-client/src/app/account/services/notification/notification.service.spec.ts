import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
    let service: NotificationService;
    let websocketServiceSpy: jasmine.SpyObj<WebsocketService>;

    beforeEach(() => {
        websocketServiceSpy = jasmine.createSpyObj('WebsocketService', ['on', 'sendWithAck', 'send', 'removeAllListeners']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: WebsocketService, useValue: websocketServiceSpy }],
        });
        service = TestBed.inject(NotificationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
