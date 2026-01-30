import { Component } from '@angular/core';
import { ChatService } from '@app/chat/services/chat.service';

@Component({
    selector: 'app-sliding-chat',
    templateUrl: './sliding-chat.component.html',
    styleUrls: ['./sliding-chat.component.scss'],
})
export class SlidingChatComponent {
    constructor(protected readonly chatService: ChatService) {}

    toggleChat(): void {
        this.chatService.isChatVisible = !this.chatService.isChatVisible;
    }
}
