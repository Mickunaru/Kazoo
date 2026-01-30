import { QuestionType } from "@common/enum/question-type";

export interface PlayerAnswerForReview {
    questionType: QuestionType;
    name: string;
    answer: string;
}
