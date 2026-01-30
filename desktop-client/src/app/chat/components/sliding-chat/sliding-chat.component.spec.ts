import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatService } from '@app/chat/services/chat.service';
import { SlidingChatComponent } from './sliding-chat.component';

describe('SlidingChatComponent', () => {
    let component: SlidingChatComponent;
    let fixture: ComponentFixture<SlidingChatComponent>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;

    beforeEach(() => {
        chatServiceSpy = jasmine.createSpyObj('ChatService', ['isChatVisible']);

        TestBed.configureTestingModule({
            declarations: [SlidingChatComponent],
            providers: [{ provide: ChatService, useValue: chatServiceSpy }],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(SlidingChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
