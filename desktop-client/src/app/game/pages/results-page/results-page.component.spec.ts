import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PrizeService } from '@app/game/services/prize/prize.service';
import { TeamService } from '@app/game/services/team/team.service';
import { ResultsPageComponent } from './results-page.component';

describe('ResultsPageComponent', () => {
    let component: ResultsPageComponent;
    let fixture: ComponentFixture<ResultsPageComponent>;
    let teamServiceSpy: jasmine.SpyObj<TeamService>;
    let prizeServiceSpy: jasmine.SpyObj<PrizeService>;

    beforeEach(() => {
        teamServiceSpy = jasmine.createSpyObj('TeamService', ['resetManager']);
        prizeServiceSpy = jasmine.createSpyObj('PrizeService', ['']);
        TestBed.configureTestingModule({
            declarations: [ResultsPageComponent],
            providers: [
                { provide: TeamService, useValue: teamServiceSpy },
                { provide: PrizeService, useValue: prizeServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(ResultsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
