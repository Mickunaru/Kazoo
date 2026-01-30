import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GameJoinErrorMessage } from '@app/constants/error-message';
import { RoomIdForm } from '@app/home/interfaces/join-forms';
import { JoinGameService } from '@app/home/services/join-game/join-game.service';
import { RoomService } from '@app/home/services/room/room.service';

@Component({
    selector: 'app-join-game',
    templateUrl: './join-game.component.html',
    styleUrls: ['./join-game.component.scss'],
})
export class JoinGameComponent {
    idForm: FormGroup<RoomIdForm> = new FormGroup<RoomIdForm>({
        id: new FormControl<string>('', {
            validators: [Validators.required],
            asyncValidators: [this.joinGameService.roomIdValidator.bind(this)],
            updateOn: 'submit',
            nonNullable: true,
        }),
    });
    isProcessing = false;

    GameJoinErrorMessageEnum = GameJoinErrorMessage;

    constructor(
        private readonly roomService: RoomService,
        private readonly joinGameService: JoinGameService,
    ) {}

    async joinGame() {
        this.isProcessing = true;
        await this.joinGameService.roomIdValidator(this.idForm.controls.id);
        if (this.idForm.valid) {
            await this.roomService.playerJoinRoom(this.idForm.controls.id.value.trim());
        }
        this.isProcessing = false;
    }
}
