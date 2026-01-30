import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '@app/modules/material.module';
import { JoinGameService } from '@app/home/services/join-game/join-game.service';
import { RoomService } from '@app/home/services/room/room.service';
import { JoinGameComponent } from './join-game.component';

describe('JoinGameComponent', () => {
    let component: JoinGameComponent;
    let fixture: ComponentFixture<JoinGameComponent>;
    let joinGameServiceSpy: jasmine.SpyObj<JoinGameService>;
    let roomServiceSpy: jasmine.SpyObj<RoomService>;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        roomServiceSpy = jasmine.createSpyObj('RoomService', ['playerJoinRoom']);
        joinGameServiceSpy = jasmine.createSpyObj('JoinGameService', ['roomIdValidator']);
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        joinGameServiceSpy.roomIdValidator.and.resolveTo();

        TestBed.configureTestingModule({
            declarations: [JoinGameComponent],
            imports: [AppMaterialModule, BrowserAnimationsModule],
            providers: [
                { provide: RoomService, useValue: roomServiceSpy },
                { provide: JoinGameService, useValue: joinGameServiceSpy },
                { provide: MatDialog, useValue: matDialogSpy },
            ],
        });
        fixture = TestBed.createComponent(JoinGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open dialog when joinGame is called with valid idForm', fakeAsync(() => {
        Object.defineProperty(component.idForm, 'valid', { value: true });
        component.joinGame();
        tick();
        expect(roomServiceSpy.playerJoinRoom).toHaveBeenCalled();
    }));

    it('should not open dialog when joinGame is called with invalid idForm', fakeAsync(() => {
        Object.defineProperty(component.idForm, 'valid', { value: false });

        component.joinGame();
        tick();
        expect(roomServiceSpy.playerJoinRoom).not.toHaveBeenCalled();
    }));
});
