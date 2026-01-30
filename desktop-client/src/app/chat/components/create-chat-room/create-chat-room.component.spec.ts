import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatService } from '@app/chat/services/chat.service';
import { AppMaterialModule } from '@app/modules/material.module';
import { ChatRoomDto } from '@common/interfaces/chat-room';
import { BehaviorSubject } from 'rxjs';
import { CreateChatRoomComponent } from './create-chat-room.component';

describe('CreateChatRoomComponent', () => {
    let component: CreateChatRoomComponent;
    let fixture: ComponentFixture<CreateChatRoomComponent>;

    let chatServiceSpy: jasmine.SpyObj<ChatService>;

    beforeEach(() => {
        chatServiceSpy = jasmine.createSpyObj<ChatService>(
            'ChatService',
            ['sendMessage', 'loadChatHistory', 'availableRooms$', 'currentRoom$'],
            ['joinedRooms', 'messages'],
        );
        chatServiceSpy.joinedRooms = [];
        chatServiceSpy.availableRooms$ = new BehaviorSubject<ChatRoomDto[]>([]);
        chatServiceSpy.messages = [];

        TestBed.configureTestingModule({
            declarations: [CreateChatRoomComponent],
            imports: [AppMaterialModule, FormsModule, BrowserAnimationsModule],
            providers: [{ provide: ChatService, useValue: chatServiceSpy }],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(CreateChatRoomComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
