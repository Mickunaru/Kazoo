import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog } from '@angular/material/dialog';
import { AvatarPickerComponent } from './avatar-picker.component';

describe('AvatarPickerComponent', () => {
    let component: AvatarPickerComponent;
    let fixture: ComponentFixture<AvatarPickerComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let authSpy: jasmine.SpyObj<AngularFireAuth>;
    beforeEach(() => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        authSpy = jasmine.createSpyObj('AngularFireAuth', [
            'signInWithEmailAndPassword',
            'createUserWithEmailAndPassword',
            'signInWithPopup',
            'signOut',
            'currentUser',
        ]);

        dialogSpy.open.and.stub();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [AvatarPickerComponent],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                { provide: AngularFireAuth, useValue: authSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(AvatarPickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
