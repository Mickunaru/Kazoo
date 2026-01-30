import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { AppMaterialModule } from '@app/modules/material.module';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;

    beforeEach(async () => {
        gameStateServiceSpy = jasmine.createSpyObj('GameStateService', ['']);
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [HttpClientTestingModule, AppMaterialModule, BrowserAnimationsModule],
            providers: [{ provide: GameStateService, useValue: gameStateServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
