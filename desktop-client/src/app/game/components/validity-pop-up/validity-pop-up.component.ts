import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { QuestionType } from '@common/enum/question-type';
import { QuestionAnswer } from '@common/interfaces/question-answer';
import { GameEvent } from '@common/socket-events/game-event';

const PARTIAL_ANSWER_VALUE = 50;
const PERCENTAGE_MULTPLIER = 100;

@Component({
    selector: 'app-validity-pop-up',
    templateUrl: './validity-pop-up.component.html',
    styleUrls: ['./validity-pop-up.component.scss'],
})
export class ValidityPopUpComponent {
    correctAnswers: string[] = [];
    pointsGained: number = 0;
    bonusPointsGained: number = 0;
    percentageGiven: number | null = null;
    isPartial: boolean = false;
    isEliminated: boolean = false;
    isDrawingQuestionType: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<ValidityPopUpComponent>,
        private readonly websocketService: WebsocketService,
    ) {}

    setupPopUp(questionAnswer: QuestionAnswer, isEliminated: boolean) {
        this.pointsGained = questionAnswer.pointsGained;
        this.isEliminated = isEliminated;
        switch (questionAnswer.questionType) {
            case QuestionType.MultiChoice:
            case QuestionType.Estimation:
                this.bonusPointsGained = questionAnswer.bonusPointsGained;
                this.correctAnswers = questionAnswer.answers;
                break;
            case QuestionType.OpenEnded:
            case QuestionType.Drawing:
                this.isDrawingQuestionType = true;
                this.correctAnswers = [];
                this.bonusPointsGained = 0;
                this.percentageGiven = questionAnswer.percentageGiven * PERCENTAGE_MULTPLIER;
                this.isPartial = this.percentageGiven === PARTIAL_ANSWER_VALUE;
                break;
        }
    }

    closePopup() {
        if (this.isDrawingQuestionType) {
            this.isDrawingQuestionType = false;
            this.websocketService.send(GameEvent.GET_DRAWINGS);
        }
        this.dialogRef.close();
    }
}
