import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { ChatService } from './chat.service';
import { IpcService } from './ipc/ipc.service';

describe('ChatService', () => {
    let service: ChatService;
    let webSocketServiceSpy: jasmine.SpyObj<WebsocketService>;
    let userAuthServiceSpy: jasmine.SpyObj<UserAuthService>;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        webSocketServiceSpy = jasmine.createSpyObj('WebsocketService', ['on', 'send', 'connect', 'sendWithAck']);
        userAuthServiceSpy = jasmine.createSpyObj('UserAuthService', [
            'curUser',
            'login',
            'signUp',
            'signOutAndRedirect',
            'signOut',
            'updateUsername',
        ]);
        webSocketServiceSpy.sendWithAck.and.returnValue(Promise.resolve([]));
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ChatService,
                { provide: WebsocketService, useValue: webSocketServiceSpy },
                { provide: IpcService, useValue: webSocketServiceSpy },
                { provide: UserAuthService, useValue: userAuthServiceSpy },
            ],
        });
        service = TestBed.inject(ChatService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
