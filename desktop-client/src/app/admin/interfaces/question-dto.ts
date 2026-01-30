import { MultiChoice } from '@common/interfaces/multi-choice';

export interface QuestionDto {
    id?: string;
    points?: number;
    choices?: MultiChoice[];
    lastModified?: Date;
    uuid?: string;
    imageUrl?: string;
}
