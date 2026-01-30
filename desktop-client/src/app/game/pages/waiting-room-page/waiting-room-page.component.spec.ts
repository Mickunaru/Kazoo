import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ROOM_ID_MOCK } from '@app/constants/test-utils';
import { TimerService } from '@app/game/services/timer/timer.service';
import { RoomService } from '@app/home/services/room/room.service';
import { Subject } from 'rxjs';
import { WaitingRoomPageComponent } from './waiting-room-page.component';

describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;
    let timerServiceStub: jasmine.SpyObj<TimerService>;
    let roomServiceStub: jasmine.SpyObj<RoomService>;

    beforeEach(() => {
        roomServiceStub = jasmine.createSpyObj('RoomService', ['navigateToGamePage'], { roomId: ROOM_ID_MOCK });
        timerServiceStub = jasmine.createSpyObj('TimerService', [''], { timerEnded: new Subject() });

        TestBed.configureTestingModule({
            declarations: [WaitingRoomPageComponent],
            imports: [HttpClientModule],
            providers: [
                { provide: TimerService, useValue: timerServiceStub },
                { provide: RoomService, useValue: roomServiceStub },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should setup on Init', () => {
        spyOn(timerServiceStub.timerEnded, 'subscribe').and.stub();
        component.ngOnInit();
        expect(timerServiceStub.timerEnded['subscribe']).toHaveBeenCalled();
    });

    it('should navigate after start timer ended', () => {
        roomServiceStub.navigateToGamePage.and.stub();
        component.ngOnInit();
        timerServiceStub.timerEnded.next();
        expect(roomServiceStub.navigateToGamePage).toHaveBeenCalled();
    });

    it('should copy to clipboard', () => {
        spyOn(navigator.clipboard, 'writeText').and.stub();
        component.copyRoomIdToClipboard();
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(roomServiceStub.roomId);
    });
});
