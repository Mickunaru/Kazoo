import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MAX_TEXT_ANSWER_LENGTH } from '@app/game/constants/game-constants';
import { GameManagerService } from '@app/game/services/game-manager/game-manager.service';
import { SubmitManagerService } from '@app/game/services/submit-manager/submit-manager.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-open-ended-answer',
    templateUrl: './open-ended-answer.component.html',
    styleUrls: ['./open-ended-answer.component.scss'],
})
export class OpenEndedAnswerComponent implements OnInit, OnDestroy {
    @Input() canAnswer: boolean;

    readonly maxTextAnswerLength = MAX_TEXT_ANSWER_LENGTH;
    private gameStateSubscription: Subscription | null;

    constructor(
        private readonly gameManagerService: GameManagerService,
        private readonly submitManagerService: SubmitManagerService,
    ) {}

    ngOnInit() {
        this.setupLoadNextQuestion();
    }

    ngOnDestroy() {
        this.gameStateSubscription?.unsubscribe();
    }

    onInput(text: string) {
        this.submitManagerService.changeTextAnswer(text);
    }

    private setupLoadNextQuestion() {
        this.gameStateSubscription = this.gameManagerService.loadNextQuestionObservable.subscribe(() => {
            this.submitManagerService.changeTextAnswer('');
        });
    }
}
