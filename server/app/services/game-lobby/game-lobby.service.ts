import { START_GAME_COUNTDOWN } from '@app/constants/time-constants';
import { ChatRoom } from '@app/model/database/chat-room';
import { Room } from '@app/model/game-models/room/room';
import { ConnectionService } from '@app/services/connection/connection.service';
import { CurrencyService } from '@app/services/currency/currency.service';
import { FriendService } from '@app/services/friend/friend.service';
import { UserManagerService } from '@app/services/user-manager/user-manager.service';
import { paleColors } from '@common/constants/team-constants';
import { GameMode } from '@common/enum/game-mode';
import { RoomAccessStatus } from '@common/enum/room-access-status';
import { RoomDestructionReason } from '@common/enum/room-destruction-reason';
import { RoomState } from '@common/enum/room-state';
import { StartGameStatus } from '@common/enum/start-game-status';
import { TimerType } from '@common/enum/timer-type';
import { ChatEvent } from '@common/socket-events/chat-event';
import { RoomEvent } from '@common/socket-events/room-event';
import { TimerEvent } from '@common/socket-events/timer-event';
import { Injectable, Logger } from '@nestjs/common';
import { defaultIfEmpty, firstValueFrom } from 'rxjs';
import { Server, Socket } from 'socket.io';

@Injectable()
export class GameLobbyService {
    server: Server;
    // eslint-disable-next-line max-params
    constructor(
        private readonly connectionService: ConnectionService,
        private readonly friendService: FriendService,
        private readonly currencyService: CurrencyService,
        private readonly userManagerService: UserManagerService,
        private readonly logger: Logger,
    ) {}

    async canPlayerJoinRoom(clientId: string, room?: Room): Promise<RoomAccessStatus> {
        if (!room) return RoomAccessStatus.DELETED;

        // TODO: Change Max Player Count
        const MAX_PLAYERS = 8;
        if (room.players.activePlayerCount >= MAX_PLAYERS) return RoomAccessStatus.MAX_PLAYER_COUNT_REACHED;

        const userId = this.connectionService.userMap.getUserFromSocket(clientId);
        if (!userId) return RoomAccessStatus.HIDDEN;

        const friends = new Set(await this.friendService.getAllFriendUsernames(userId.username));
        if (room.isPlayerBanned(userId.username)) return RoomAccessStatus.HIDDEN;
        if (room.gameConfig.isFriendsOnly && !friends.has(room.gameMaster.name)) return RoomAccessStatus.FRIEND_ONLY;
        if (room.gameConfig.entryPrice > (await this.currencyService.getCurrency(userId.uid))) return RoomAccessStatus.NOT_ENOUGH_MONEY;

        if (room.isLocked) return RoomAccessStatus.LOCKED;

        return RoomAccessStatus.OPENED;
    }

    banPlayer(playerName: string, room: Room) {
        const player = room.players.getPlayerFromName(playerName);
        if (!player) return;

        room.banPlayer(playerName);
        this.server.to(player.socketId).emit(RoomEvent.BAN);
    }

    lockRoom(roomId: string, room: Room) {
        room.switchLockState();
        this.server.to(roomId).emit(RoomEvent.SWITCH_LOCK, room.isLocked);
    }

    async tryAddPlayer(clientId: string, room: Room) {
        const player = this.connectionService.userMap.getUserFromSocket(clientId);
        if (!player) return false;

        if (room.isLocked || !room.isPlayerNameValid(player.username)) return false;

        const user = await this.userManagerService.getUserByUsername(player.username);
        if (!user) return false;

        room.players.addPlayer(clientId, user);

        return true;
    }

    updateParticipantList(roomId: string, room: Room) {
        this.server.to(roomId).emit(RoomEvent.UPDATE_PARTICIPANT_LIST, room.getPlayerList());
    }

    updateTeamList(roomId: string, room: Room) {
        this.server.to(roomId).emit(RoomEvent.UPDATE_TEAMS, [...room.teams.values()]);
    }

    async transformOrganizerToPlayer(room: Room, roomId: string, clientId: string) {
        const userId = this.connectionService.userMap.getUserFromSocket(clientId);
        if (!userId) return;

        const user = await this.userManagerService.getUserByUsername(userId.username);
        if (!user) return;
        room.players.addPlayer(clientId, user);
        this.updateParticipantList(roomId, room);
    }

