import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
    let component: ConfirmDialogComponent;
    let fixture: ComponentFixture<ConfirmDialogComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmDialogComponent>>;

    beforeEach(() => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        dialogRefSpy.close.and.stub();
        TestBed.configureTestingModule({
            declarations: [ConfirmDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { title: 'title', message: 'message', confirmText: 'confirmText', cancelText: 'cancelText', confirmColor: 'primary' },
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(ConfirmDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
