import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlidingChatComponent } from '@app/chat/components/sliding-chat/sliding-chat.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { ChatRoomListComponent } from './components/chat-room-list/chat-room-list.component';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
import { ChatComponent } from './components/chat.component';
import { CreateChatRoomComponent } from './components/create-chat-room/create-chat-room.component';
import { AudioRecorderComponent } from './components/audio-recorder/audio-recorder.component';
import { AudioPlayerComponent } from './components/audio-player/audio-player.component';

@NgModule({
    declarations: [
        ChatComponent,
        SlidingChatComponent,
        ChatRoomComponent,
        ChatRoomListComponent,
        CreateChatRoomComponent,
        AudioRecorderComponent,
        AudioPlayerComponent,
    ],
    imports: [AppMaterialModule, CommonModule, FormsModule],
    exports: [SlidingChatComponent],
})
export class ChatModule {}
