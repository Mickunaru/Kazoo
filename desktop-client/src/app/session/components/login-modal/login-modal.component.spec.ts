import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { LoginModalComponent } from './login-modal.component';

describe('LoginModalComponent', () => {
    let component: LoginModalComponent;
    let fixture: ComponentFixture<LoginModalComponent>;
    let userAuthServiceSpy: jasmine.SpyObj<UserAuthService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        userAuthServiceSpy = jasmine.createSpyObj('UserAuthService', ['login']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        TestBed.configureTestingModule({
            declarations: [LoginModalComponent],
            providers: [
                { provide: UserAuthService, useValue: userAuthServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(LoginModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
