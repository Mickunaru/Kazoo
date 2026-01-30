import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AppMaterialModule } from '@app/modules/material.module';
import { of } from 'rxjs';
import { VanityDisplayComponent } from './vanity-display.component';

describe('VanityDisplayComponent', () => {
    let component: VanityDisplayComponent;
    let fixture: ComponentFixture<VanityDisplayComponent>;

    beforeEach(() => {
        const mockAngularFireAuth = {
            authState: of(null),
        };
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, AppMaterialModule],
            declarations: [VanityDisplayComponent],
            providers: [{ provide: AngularFireAuth, useValue: mockAngularFireAuth }],
        });
        fixture = TestBed.createComponent(VanityDisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
