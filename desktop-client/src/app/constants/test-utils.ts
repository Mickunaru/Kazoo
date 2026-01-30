import { HttpRequest } from '@angular/common/http';
import { ADMIN_ONLY_ENDPOINTS } from '@common/constants/endpoint-constants';
import { BONUS_MULTIPLIER } from '@common/constants/game-constants';
import { QuestionType } from '@common/enum/question-type';
import { CorrectAnswerDto } from '@common/interfaces/correct-answer-dto';
import { Game } from '@common/interfaces/game';
import { Message, MessageType } from '@common/interfaces/message';
import { PlayerAnswerForReview } from '@common/interfaces/player-answer-for-review';
import { PlayerDrawingAnswer } from '@common/interfaces/player-drawing-answer';
import { PlayerInfo } from '@common/interfaces/player-info';
import { PlayerReview } from '@common/interfaces/player-review';
import { Question } from '@common/interfaces/question';
import { StatsViewDto } from '@common/interfaces/stats-view-dto';

export const MOCK_GAME = {
    title: 'Sample Game',
    description: 'This is a sample game',
    duration: 60,
    questions: [
        {
            text: 'Question 1',
            type: QuestionType.MultiChoice,
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
            points: 10,
        },
    ],
} as Game;

export const MOCK_GAME_2: Game = {
    title: 'Game1',
    description: 'Description1',
    duration: 30,
    id: 'id',
    questions: [
        {
            type: QuestionType.MultiChoice,
            text: 'who',
            uuid: '',
            points: 21,
            choices: [
                { text: 'un', isCorrect: true },
                { text: 'deux', isCorrect: false },
                { text: 'trois', isCorrect: false },
            ],
        },
        {
            type: QuestionType.MultiChoice,
            text: 'what',
            points: 69,
            uuid: '',
            choices: [
                { text: 'one', isCorrect: true },
                { text: 'two', isCorrect: false },
                { text: 'three', isCorrect: false },
            ],
        },
        {
            type: QuestionType.OpenEnded,
            text: 'why',
            points: 42,
            uuid: '',
            choices: [],
        },
    ],
    private: false,
    creator: 'name',
    lastModification: new Date('2017-03-25'),
    isHidden: true,
};
export const MOCK_GAME_2_ANSWERS = [true, false, false];

export const SERVER_GAME_BANK_MOCK: Game[] = [
    {
        id: '1234',
        lastModification: new Date(),
        title: 'Game 1',
        description: 'Test Game 1',
        duration: 10,
        questions: [],
        isHidden: false,
        private: false,
        creator: 'name',
    },
    {
        id: '5678',
        lastModification: new Date(),
        title: 'Game 2',
        description: 'Test Game 2',
        duration: 15,
        questions: [],
        isHidden: true,
        private: false,
        creator: 'name',
    },
];

export const ID_MOCK = 'id';

export const QUESTION_BANK_MOCK: Question[] = [
    {
        type: QuestionType.MultiChoice,
        text: 'who',
        id: '1',
        points: 420,
        uuid: '',
        choices: [
            { text: 'un', isCorrect: true },
            { text: 'deux', isCorrect: false },
            { text: 'trois', isCorrect: false },
        ],
        lastModification: new Date('2017-03-25'),
    },
    {
        type: QuestionType.MultiChoice,
        text: 'why',
        id: '2',
        points: 420,
        uuid: '',
        choices: [
            { text: 'uno', isCorrect: false },
            { text: 'dos', isCorrect: true },
            { text: 'tres', isCorrect: false },
        ],
        lastModification: new Date('2025-04-29'),
    },
    {
        type: QuestionType.MultiChoice,
        text: 'what',
        id: '',
        points: 420,
        uuid: '',
        choices: [
            { text: 'eins', isCorrect: false },
            { text: 'zwei', isCorrect: true },
            { text: 'drei', isCorrect: false },
        ],
        lastModification: new Date('2025-04-29'),
    },
];

export const QUESTION_BANK_MOCK_2: Question[] = [
    {
        type: QuestionType.MultiChoice,
        text: 'where',
        id: 'id',
        points: 21,
        uuid: '',
        choices: [
            { text: 'un', isCorrect: true },
            { text: 'deux', isCorrect: false },
            { text: 'trois', isCorrect: false },
        ],
        lastModification: new Date('2018-03-25'),
    },
    {
        type: QuestionType.MultiChoice,
        text: 'whom',
        id: '2',
        points: 69,
        uuid: '',
        choices: [
            { text: 'one', isCorrect: true },
            { text: 'two', isCorrect: false },
            { text: 'three', isCorrect: false },
        ],
        lastModification: new Date('2017-03-25'),
    },
];

