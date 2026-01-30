import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChatService } from '@app/chat/services/chat.service';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { ChatRoomDto } from '@common/interfaces/chat-room';
import { ChatRoomType } from '@common/interfaces/message';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-chat-room-list',
    templateUrl: './chat-room-list.component.html',
    styleUrls: ['./chat-room-list.component.scss'],
})
export class ChatRoomListComponent implements OnDestroy {
    @Output() roomSelected = new EventEmitter<ChatRoomDto>();
    @Output() createRoom = new EventEmitter<void>();

    protected allRooms: ChatRoomDto[];
    protected displayedRooms: ChatRoomDto[];
    protected searchValue: string = '';
    protected readonly chatRoomTypeEnum = ChatRoomType;
    private readonly subscription: Subscription;

    constructor(
        protected readonly chatService: ChatService,
        private readonly dialog: MatDialog,
    ) {
        this.subscription = this.chatService.availableRooms$.subscribe((rooms) => {
            this.allRooms = rooms;
            this.applyFilter();
        });
    }

    selectJoinedRoom(room: ChatRoomDto) {
        this.roomSelected.emit(room);
    }

    applyFilter() {
        this.displayedRooms = this.allRooms.filter((chatRoom: ChatRoomDto) => {
            const input = this.searchValue.trim().toLowerCase();
            return chatRoom.name.trim().toLowerCase().includes(input) || chatRoom.creator.trim().toLowerCase().includes(input);
        });
    }

    async selectNewRoom(room: ChatRoomDto) {
        await this.chatService.joinRoom(room.name);
        this.roomSelected.emit(room);
    }

    leaveRoom(room: string, event: Event) {
        event.stopPropagation();
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Quitter la salle',
                message: `Êtes vous certain de vouloir quitter la salle: '${room}'?`,
                confirmText: 'Quitter',
                cancelText: 'Annuler',
                confirmColor: 'warn',
            },
        });
        dialogRef.afterClosed().subscribe((result: unknown) => {
            if (result) {
                this.chatService.leaveRoom(room);
            }
        });
    }

    deleteRoom(room: string, event: Event) {
        event.stopPropagation();
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Supprimer la salle',
                message: `Êtes vous certain de vouloir supprimer la salle: '${room}'?`,
                confirmText: 'Supprimer',
                cancelText: 'Annuler',
                confirmColor: 'warn',
            },
        });
        dialogRef.afterClosed().subscribe((result: unknown) => {
            if (result) {
                this.chatService.deleteRoom(room);
            }
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
