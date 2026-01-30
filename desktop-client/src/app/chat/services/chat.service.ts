import { Injectable, Injector, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { CHAT_NOTIFICATION_SOUND, SoundboardElement } from '@app/chat/chat.const';
import { ChatRoomCreationError } from '@app/chat/chat.error';
import { IpcEvent } from '@app/chat/services/ipc/ipc-event';
import { PageUrl } from '@app/enum/page-url';
import { SoundService } from '@app/shared/services/sound/sound.service';
import { ThemeConfigService } from '@app/shared/services/themeConfig/theme-config.service';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { ChatRoomDto } from '@common/interfaces/chat-room';
import { ChatRoomType, Message, MessageType } from '@common/interfaces/message';
import { SoundboardRequest } from '@common/interfaces/soundboard-request';
import { WsErrorDto } from '@common/interfaces/ws-error-dto';
import { ChatEvent } from '@common/socket-events/chat-event';
import { BehaviorSubject } from 'rxjs';
import { ChangeThemeNotifierService } from './change-theme-notifier/change-theme-notifier.service';
import { IpcService } from './ipc/ipc.service';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    currentRoom$ = new BehaviorSubject<ChatRoomDto | null>(null);
    availableRooms$ = new BehaviorSubject<ChatRoomDto[]>([]);
    isLoading$ = new BehaviorSubject<boolean>(true);

    joinedRooms: ChatRoomDto[] = [];
    messages: Message[] = [];
    chatterName: string;
    isChatVisible: boolean = true;
    isPoppedOut: boolean = false;
    isInitialized: boolean;
    communicationService: WebsocketService | IpcService;
    isWindow: boolean = false;

    // 3 out 4 services are only for init, not real injection
    // eslint-disable-next-line max-params
    constructor(
        private readonly ngZone: NgZone,
        private readonly themeConfigService: ThemeConfigService,
        private readonly changeThemeNotifier: ChangeThemeNotifierService,
        private readonly userAuthService: UserAuthService,
        private readonly soundService: SoundService,
        injector: Injector,
        router: Router,
    ) {
        this.isWindow = router.url.startsWith(`/${PageUrl.CHAT}`);
        this.communicationService = this.isWindow ? injector.get(IpcService) : injector.get(WebsocketService);

        this.chatterName = this.userAuthService.curUser?.username ?? router.parseUrl(router.url).queryParams['username'];
        themeConfigService.changeAppTheme(router.parseUrl(router.url).queryParams['theme']);

        this.initializeChat();
    }

    changeRoom(room: ChatRoomDto | null): void {
        this.currentRoom$.next(room);
        this.loadChatHistory();
        if (room) {
            room.unreadMessages = 0;
            this.communicationService.send(ChatEvent.SEE_UNREAD_MESSAGES, room.name);
        }
    }

    async joinRoom(name: string): Promise<void> {
        const room = await this.communicationService.sendWithAck<string, ChatRoomDto>(ChatEvent.JOIN_ROOM, name);
        this.availableRooms$.next(this.availableRooms$.value.filter((availableRoom) => availableRoom.name !== name));
        this.joinedRooms.push(room);
        this.changeRoom(room);
    }

    async leaveRoom(name: string): Promise<void> {
        await this.communicationService.sendWithAck(ChatEvent.LEAVE_ROOM, name);
        this.joinedRooms = this.joinedRooms.filter((room) => room.name !== name);
        this.updateOtherRooms();
    }

    deleteRoom(name: string): void {
        this.communicationService.send(ChatEvent.DELETE_ROOM, name);
    }

    sendMessage(text: string, type: MessageType, duration?: number): void {
        if (type === MessageType.SOUND && !duration) {
            throw new Error('Duration is required for audio messages');
        }
        if (!this.currentRoom$.value) {
            throw new Error('No room selected');
        }
        this.communicationService.send<Message>(ChatEvent.SEND_MESSAGE, {
            room: this.currentRoom$.value?.name,
            text,
            author: this.chatterName,
            type,
            date: new Date(),
            duration,
            avatar: this.userAuthService.curUser?.avatar ?? '',
        });
    }

    sendSoundboardMessage(sound: SoundboardElement): void {
        if (!this.currentRoom$.value) {
            throw new Error('No room selected');
        }

        this.communicationService.send<SoundboardRequest>(ChatEvent.SEND_SOUND, { sound: sound.url, room: this.currentRoom$.value.name });
    }

    async loadChatHistory() {
        this.messages = [];
        this.isLoading$.next(true);
        this.messages = await this.communicationService.sendWithAck<string, Message[]>(ChatEvent.SEND_CHAT_HISTORY, this.currentRoom$.value?.name);
        this.isLoading$.next(false);
    }

    openPopout() {
        if (window.electron) {
            window.electron.send(IpcEvent.OPEN_CHAT, {
                chatterName: this.chatterName,
                currentTheme: this.changeThemeNotifier.themeChangeObservable.value,
            });
            this.isPoppedOut = true;
        }
    }

    async createRoom(name: string): Promise<WsErrorDto | void> {
        const room = await this.communicationService.sendWithAck<string, ChatRoomDto | WsErrorDto>(ChatEvent.CREATE_CHAT_ROOM, name);
        if ((room as WsErrorDto).error) {
            throw new ChatRoomCreationError((room as WsErrorDto).error);
        } else {
            this.joinedRooms.push(room as ChatRoomDto);
            this.changeRoom(room as ChatRoomDto);
        }
    }

    async updateOtherRooms(): Promise<void> {
        const rooms = await this.communicationService.sendWithAck<void, ChatRoomDto[]>(ChatEvent.GET_OTHER_ROOMS);
        this.availableRooms$.next(this.sortChatRooms(rooms));
    }

    async updateJoinedRooms(): Promise<void> {
        const rooms = await this.communicationService.sendWithAck<void, ChatRoomDto[]>(ChatEvent.GET_JOINED_ROOMS);
        this.joinedRooms = this.sortChatRooms(rooms);
    }

    protected async initializeChat() {
        if (this.isInitialized) return;
        this.setUpIpcListeners();
        this.setUpWsListeners();
        this.isInitialized = true;
        this.refreshRooms();
    }

    private async refreshRooms() {
        await Promise.all([this.updateJoinedRooms(), this.updateOtherRooms()]);
    }

    private setUpWsListeners() {
        this.communicationService.on<Message>(ChatEvent.SEND_MESSAGE, (message) => {
            if (!message) return;
            if (message.author !== this.chatterName) this.soundService.playSound(CHAT_NOTIFICATION_SOUND);
            if (message.room !== this.currentRoom$.value?.name) {
                this.joinedRooms.forEach((room) => {
                    if (room.name === message.room) {
                        room.unreadMessages = room.unreadMessages ? room.unreadMessages + 1 : 1;
                    }
                });
                return;
            }
            this.messages.push(message);
            this.communicationService.send(ChatEvent.SEE_UNREAD_MESSAGES, message.room);
        });

        this.communicationService.on<string>(ChatEvent.SEND_SOUND, (sound) => {
            if (!sound) return;
            this.soundService.playSound(sound);
        });

        this.communicationService.on<string>(ChatEvent.DELETE_ROOM, (roomName) => {
            this.joinedRooms = this.joinedRooms.filter((room) => room.name !== roomName);
            this.availableRooms$.next(this.availableRooms$.value.filter((room) => room.name !== roomName));
            if (this.currentRoom$.value?.name === roomName) {
                this.changeRoom(null);
            }
        });

        this.communicationService.on<ChatRoomDto>(ChatEvent.CREATE_CHAT_ROOM, (room) => {
            if (!room) return;
            this.availableRooms$.next([...this.availableRooms$.value, room]);
        });

        this.communicationService.on<string>(ChatEvent.CREATOR_UPGRADE, (roomName) => {
            const roomToChange = this.joinedRooms.find((room) => room.name === roomName);
            if (roomToChange) {
                roomToChange.creator = this.chatterName;
            }
        });

        this.communicationService.on<ChatRoomDto>(ChatEvent.JOIN_ROOM, (room) => {
            if (!room) return;
            this.joinedRooms.push(room);
            this.joinedRooms = this.sortChatRooms(this.joinedRooms);
        });
    }

    private setUpIpcListeners() {
        if (window.electron) {
            window.electron.on(IpcEvent.CHAT_CLOSED, () => {
                this.ngZone.run(() => {
                    this.isPoppedOut = false;
                    this.refreshRooms();
                });
            });
            this.listenThemeOnDetachedChat();
            this.setupThemeListener(); // dont move this one gab
        }
    }

    private listenThemeOnDetachedChat() {
        window.electron?.on(IpcEvent.CHANGE_THEME, (theme) => {
            this.ngZone.run(() => {
                this.themeConfigService.changeAppTheme(theme);
            });
        });
    }

    private setupThemeListener() {
        if (!this.isWindow)
            this.changeThemeNotifier.themeChangeObservable.subscribe((theme) => {
                window.electron?.send(IpcEvent.CHANGE_THEME, theme);
            });
    }

    private sortChatRooms(chatRooms: ChatRoomDto[]): ChatRoomDto[] {
        const typeOrder: { [key in ChatRoomType]: number } = {
            [ChatRoomType.GENERAL]: 1,
            [ChatRoomType.GAME_ROOM]: 2,
            [ChatRoomType.TEAM_ROOM]: 3,
            [ChatRoomType.CUSTOM]: 4,
        };

        return chatRooms.sort((a, b) => {
            const typeComparison = typeOrder[a.type] - typeOrder[b.type];
            if (typeComparison !== 0) return typeComparison;

            return a.name.localeCompare(b.name);
        });
    }
}
