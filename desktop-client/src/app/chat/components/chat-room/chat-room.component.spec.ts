import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatService } from '@app/chat/services/chat.service';
import { TEXT_MOCK } from '@app/constants/test-utils';
import { AppMaterialModule } from '@app/modules/material.module';
import { MessageType } from '@common/interfaces/message';
import { BehaviorSubject } from 'rxjs';
import { ChatRoomComponent } from './chat-room.component';

describe('ChatRoomComponent', () => {
    let component: ChatRoomComponent;
    let fixture: ComponentFixture<ChatRoomComponent>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;

    beforeEach(() => {
        chatServiceSpy = jasmine.createSpyObj('ChatService', [
            'sendMessage',
            'loadChatHistory',
            'sendSoundboardMessage',
            'currentRoom$',
            'isLoading$',
        ]);
        chatServiceSpy.isLoading$ = new BehaviorSubject<boolean>(true);

        TestBed.configureTestingModule({
            declarations: [ChatRoomComponent],
            providers: [{ provide: ChatService, useValue: chatServiceSpy }],
            imports: [HttpClientTestingModule, AppMaterialModule, BrowserAnimationsModule, FormsModule],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(ChatRoomComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('sendMessage() should send message and add it to messages array', () => {
        component.inputText = TEXT_MOCK;
        component.sendMessage();

        expect(chatServiceSpy.sendMessage).toHaveBeenCalledOnceWith(TEXT_MOCK, MessageType.TEXT);
        expect(component.inputText).toBe('');
    });

    it('sendMessage() should not send message if input text is empty', () => {
        component.inputText = '';
        component.sendMessage();
        expect(chatServiceSpy.sendMessage).not.toHaveBeenCalled();
    });
});
