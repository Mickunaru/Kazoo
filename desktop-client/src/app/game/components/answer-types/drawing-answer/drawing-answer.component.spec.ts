import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayModule } from '@angular/cdk/overlay';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { GameManagerService } from '@app/game/services/game-manager/game-manager.service';
import { KonvaService } from '@app/game/services/konva/konva.service';
import { BehaviorSubject } from 'rxjs';
import { DrawingAnswerComponent } from './drawing-answer.component';

describe('DrawingAnswerComponent', () => {
    let component: DrawingAnswerComponent;
    let fixture: ComponentFixture<DrawingAnswerComponent>;
    let konvaServiceSpy: jasmine.SpyObj<KonvaService>;
    let gameManagerServiceSpy: jasmine.SpyObj<GameManagerService>;
    let loadNextQuestionMock: BehaviorSubject<void>;

    beforeEach(() => {
        loadNextQuestionMock = new BehaviorSubject<void>(undefined);
        konvaServiceSpy = jasmine.createSpyObj('KonvaService', ['erase', 'brush', 'brushSize', 'brushOpacity', 'setStageRef']);
        gameManagerServiceSpy = jasmine.createSpyObj('GameManagerService', ['loadNextQuestionObservable'], {
            loadNextQuestionObservable: loadNextQuestionMock.asObservable(),
        });
        TestBed.configureTestingModule({
            declarations: [DrawingAnswerComponent],
            imports: [OverlayModule],
            providers: [
                { provide: KonvaService, useValue: konvaServiceSpy },
                { provide: GameManagerService, useValue: gameManagerServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(DrawingAnswerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
