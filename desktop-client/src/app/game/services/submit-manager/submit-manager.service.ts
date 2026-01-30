import { Injectable } from '@angular/core';
import { KonvaService } from '@app/game/services/konva/konva.service';
import { RoomService } from '@app/home/services/room/room.service';
import { S3Service } from '@app/shared/services/s3/s3.service';
import { QuestionType } from '@common/enum/question-type';
import { PlayerAnswer } from '@common/interfaces/player-answer';
import { Question } from '@common/interfaces/question';
@Injectable({
    providedIn: 'root',
})
export class SubmitManagerService {
    buttonsAreActive: boolean[] = [];
    disabledAnswerChoices: Set<number> = new Set();
    textAnswer: string = '';
    numericalAnswer: number;

    constructor(
        private readonly konvaService: KonvaService,
        private readonly s3Service: S3Service,
        private readonly roomService: RoomService,
    ) {}

    setNumberOfButtons(numButtons: number) {
        this.buttonsAreActive = Array(numButtons).fill(false);
    }

    buttonWasClicked(index: number) {
        this.buttonsAreActive[index] = !this.buttonsAreActive[index];
        this.buttonsAreActive = [...this.buttonsAreActive];
    }

    changeTextAnswer(answer: string) {
        this.textAnswer = answer;
    }

    changeNumericalAnswer(answer: number) {
        this.numericalAnswer = answer;
    }

    setInputs(question: Question) {
        this.textAnswer = '';

        if (question.upperBound !== undefined && question.lowerBound !== undefined) {
            this.numericalAnswer = Math.round((question.upperBound + question.lowerBound) / 2);
        } else {
            this.numericalAnswer = 0;
        }

        if (question.type === QuestionType.MultiChoice) {
            this.disabledAnswerChoices.clear();
            this.buttonsAreActive = new Array(question.choices.length).fill(false);
        }
    }

    answerIsChosen(questionType: QuestionType): boolean {
        switch (questionType) {
            case QuestionType.MultiChoice:
                return this.buttonsAreActive.includes(true);
            case QuestionType.OpenEnded:
                return this.textAnswer.length > 0;
            case QuestionType.Drawing:
            case QuestionType.Estimation:
                return true;
        }
    }

    async getAnswer(questionType: QuestionType): Promise<PlayerAnswer> {
        let awsKey = '';
        if (questionType === QuestionType.Drawing) {
            const blob = (await this.konvaService.getDrawingBlob()) ?? ({} as unknown as Blob);
            awsKey = `drawings/${this.roomService.roomId}/${crypto.randomUUID()}.png`;
            await this.s3Service.uploadBlobImage(blob, awsKey);
        }
        switch (questionType) {
            case QuestionType.MultiChoice:
                return { questionType, data: this.buttonsAreActive };
            case QuestionType.OpenEnded:
                return { questionType, data: this.textAnswer };
            case QuestionType.Estimation:
                return { questionType, data: this.numericalAnswer };
            case QuestionType.Drawing:
                return { questionType, data: awsKey };
        }
    }
}
