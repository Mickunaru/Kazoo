import { QuestionType } from '../enum/question-type';
import { MultiChoice } from './multi-choice';

export interface Question {
    type: QuestionType;
    text: string;
    points: number;
    choices: MultiChoice[];
    id?: string;
    lastModification?: Date;

    lowerBound?: number;
    upperBound?: number;
    answer?: number;
    precision?: number;
    imageUrl?: string;
    uuid?: string;
    creator?: string;
}
