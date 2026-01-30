import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CHOICE_ARRAY_MOCK } from '@app/constants/test-utils';
import { MultipleChoiceAnswerComponent } from '@app/game/components/answer-types/multiple-choice-answer/multiple-choice-answer.component';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { PowerUpService } from '@app/game/services/power-up/power-up.service';
import { SubmitManagerService } from '@app/game/services/submit-manager/submit-manager.service';

describe('MultipleChoiceAnswerComponent', () => {
    let component: MultipleChoiceAnswerComponent;
    let fixture: ComponentFixture<MultipleChoiceAnswerComponent>;
    let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;
    let submitManagerServiceSpy: jasmine.SpyObj<SubmitManagerService>;
    let powerUpServiceSpy: jasmine.SpyObj<PowerUpService>;

    beforeEach(() => {
        gameStateServiceSpy = jasmine.createSpyObj('GameStateService', [], {
            questionChoices: CHOICE_ARRAY_MOCK,
            isSubmitted: false,
            questionIndexes: [0, 1, 2], // Mock question indexes
            currentQuestion: { choices: [{ isCorrect: true }, { isCorrect: false }, { isCorrect: true }] },
        });
        submitManagerServiceSpy = jasmine.createSpyObj('SubmitManagerService', ['buttonWasClicked'], {
            disabledAnswerChoices: new Set(),
            buttonsAreActive: [false, false, false],
        });
        powerUpServiceSpy = jasmine.createSpyObj('PowerUpService', [], {
            tornadoShuffledIndexes: [],
            confusionQuestionChoices: [],
        });

        TestBed.configureTestingModule({
            declarations: [MultipleChoiceAnswerComponent],
            providers: [
                { provide: GameStateService, useValue: gameStateServiceSpy },
                { provide: SubmitManagerService, useValue: submitManagerServiceSpy },
                { provide: PowerUpService, useValue: powerUpServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(MultipleChoiceAnswerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
