import { Injectable } from '@angular/core';
import { QuestionType } from '@common/enum/question-type';
import { PlayerInfo } from '@common/interfaces/player-info';
import { Question } from '@common/interfaces/question';

@Injectable({
    providedIn: 'root',
})
export class GameStateService {
    isSubmitted: boolean = false;
    playerScore: number = 0;
    playerInfo: PlayerInfo[];
    currentQuestion: Question;
    questionsLength: number = 0;
    currentQuestionIndex: number = 0;
    isEliminated = false;
    playersAwsKeys: string[] = [];

    get questionChoices(): string[] {
        return this.currentQuestion.choices.map((choice) => choice.text);
    }

    get questionIndexes(): number[] {
        return this.currentQuestion.choices.map((_, i) => i);
    }

    get questionType(): QuestionType {
        return this.currentQuestion.type as QuestionType;
    }

    resetGameState() {
        this.isSubmitted = false;
        this.isEliminated = false;
        this.playerScore = 0;
        this.currentQuestionIndex = 0;
        this.questionsLength = 0;
        this.currentQuestion = {} as Question;
    }

    changeQuestion(question: Question) {
        this.isSubmitted = false;
        this.currentQuestion = question;
        this.currentQuestionIndex++;
    }
}
