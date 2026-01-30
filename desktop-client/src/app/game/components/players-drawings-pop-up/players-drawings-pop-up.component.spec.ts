import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PLAYER_DRAWINGS_ANSWERS } from '@app/constants/test-utils';
import { PlayersDrawingsPopUpComponent } from './players-drawings-pop-up.component';

describe('PlayersDrawingsPopUpComponent', () => {
    let component: PlayersDrawingsPopUpComponent;
    let fixture: ComponentFixture<PlayersDrawingsPopUpComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        dialogRefSpy = jasmine.createSpyObj('MatDialog', ['closeAll']);
        TestBed.configureTestingModule({
            declarations: [PlayersDrawingsPopUpComponent],
            providers: [{ provide: MatDialog, useValue: dialogRefSpy }],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(PlayersDrawingsPopUpComponent);
        component = fixture.componentInstance;
        component.playersDrawings = [...PLAYER_DRAWINGS_ANSWERS];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
