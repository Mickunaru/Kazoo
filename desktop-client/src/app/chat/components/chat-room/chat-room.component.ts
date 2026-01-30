import { Component, OnDestroy, OnInit } from '@angular/core';
import { SOUNDBOARD_ELEMENTS, SoundboardElement } from '@app/chat/chat.const';
import { ChatService } from '@app/chat/services/chat.service';
import { MessageType } from '@common/interfaces/message';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-chat-room',
    templateUrl: './chat-room.component.html',
    styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnDestroy, OnInit {
    inputText: string = '';
    messageTypeEnum = MessageType;

    soundboardList = SOUNDBOARD_ELEMENTS;
    isLoading = true;

    private loadSubscription: Subscription;

    constructor(protected readonly chatService: ChatService) {}

    ngOnInit(): void {
        this.loadSubscription = this.chatService.isLoading$.subscribe((isLoading) => {
            this.isLoading = isLoading;
            if (!isLoading) {
                setTimeout(this.scrollToBottom, 0); // need to wait for the DOM to be updated
            }
        });
    }

    sendMessage(event?: Event): void {
        event?.preventDefault();
        if (!this.inputText.trim()) return;
        this.chatService.sendMessage(this.inputText, MessageType.TEXT);
        this.inputText = '';
    }

    sendSoundboardMessage(soundboard: SoundboardElement): void {
        this.chatService.sendSoundboardMessage(soundboard);
    }

    ngOnDestroy(): void {
        if (this.loadSubscription) {
            this.loadSubscription.unsubscribe();
        }
    }

    private scrollToBottom(): void {
        const chatContainer = document.querySelector('.chat-room-space');
        if (chatContainer) {
            chatContainer.scrollTo({
                top: chatContainer.scrollHeight,
            });
        }
    }
}
