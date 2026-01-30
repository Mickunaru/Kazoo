import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { AvatarDialogComponent } from './avatar-dialog.component';

describe('AvatarDialogComponent', () => {
    let component: AvatarDialogComponent;
    let fixture: ComponentFixture<AvatarDialogComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<AvatarDialogComponent>>;

    beforeEach(() => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        dialogRefSpy.close.and.stub();
        const mockAngularFireAuth = {
            authState: of(null),
        };
        TestBed.configureTestingModule({
            declarations: [AvatarDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: AngularFireAuth, useValue: mockAngularFireAuth },
            ],
            imports: [HttpClientTestingModule, MatSnackBarModule],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(AvatarDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
