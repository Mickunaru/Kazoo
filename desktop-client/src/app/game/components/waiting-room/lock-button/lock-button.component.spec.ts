import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomService } from '@app/home/services/room/room.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { LockButtonComponent } from './lock-button.component';

describe('LockButtonComponent', () => {
    let component: LockButtonComponent;
    let fixture: ComponentFixture<LockButtonComponent>;
    let webSocketServiceStub: jasmine.SpyObj<WebsocketService>;
    let roomServiceStub: jasmine.SpyObj<RoomService>;

    beforeEach(() => {
        webSocketServiceStub = jasmine.createSpyObj('WebsocketService', ['send', 'on', 'removeAllListeners']);
        roomServiceStub = jasmine.createSpyObj('RoomService', ['']);
        TestBed.configureTestingModule({
            declarations: [LockButtonComponent],
            providers: [
                { provide: WebsocketService, useValue: webSocketServiceStub },
                { provide: RoomService, useValue: roomServiceStub },
            ],
        });
        fixture = TestBed.createComponent(LockButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
