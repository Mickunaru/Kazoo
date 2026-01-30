import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AudioPlayerComponent } from './audio-player.component';

describe('AudioPlayerComponent', () => {
    let component: AudioPlayerComponent;
    let fixture: ComponentFixture<AudioPlayerComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AudioPlayerComponent],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(AudioPlayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
