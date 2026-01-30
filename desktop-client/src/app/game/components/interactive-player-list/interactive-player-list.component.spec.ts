import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { PlayerStatus } from '@common/interfaces/player-info';
import { InteractivePlayerListComponent } from './interactive-player-list.component';

describe('InteractivePlayerListComponent', () => {
    let component: InteractivePlayerListComponent;
    let fixture: ComponentFixture<InteractivePlayerListComponent>;
    let websocketServiceSpy: jasmine.SpyObj<WebsocketService>;

    beforeEach(() => {
        websocketServiceSpy = jasmine.createSpyObj('WebsocketService', ['on', 'send', 'isSocketConnected', 'removeAllListeners']);
        TestBed.configureTestingModule({
            declarations: [InteractivePlayerListComponent],
            providers: [
                {
                    provide: WebsocketService,
                    useValue: websocketServiceSpy,
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(InteractivePlayerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return "player-left" for PlayerStatus.Left or PlayerStatus.Banned in statusToCssClass', () => {
        const expectedString = 'player-left';
        expect(component.statusToCssClass(PlayerStatus.Left)).toBe(expectedString);
    });

    it('should return "player-pending" for PlayerStatus.Pending in statusToCssClass', () => {
        expect(component.statusToCssClass(PlayerStatus.Pending)).toBe('player-pending');
    });

    it('should return "player-submitted" for PlayerStatus.Submitted in statusToCssClass', () => {
        expect(component.statusToCssClass(PlayerStatus.Submitted)).toBe('player-submitted');
    });
});
