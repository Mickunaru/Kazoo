import { Game } from '@app/model/database/game';
import { Question } from '@app/model/database/question';
import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { GameDto } from '@app/model/dto/game/game.dto';
import { HideGameDto } from '@app/model/dto/game/hide-game.dto';
import { QuestionDto } from '@app/model/dto/question/question.dto';
import { QuestionType } from '@common/enum/question-type';

export const getFakeGame = (): Game => ({
    id: getRandomString(),
    title: getRandomString(),
    description: getRandomString(),
    duration: getRandomDurationNumber(),
    creator: 'name',
    private: false,
    questions: [
        {
            ...getFakeMultiChoiceDto(),
            lastModification: new Date(),
        } as Question,
        {
            ...getFakeOpenEndedDto(),
            lastModification: new Date(),
        } as Question,
    ],
    lastModification: new Date(),
    isHidden: false,
});

export const getFakeGameDto = (questionCount: number = getRandomQuestionNumber()): GameDto => ({
    title: getRandomString(),
    description: getRandomString(),
    duration: getRandomDurationNumber(),
    questions: Array(questionCount).fill(getFakeMultiChoiceDto()),
    private: false,
    creator: 'name',
});

export const getFakeMultiChoiceDto = (choiceCount: number = getRandomChoiceNumber()): QuestionDto => ({
    type: QuestionType.MultiChoice,
    text: getRandomString(),
    points: getRandomPointsNumber(),
    choices: [getFakeChoiceDto(false), getFakeChoiceDto(true), ...Array(choiceCount - MIN_CHOICE_NUMBER).fill(getFakeChoiceDto())],
    creator: getRandomString(),
});

export const getFakeOpenEndedDto = (): QuestionDto => ({
    type: QuestionType.OpenEnded,
    text: getRandomString(),
    points: getRandomPointsNumber(),
    choices: [],
    uuid: getRandomString(),
    creator: getRandomString(),
});

export const getFakeHideGameDto = (): HideGameDto => ({ isHidden: false });

const getFakeChoiceDto = (isCorrect: boolean = getRandomBoolean()): ChoiceDto => ({
    text: getRandomString(),
    isCorrect,
});

const BASE_36 = 36;
const POINT_RANGE = 5;
const POINT_STEP = 10;
const RANDOM_MID_POINT = 0.5;
const DURATION_MAX = 59;
const MAX_QUESTION_NUMBER = 20;
const RANDOM_ADDITIONAL_CHOICES = 2;
const MIN_CHOICE_NUMBER = 2;

const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
export const getRandomPointsNumber = (): number => Math.floor(Math.random() * POINT_RANGE + 1) * POINT_STEP;
const getRandomDurationNumber = (): number => Math.floor(Math.random() * DURATION_MAX + 1);
const getRandomBoolean = (): boolean => Math.random() < RANDOM_MID_POINT;
const getRandomQuestionNumber = (): number => Math.floor(Math.random() * MAX_QUESTION_NUMBER + 1);
const getRandomChoiceNumber = (): number => Math.floor(Math.random() * RANDOM_ADDITIONAL_CHOICES + MIN_CHOICE_NUMBER);
