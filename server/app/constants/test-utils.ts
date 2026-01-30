import { Game } from '@app/model/database/game';
import { Question } from '@app/model/database/question';
import { User } from '@app/model/database/user';
import { Player } from '@app/model/game-models/player/player';
import { GENERAL_CHAT_NAME, Message, MessageType } from '@common/interfaces/message';
import { PlayerStatus } from '@common/interfaces/player-info';
import { PlayerReview } from '@common/interfaces/player-review';

// Room Mocks
export const SOCKET_ID_MOCK = 'socketId';
export const PLAYER_NAME_MOCK = 'player-name';
export const PLAYER_CREDENTIAL_MOCK = { username: PLAYER_NAME_MOCK, avatar: '' } as User;
export const ROOM_ID_MOCK = 'roomId';
export const GAME_ID_MOCK = 'gameId';
export const GAME_MASTER_ID = 'gameMasterId';
export const ANSWERS_MOCK = [false, false, true];
export const PLAYERS_WITH_STATUS_MOCK = [
    { status: PlayerStatus.Submitted } as Player,
    { status: PlayerStatus.Pending } as Player,
    { status: PlayerStatus.Left } as Player,
];

// Timer Mocks
export const TIME_ANSWERED = 10;
export const TIMES_TIMER_CALLED = 10;

// Game Mocks
export const NOT_FOUND_MESSAGE = 'ID for question not found';
export const ID_MOCK = '507f191e810c19729de860ea';
export const INVALID_ID = '507f191e810c19729de860e';
export const UID_MOCK = 'uid';

export const GAME_MOCK = { title: 'title', isHidden: false } as unknown as Game;
export const QUESTION_MOCK = { text: 'question' } as unknown as Question;
export const FAKE_GAMES = [new Game(), new Game()];

// Token Mocks
export const FAKE_TOKEN_MOCK = 'token';
export const VALID_TOKEN =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.' +
    'eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MDc3MDE0MTQs' +
    'ImV4cCI6MTczOTIzNzQ0OCwiYXVkIjoiIiwic3ViIjoiIn0.' +
    'wb4LkQEQbQw3kC27TSJwdicVaLw4h0a2bmeOTLEIV9w';
export const EXPIRED_TOKEN =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.' +
    'eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1NDk5MzUwMTQs' +
    'ImV4cCI6MTU4MTQ3MTExMiwiYXVkIjoiIiwic3ViIjoiIn0.' +
    'C33IcqeGFKKPimAmukMUlDlD1AsJwJ4RhjM3YRNqDYA';

// Message Mocks
export const SENT_MESSAGE_MOCK: Message = {
    room: GENERAL_CHAT_NAME,
    text: 'Hello World!',
    author: 'Yaya',
    type: MessageType.TEXT,
    date: new Date(),
    avatar: 'a',
};
export const MESSAGE_HISTORY_MOCK = [{ author: 'Test name', text: 'Message 1', date: new Date('2024-03-18T18:30:15.660Z') }];
export const PLAYER_PERCENTAGE = 0.5;

export const GAME_MASTER_MOCK = { name: 'name', id: GAME_MASTER_ID };
export const PLAYER_SCORE1 = 100;
export const PLAYER_SCORE2 = 150;
export const PLAYER_SCORE3 = 80;
export const SOCKET_ID_1 = 'socket1';
export const SOCKET_ID_2 = 'socket2';
export const SOCKET_ID_3 = 'socket3';
export const PLAYER_NAME_1 = 'player1';
export const PLAYER_NAME_2 = 'player2';
export const PLAYER_NAME_3 = 'player3';
export const REVIEW_VALUE: PlayerReview = { name: PLAYER_NAME_MOCK, percentageGiven: PLAYER_PERCENTAGE };
export const OPEN_ENDED_ANSWER = 'an Answer';
export const PLAYER_REVIEWS_MOCK: PlayerReview[] = [REVIEW_VALUE];