    shouldDestroyRoom(room: Room) {
        const gameMasterHasLeft = room.gameMaster.hasLeft;
        const allPlayersHaveLeft = room.players.playerNotLeftCount === 0;

        switch (room.roomState) {
            case RoomState.OPEN:
            case RoomState.LOCKED:
                return gameMasterHasLeft;
            case RoomState.IN_GAME:
                if (room.isRandomGame) return allPlayersHaveLeft;
                return gameMasterHasLeft || allPlayersHaveLeft;
            case RoomState.FINISHED:
                if (room.isRandomGame) return allPlayersHaveLeft;
                return gameMasterHasLeft && allPlayersHaveLeft;
        }
    }

    async startGameSequence(roomId: string, room: Room) {
        this.setupRoomTimerEvents(roomId, room);
        await this.startWaitingRoomTimer(room, roomId);

        this.server.to(roomId).emit(TimerEvent.TIMER_STARTED, TimerType.AnswerDuration);
        room.startNextQuestionTimer();
    }

    canGameBeStarted(room: Room): StartGameStatus {
        switch (room.gameConfig.gameMode) {
            case GameMode.TEAM: {
                if (room.players.activePlayers.some(([, player]) => !player.teamName)) return StartGameStatus.PLAYER_HAS_NO_TEAM;

                const countPerTeam = this.minimumPlayerCountPerTeam(room);
                const completeTeamCount = countPerTeam.filter((count) => count === 2).length;
                if (completeTeamCount < 2) return StartGameStatus.NOT_ENOUGH_TEAMS;
                if (!countPerTeam.every((count) => count === 0 || count === 2)) return StartGameStatus.NOT_ENOUGH_PLAYERS_PER_TEAM;
                break;
            }
            case GameMode.CLASSIC:
                if (room.gameConfig.entryPrice && room.players.activePlayerCount < 2) return StartGameStatus.NOT_ENOUGH_PLAYERS;
                if (room.players.activePlayerCount < 1) return StartGameStatus.NOT_ENOUGH_PLAYERS;
                break;
            case GameMode.ELIMINATION:
                if (room.players.activePlayerCount < 1) return StartGameStatus.NOT_ENOUGH_PLAYERS;
                break;
        }

        if (!room.isLocked) return StartGameStatus.UNLOCKED;

        return StartGameStatus.CAN_CREATE;
    }

    minimumPlayerCountPerTeam(room: Room) {
        const countByTeam = room.players.activePlayers.reduce((playerCountPerTeam, [, player]) => {
            if (!player.teamName) return playerCountPerTeam;
            playerCountPerTeam.set(player.teamName, (playerCountPerTeam.get(player.teamName) ?? 0) + 1);
            return playerCountPerTeam;
        }, new Map<string, number>());
        return [...countByTeam.values()];
    }

    getRandomColor(colorIndex: number, room: Room) {
        return colorIndex < paleColors.length ? room.randomTeamConfigs[colorIndex] : ['', ''];
    }

    createTeamChats(room: Room, chatRooms: Map<string, ChatRoom>) {
        room.players.forEach((player) => {
            const chatRoom = chatRooms.get(player.teamName);
            if (!chatRoom) return;
            this.server.to(player.socketId).emit(
                ChatEvent.JOIN_ROOM,
                // weirdly unpacking the room like this: { unreadMessages: 0, ...room } leads to errors
                {
                    name: chatRoom.name,
                    type: chatRoom.type,
                    members: chatRoom.members,
                    creator: chatRoom.creator,
                    hasSoundboard: chatRoom.hasSoundboard,
                    unreadMessages: 0,
                },
            );
        });
    }

    roomDestructionReason(client: Socket, room: Room) {
        if (room.roomState === RoomState.FINISHED) return RoomDestructionReason.GAME_FINISHED;

        if (room.players.playerNotLeftCount === 0) return RoomDestructionReason.ALL_PLAYER_LEFT;

        if (room.gameMaster.socketId === client.id) return RoomDestructionReason.ORGANIZER_LEFT;
        return RoomDestructionReason.GAME_FINISHED;
    }

    private setupRoomTimerEvents(roomId: string, room: Room) {
        room.timer.tick.subscribe((time) => {
            this.server.to(roomId).emit(TimerEvent.TIMER_TICK, time);
            this.logger.debug(`Room: ${roomId} ${time}`, 'Timer');
        });

        room.timer.end.subscribe(() => {
            this.server.to(roomId).emit(TimerEvent.TIMER_ENDED);
            this.logger.debug(`Room: ${roomId} Timer Ended`, 'Timer');
        });
    }

    private async startWaitingRoomTimer(room: Room, roomId: string) {
        room.timer.startCountdown(START_GAME_COUNTDOWN);
        this.server.to(roomId).emit(TimerEvent.TIMER_STARTED, TimerType.GameStart);
        await firstValueFrom(room.timer.end.pipe(defaultIfEmpty(null)));
    }
}
