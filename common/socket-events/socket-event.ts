import { AuthEvent } from './auth-event';
import { ChatEvent } from './chat-event';
import { FriendEvent } from './friend-event';
import { GameEvent } from './game-event';
import { HomeEvent } from './home-event';
import { NotificationEvent } from './notification-event';
import { RoomEvent } from './room-event';
import { TimerEvent } from './timer-event';

export type SocketEvent = RoomEvent | GameEvent | TimerEvent | ChatEvent | AuthEvent | HomeEvent | NotificationEvent | FriendEvent;
