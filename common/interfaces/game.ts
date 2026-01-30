import { Question } from './question';

export interface Game {
    id: string;
    title: string;
    description: string;
    duration: number;
    lastModification: Date;
    questions: Question[];
    private: boolean;
    creator: string;
    isHidden: boolean;
}
