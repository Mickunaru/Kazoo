import { Component, OnDestroy } from '@angular/core';
import { CHAT_WINDOW_TITLE } from '@app/chat/chat.const';
import { ChatService } from '@app/chat/services/chat.service';
import { ChatRoomDto } from '@common/interfaces/chat-room';
import { ChatRoomType } from '@common/interfaces/message';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnDestroy {
    protected currentPage: 'create' | 'room' | null = null;
    protected title = CHAT_WINDOW_TITLE;
    protected chatRoomTypeEnum = ChatRoomType;
    protected chatRoomType: ChatRoomType | null = null;
    private subscription: Subscription;

    constructor(protected readonly chatService: ChatService) {
        this.subscription = this.chatService.currentRoom$.subscribe((room) => {
            if (!room) {
                this.currentPage = null;
                this.title = CHAT_WINDOW_TITLE;
                this.chatRoomType = null;
            } else {
                this.title = room.name;
                this.chatRoomType = room.type;
                this.currentPage = 'room';
            }
        });
    }

    back() {
        if (this.currentPage === 'room') {
            this.chatService.changeRoom(null);
        }
        this.currentPage = null;
        this.title = CHAT_WINDOW_TITLE;
        this.chatRoomType = null;
    }

    openCreateRoom() {
        this.currentPage = 'create';
        this.title = 'Nouvelle Salle';
        this.chatRoomType = null;
    }

    roomSelected(room: ChatRoomDto) {
        this.chatService.changeRoom(room);
        this.currentPage = 'room';
        this.title = room.name;
        this.chatRoomType = room.type;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
