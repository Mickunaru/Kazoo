import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { RoomService } from '@app/home/services/room/room.service';
import { RoomAccessStatus } from '@common/enum/room-access-status';

@Injectable({
    providedIn: 'root',
})
export class JoinGameService {
    constructor(private readonly roomService: RoomService) {}

    async roomIdValidator(control: AbstractControl<string, string>): Promise<ValidationErrors | null> {
        try {
            const roomAccessStatus = await this.roomService.canPlayerJoinRoom(control.value);
            switch (roomAccessStatus) {
                case RoomAccessStatus.OPENED:
                    return null;
                case RoomAccessStatus.LOCKED:
                    return { roomIsLocked: true };
                case RoomAccessStatus.HIDDEN:
                case RoomAccessStatus.FRIEND_ONLY:
                    return { roomAccessLocked: true };
                case RoomAccessStatus.DELETED:
                    return { roomDoesNotExist: true };
                case RoomAccessStatus.NOT_ENOUGH_MONEY:
                    return { notEnoughMoney: true };
                case RoomAccessStatus.MAX_PLAYER_COUNT_REACHED:
                    return { maxPlayerCountReached: true };
            }
        } catch {
            return { otherError: true };
        }
    }
}
