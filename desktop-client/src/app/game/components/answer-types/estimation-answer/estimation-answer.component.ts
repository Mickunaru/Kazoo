import { Component, Input } from '@angular/core';
import { GameStateService } from '@app/game/services/game-state/game-state.service';
import { SubmitManagerService } from '@app/game/services/submit-manager/submit-manager.service';

@Component({
    selector: 'app-estimation-answer',
    templateUrl: './estimation-answer.component.html',
    styleUrls: ['./estimation-answer.component.scss'],
})
export class EstimationAnswerComponent {
    @Input() canAnswer: boolean;

    constructor(
        readonly submitManagerService: SubmitManagerService,
        readonly gameStateService: GameStateService,
    ) {}
}
