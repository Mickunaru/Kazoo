import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthPageComponent } from './auth-page.component';

describe('AuthPageComponent', () => {
    let component: AuthPageComponent;
    let fixture: ComponentFixture<AuthPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let authSpy: jasmine.SpyObj<AngularFireAuth>;

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        authSpy = jasmine.createSpyObj('AngularFireAuth', [], {
            authState: of(),
        });

        TestBed.configureTestingModule({
            declarations: [AuthPageComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: AngularFireAuth, useValue: authSpy },
            ],
        });
        fixture = TestBed.createComponent(AuthPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
