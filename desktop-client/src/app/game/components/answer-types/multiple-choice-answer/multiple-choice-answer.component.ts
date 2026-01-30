import { Component, Input } from '@angular/core';
import { BUTTON_ICON_NAMES } from '@app/game/constants/game-constants';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { PowerUpService } from '@app/game/services/power-up/power-up.service';
import { SubmitManagerService } from '@app/game/services/submit-manager/submit-manager.service';

@Component({
    selector: 'app-multiple-choice-answer',
    templateUrl: './multiple-choice-answer.component.html',
    styleUrls: ['./multiple-choice-answer.component.scss'],
})
export class MultipleChoiceAnswerComponent {
    @Input() canAnswer: boolean;
    @Input() showAnswers: boolean;
    buttonIcons: string[] = BUTTON_ICON_NAMES;

    constructor(
        readonly gameStateService: GameStateService,
        readonly submitManagerService: SubmitManagerService,
        readonly powerUpService: PowerUpService,
    ) {}
}
