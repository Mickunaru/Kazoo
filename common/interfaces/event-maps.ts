import { Notification } from '@app/model/database/notification';
import { Question } from '@app/model/database/question';
import { RoomDestructionReason } from '@common/enum/room-destruction-reason';
import { UserCurrency } from '@common/interfaces/user';
import { TimerType } from '../enum/timer-type';
import { FriendLists } from '../interfaces/friend-lists';
import { FriendRequestResponse } from '../interfaces/friend-request-response';
import { ChatEvent } from '../socket-events/chat-event';
import { FriendEvent } from '../socket-events/friend-event';
import { GameEvent } from '../socket-events/game-event';
import { HomeEvent } from '../socket-events/home-event';
import { NotificationEvent } from '../socket-events/notification-event';
import { RoomEvent } from '../socket-events/room-event';
import { TimerEvent } from '../socket-events/timer-event';
import { ActiveGame, NewPlayerCount, NewRoomState } from './active-game';
import { ChatRoomDto } from './chat-room';
import { FriendUpdate } from './friend-update';
import { Message } from './message';
import { PlayerAnswerForReview } from './player-answer-for-review';
import { PlayerDrawingAnswer } from './player-drawing-answer';
import { PlayerInfo } from './player-info';
import { PlayerPrize } from './player-prize';
import { PlayerDto } from './playerDto';
import { PowerUp } from './power-up';
import { QuestionAnswer } from './question-answer';
import { Team } from './team';
import { WsErrorDto } from './ws-error-dto';

export interface ChatEventMap {
    [ChatEvent.SEND_CHAT_HISTORY]: (messages: Message[]) => void;
    [ChatEvent.SEND_MESSAGE]: (message: Message) => void;
    [ChatEvent.CREATE_CHAT_ROOM]: (room: ChatRoomDto | WsErrorDto) => void;
    [ChatEvent.GET_OTHER_ROOMS]: (rooms: ChatRoomDto[]) => void;
    [ChatEvent.GET_JOINED_ROOMS]: (rooms: ChatRoomDto[]) => void;
    [ChatEvent.DELETE_ROOM]: (roomName: string) => void;
    [ChatEvent.SEND_SOUND]: (sound: string) => void;
}

export interface TimerEventMap {
    [TimerEvent.TIMER_STARTED]: (type: TimerType) => void;
    [TimerEvent.TIMER_TICK]: (time: number) => void;
    [TimerEvent.TIMER_ENDED]: () => void;
    [TimerEvent.PANIC_TIMER]: () => void;
}

export interface GameManagerMap {
    [GameEvent.NEXT_QUESTION]: (question: Question) => void;
    [GameEvent.SEND_ANSWERS]: (questionAnswer?: QuestionAnswer) => void;
    [GameEvent.GET_DRAWINGS]: (playerDrawings: PlayerDrawingAnswer[]) => void;
    [GameEvent.SEND_REVIEWS]: (playerAnswers: PlayerAnswerForReview[]) => void;
    [GameEvent.REVIEW_IN_PROGRESS]: () => void;
    [GameEvent.GAME_FINISHED]: (playersStats: PlayerInfo[]) => void;
    [GameEvent.MONEY_PRIZE]: (prize: PlayerPrize) => void;
    [GameEvent.PLAYER_ELIMINATED]: () => void;
    [HomeEvent.UPDATE_USER_MONEY]: (currency: UserCurrency) => void;
    [TimerEvent.TIMER_STARTED]: (type: TimerType) => void;
    [RoomEvent.UPDATE_PLAYERS_STATS]: (playersStats: PlayerInfo[]) => void;
}

export interface RoomSettingsMap {
    [RoomEvent.UPDATE_PLAYERS_STATS]: (playersStats: PlayerInfo[]) => void;
    [RoomEvent.START_GAME]: (playersStats: PlayerInfo[]) => void;
    [RoomEvent.SWITCH_LOCK]: (isLocked: boolean) => void;
    [RoomEvent.BAN]: () => void;
    [RoomEvent.UPDATE_PARTICIPANT_LIST]: (playerDtoArray: PlayerDto[]) => void;
    [RoomEvent.LEAVE_GAME]: (roomDestructionReason: RoomDestructionReason) => void;
    [RoomEvent.UPDATE_TEAMS]: (team: Team[]) => void;
    [HomeEvent.UPDATE_USER_MONEY]: (currency: UserCurrency) => void;
    [GameEvent.NEXT_QUESTION]: (game: Question) => void;
    [TimerEvent.TIMER_STARTED]: (type: TimerType) => void;
    [TimerEvent.TIMER_TICK]: (time: number) => void;
    [TimerEvent.TIMER_ENDED]: () => void;
    [ChatEvent.JOIN_ROOM]: (room: ChatRoomDto) => void;
    [ChatEvent.DELETE_ROOM]: (roomName: string) => void;
}

export interface FriendMap {
    [FriendEvent.REMOVE_FRIEND]: (username: string) => void;
    [FriendEvent.UPDATE_SINGLE_FRIEND]: (update: FriendUpdate) => void;
    [FriendEvent.GET_FRIENDS]: (lists: FriendLists) => void;
    [FriendEvent.FRIEND_REQUEST_RESPONSE]: (answer: FriendRequestResponse) => void;
    [FriendEvent.REQUEST_IGNORED]: (username: string) => void;
    [FriendEvent.NEW_USER]: (username: string) => void;
    [FriendEvent.ADD_NOT_FRIEND]: (username: string) => void;
}

export interface NotificationMap {
    [NotificationEvent.SEND_FRIEND_REQUEST]: (recipientUsername: string) => void;
    [NotificationEvent.GET_NOTIFICATIONS]: (usernames: Notification[]) => void;
    [NotificationEvent.ADD_NOTIFICATION]: (usernames: Notification) => void;
}

export interface HomeLobbyMap {
    [HomeEvent.CONNECTION_ACK]: () => void;
    [HomeEvent.JOIN_HOME_LOBBY]: () => void;
    [HomeEvent.LEAVE_HOME_LOBBY]: () => void;
    [HomeEvent.UPDATE_GAME_LIST]: (activeGames: ActiveGame[]) => void;
    [HomeEvent.REMOVE_GAME]: (gameId: string) => void;
    [HomeEvent.UPDATE_PLAYER_COUNT]: (newPlayerCount: NewPlayerCount) => void;
    [HomeEvent.UPDATE_ROOM_STATE]: (newRoomState: NewRoomState) => void;
}

export interface PowerUpMap {
    [GameEvent.ACTIVATE_POWER_UP]: (powerUpName: PowerUp) => void;
    [GameEvent.RESET_POWER_UP]: () => void;
}
