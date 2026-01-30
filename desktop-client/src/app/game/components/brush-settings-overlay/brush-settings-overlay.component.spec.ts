import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrushSettingsOverlayComponent } from './brush-settings-overlay.component';

describe('BrushSettingsOverlay', () => {
    let component: BrushSettingsOverlayComponent;
    let fixture: ComponentFixture<BrushSettingsOverlayComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BrushSettingsOverlayComponent],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(BrushSettingsOverlayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
