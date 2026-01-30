import { QuestionType } from '../enum/question-type';

interface BaseQuestionAnswer {
    pointsGained: number;
    score: number;
}

export interface QuestionAnswerBonus extends BaseQuestionAnswer {
    bonusPointsGained: number;
    answers: string[];
}

export interface MultiChoiceAnswer extends QuestionAnswerBonus {
    questionType: QuestionType.MultiChoice;
}

export interface OpenEndedAnswer extends BaseQuestionAnswer {
    questionType: QuestionType.OpenEnded;
    percentageGiven: number;
}

export interface EstimationAnswer extends QuestionAnswerBonus {
    questionType: QuestionType.Estimation;
}

export interface DrawingAnswer extends BaseQuestionAnswer {
    questionType: QuestionType.Drawing;
    percentageGiven: number;
}

export type QuestionAnswer = MultiChoiceAnswer | OpenEndedAnswer | EstimationAnswer | DrawingAnswer;
