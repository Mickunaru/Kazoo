import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AppMaterialModule } from '@app/modules/material.module';
import { of } from 'rxjs';
import { PowerUpDisplayComponent } from './power-up-display.component';

describe('PowerUpDisplayComponent', () => {
    let component: PowerUpDisplayComponent;
    let fixture: ComponentFixture<PowerUpDisplayComponent>;

    beforeEach(() => {
        const mockAngularFireAuth = {
            authState: of(null),
        };
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, AppMaterialModule],
            declarations: [PowerUpDisplayComponent],
            providers: [{ provide: AngularFireAuth, useValue: mockAngularFireAuth }],
        });
        fixture = TestBed.createComponent(PowerUpDisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
