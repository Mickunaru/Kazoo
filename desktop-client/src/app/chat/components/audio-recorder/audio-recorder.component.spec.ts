import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ChatService } from '@app/chat/services/chat.service';
import { AudioRecorderComponent } from './audio-recorder.component';

describe('AudioRecorderComponent', () => {
    let component: AudioRecorderComponent;
    let fixture: ComponentFixture<AudioRecorderComponent>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;

    beforeEach(() => {
        chatServiceSpy = jasmine.createSpyObj('ChatServics', ['sendMessage']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [AudioRecorderComponent],
            providers: [{ provide: ChatService, useValue: chatServiceSpy }],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(AudioRecorderComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