export const BAD_QUESTION_MOCK: Question = {
    type: QuestionType.MultiChoice,
    text: 'No questions found in server',
    id: '',
    points: 0,
    choices: [],
    lastModification: new Date(),
    uuid: '',
};

export const CORRECT_ANSWERS_MOCK: CorrectAnswerDto = {
    answers: MOCK_GAME_2.questions[0].choices.filter((choice) => choice.isCorrect).map((choice) => choice.text),
    pointsGained: MOCK_GAME_2.questions[0].points,
    bonusPointsGained: MOCK_GAME_2.questions[0].points * BONUS_MULTIPLIER,
};

export const HISTORY_MOCK: Message[] = [
    { author: 'Test', text: 'Test message', date: new Date(), room: 'Random room', type: MessageType.TEXT, avatar: 'a' },
    { author: 'Test2', text: 'Test message 2', date: new Date(), room: 'Random room', type: MessageType.TEXT, avatar: 'a' },
];

export const MESSAGE_MOCK: Message = {
    author: 'user',
    text: 'New message',
    date: new Date(),
    room: 'Random room',
    type: MessageType.TEXT,
    avatar: 'a',
};

export const PLAYER1_STATS_MOCK: PlayerInfo = {
    username: 'appa',
    score: 500,
    bonusCount: 2,
};

export const PLAYER2_STATS_MOCK: PlayerInfo = {
    username: 'cake',
    score: 500,
    bonusCount: 4,
};

export const PLAYER3_STATS_MOCK: PlayerInfo = {
    username: 'bii',
    score: 200,
    bonusCount: 2,
};

export const PLAYER4_STATS_MOCK: PlayerInfo = {
    username: 'abba',
    score: 100,
    bonusCount: 0,
};

export const SORTED_PLAYERS_STATS_MOCK: PlayerInfo[] = [PLAYER1_STATS_MOCK, PLAYER2_STATS_MOCK, PLAYER3_STATS_MOCK, PLAYER4_STATS_MOCK];

export const UNSORTED_PLAYERS_STATS_MOCK: PlayerInfo[] = [PLAYER3_STATS_MOCK, PLAYER2_STATS_MOCK, PLAYER1_STATS_MOCK, PLAYER4_STATS_MOCK];

// TODO: CHECK IF DELETE
export const PLAYER_ANSWER_STATS_MOCK = [
    [1, 2, 3],
    [2, 1, 3, 3],
];
export const STATS_VIEW_MOCK: StatsViewDto = {
    playerAnswerStats: PLAYER_ANSWER_STATS_MOCK,
    playersStats: SORTED_PLAYERS_STATS_MOCK,
};
export const CHOICE_ARRAY_MOCK = ['un', 'deux', 'trois'];
export const CHOICE_ARRAY_ANSWERS_MOCK = [true, false, true];
export const GAME_CODE_MOCK = '1234';
export const TOKEN_MOCK = 'token';
export const PASSWORD_MOCK = 'password';
export const PARTICIPANT_ARRAY_MOCK = [
    { id: '1', username: 'Player 1', hasLeft: false, teamName: '', imageUrl: '' },
    { id: '2', username: 'Player 2', hasLeft: false, teamName: '', imageUrl: '' },
    { id: '3', username: 'Player 3', hasLeft: false, teamName: '', imageUrl: '' },
];
export const SNACK_BAR_MESSAGE = 'snack bar message';
export const TEXT_MOCK = 'Test message';
export const ORGANIZER_SOCKET_ID = 'Organizer';
export const ROOM_ID_MOCK = '1234';
export const NAME_MOCK = 'name';
export const PLAYER_NAME_MOCK = 'PlayerName';
export const PLAYER_REVIEWS: PlayerReview[] = [{ name: 'Player 1', percentageGiven: 10 }];
export const PLAYER_OPEN_ENDED_ANSWERS: PlayerAnswerForReview[] = [{ name: 'Player 1', answer: 'answer-1', questionType: QuestionType.OpenEnded }];
export const PLAYER_DRAWINGS_ANSWERS: PlayerDrawingAnswer[] = [{ name: 'Player 1', awsKey: 'some-key' }];
export const SCORE_MOCK = 20;
export const PLAYER_LONG_ANSWER = 'some long answer';
export const START_WAIT_TIME_S = 5;
export const MOCK_API_URL = '/api/something';
export const MOCK_REQUEST_WITHOUT_ADMIN_ENDPOINT = new HttpRequest('GET', MOCK_API_URL);
export const MOCK_REQUEST_WITH_ADMIN_ENDPOINT = new HttpRequest('GET', ADMIN_ONLY_ENDPOINTS[0]);
export const HEADERS_MOCK = { authorization: 'Bearer token' };
export const GAME_DURATION_MOCK = 10;
