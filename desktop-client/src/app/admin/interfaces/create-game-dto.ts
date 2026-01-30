import { Question } from '@common/interfaces/question';

export interface CreateGameDto {
    title: string;
    description: string;
    duration: number;
    questions: Question[];
}
