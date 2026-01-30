import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CHOICE_ARRAY_MOCK, QUESTION_BANK_MOCK } from '@app/constants/test-utils';
import { GamePannelComponent } from '@app/game/components/game-pannel/game-pannel.component';
import { GameManagerService } from '@app/game/services/game-manager/game-manager.service';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { PlayerReviewSnackbarService } from '@app/game/services/player-review-snackbar/player-review-snackbar-service.service';
import { PowerUpService } from '@app/game/services/power-up/power-up.service';
import { SubmitManagerService } from '@app/game/services/submit-manager/submit-manager.service';
import { AppMaterialModule } from '@app/modules/material.module';

describe('GamePannelComponent', () => {
    let component: GamePannelComponent;
    let fixture: ComponentFixture<GamePannelComponent>;
    let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;
    let gameManagerServiceSpy: jasmine.SpyObj<GameManagerService>;
    let submitManagerServiceSpy: jasmine.SpyObj<SubmitManagerService>;
    let powerUpServiceSpy: jasmine.SpyObj<PowerUpService>;
    let playerReviewSnackbarServiceSpy: jasmine.SpyObj<PlayerReviewSnackbarService>;

    beforeEach(() => {
        gameStateServiceSpy = jasmine.createSpyObj('GameStateService', ['getGameId', 'isMultipleChoice'], {
            questionChoices: CHOICE_ARRAY_MOCK,
            currentQuestion: QUESTION_BANK_MOCK,
        });
        submitManagerServiceSpy = jasmine.createSpyObj('SubmitManagerService', ['answerIsChosen']);
        gameManagerServiceSpy = jasmine.createSpyObj(
            'GameManagerService',
            ['showAnswer', 'onSubmit', 'setNumberOfButtons', 'onSubmitForTestPage', 'submitAnswer', 'sendActiveState'],
            {},
        );
        powerUpServiceSpy = jasmine.createSpyObj('PowerUpService', ['currentPowerUps']);
        playerReviewSnackbarServiceSpy = jasmine.createSpyObj('PlayerReviewSnackbarService', ['setupListener', 'removeListener']);
        TestBed.configureTestingModule({
            declarations: [GamePannelComponent],
            imports: [HttpClientTestingModule, AppMaterialModule, BrowserAnimationsModule],
            providers: [
                {
                    provide: GameStateService,
                    useValue: gameStateServiceSpy,
                },
                {
                    provide: GameManagerService,
                    useValue: gameManagerServiceSpy,
                },
                {
                    provide: SubmitManagerService,
                    useValue: submitManagerServiceSpy,
                },
                {
                    provide: PowerUpService,
                    useValue: powerUpServiceSpy,
                },
                {
                    provide: PlayerReviewSnackbarService,
                    useValue: playerReviewSnackbarServiceSpy,
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(GamePannelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should submit if in game mode and reset timer listeners', () => {
        gameManagerServiceSpy.submitAnswer.and.stub();
        component.submit();
        expect(gameManagerServiceSpy.submitAnswer).toHaveBeenCalled();
    });
});
