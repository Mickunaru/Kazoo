import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ChatRoomCreationError } from '@app/chat/chat.error';
import { ChatService } from '@app/chat/services/chat.service';

@Component({
    selector: 'app-create-chat-room',
    templateUrl: './create-chat-room.component.html',
    styleUrls: ['./create-chat-room.component.scss'],
})
export class CreateChatRoomComponent implements AfterViewInit {
    @ViewChild('name') nameInput!: ElementRef;
    protected error: string | null = null;

    constructor(protected readonly chatService: ChatService) {}

    ngAfterViewInit() {
        setTimeout(() => {
            this.nameInput.nativeElement.focus();
        }, 0); // without this, the auto focus breaks material's rendering
    }

    async createRoom(name: string) {
        try {
            this.error = null;
            if (name.includes('#')) {
                throw new ChatRoomCreationError('Room name cannot contain #');
            }
            await this.chatService.createRoom(name);
        } catch (e) {
            if (e instanceof ChatRoomCreationError) {
                this.error = e.message;
            }
        }
    }

    blockHash(event: KeyboardEvent): void {
        if (event.key === '#') {
            event.preventDefault();
        }
    }
}
