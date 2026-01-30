import { QuestionType } from '../enum/question-type';

interface MultiChoicePlayerAnswer {
    questionType: QuestionType.MultiChoice;
    data: boolean[];
}

interface OpenEndedPlayerAnswer {
    questionType: QuestionType.OpenEnded;
    data: string;
}

interface EstimationPlayerAnswer {
    questionType: QuestionType.Estimation;
    data: number;
}

interface DrawingPlayerAnswer {
    questionType: QuestionType.Drawing;
    data: string;
}

export type PlayerAnswer = MultiChoicePlayerAnswer | OpenEndedPlayerAnswer | EstimationPlayerAnswer | DrawingPlayerAnswer;
