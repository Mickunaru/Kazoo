import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { RoomService } from '@app/home/services/room/room.service';
import { RoomAccessStatus } from '@common/enum/room-access-status';
import { JoinGameService } from './join-game.service';

describe('JoinGameService', () => {
    let service: JoinGameService;
    let roomServiceSpy: jasmine.SpyObj<RoomService>;

    beforeEach(() => {
        roomServiceSpy = jasmine.createSpyObj('RoomService', ['canPlayerJoinRoom']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: RoomService, useValue: roomServiceSpy }],
        });
        service = TestBed.inject(JoinGameService);
    });

    it('should validate roomId', async () => {
        roomServiceSpy.canPlayerJoinRoom.and.resolveTo(RoomAccessStatus.OPENED);
        const result = await service.roomIdValidator({ value: 'roomId' } as AbstractControl<string, string>);
        expect(result).toBeNull();
    });

    it('should set roomDoesNotExist error if room is hidden', async () => {
        roomServiceSpy.canPlayerJoinRoom.and.resolveTo(RoomAccessStatus.HIDDEN);
        const result = await service.roomIdValidator({ value: 'roomId' } as AbstractControl<string, string>);
        expect(result).toEqual({ roomAccessLocked: true });
    });

    it('should set roomIsLocked error if room is locked', async () => {
        roomServiceSpy.canPlayerJoinRoom.and.resolveTo(RoomAccessStatus.LOCKED);
        const result = await service.roomIdValidator({ value: 'roomId' } as AbstractControl<string, string>);
        expect(result).toEqual({ roomIsLocked: true });
    });

    it('should set roomAccessLocked error if user does not have access', async () => {
        roomServiceSpy.canPlayerJoinRoom.and.resolveTo(RoomAccessStatus.DELETED);
        const result = await service.roomIdValidator({ value: 'roomId' } as AbstractControl<string, string>);
        expect(result).toEqual({ roomDoesNotExist: true });
    });

    it('should set otherError error on unexpected error', async () => {
        roomServiceSpy.canPlayerJoinRoom.and.rejectWith(new HttpErrorResponse({ status: HttpStatusCode.InternalServerError }));
        const result = await service.roomIdValidator({ value: 'roomId' } as AbstractControl<string, string>);
        expect(result).toEqual({ otherError: true });
    });
});
