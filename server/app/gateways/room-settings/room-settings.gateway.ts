/* eslint-disable @typescript-eslint/member-ordering */
// For lifecycle method
import { ChatRoomManagerService } from '@app/chat/chat-room-manager.service';
import { ChatRoom } from '@app/model/database/chat-room';
import { Room } from '@app/model/game-models/room/room';
import { CurrencyService } from '@app/services/currency/currency.service';
import { GameLobbyService } from '@app/services/game-lobby/game-lobby.service';
import { HomeLobbyService } from '@app/services/home-lobby/home-lobby.service';
import { PowerUpService } from '@app/services/power-up/power-up.service';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { S3Service } from '@app/services/s3-upload/s3.service';
import { ParseStringPipe } from '@app/validation-pipes/parse-string-pipe';
import { TEAM_NUMBER_LIMIT } from '@common/constants/team-constants';
import { GameMode } from '@common/enum/game-mode';
import { StartGameStatus } from '@common/enum/start-game-status';
import { TeamCreationResponse } from '@common/enum/team-creation-response';
import { ChatRoomDto } from '@common/interfaces/chat-room';
import { RoomSettingsMap } from '@common/interfaces/event-maps';
import { ChatRoomType } from '@common/interfaces/message';
import { Team, TeamId } from '@common/interfaces/team';
import { ChatEvent } from '@common/socket-events/chat-event';
import { GameEvent } from '@common/socket-events/game-event';
import { HomeEvent } from '@common/socket-events/home-event';
import { RoomEvent } from '@common/socket-events/room-event';
import { Logger } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class RoomsSettingGateway implements OnGatewayInit, OnGatewayDisconnect {
    @WebSocketServer() server: Server<RoomSettingsMap>;
    // eslint-disable-next-line max-params
    constructor(
        private readonly logger: Logger,
        private readonly currencyService: CurrencyService,
        private readonly roomsManagerService: RoomsManagerService,
        private readonly homeLobbyService: HomeLobbyService,
        private readonly gameLobbyService: GameLobbyService,
        private readonly chatRoomManagerService: ChatRoomManagerService,
        private readonly powerUpService: PowerUpService,
        private readonly s3Service: S3Service,
    ) {}

    afterInit(server: Server) {
        this.gameLobbyService.server = server;
    }

    @SubscribeMessage(RoomEvent.CAN_JOIN_ROOM)
    async canJoinRoom(@ConnectedSocket() client: Socket<RoomSettingsMap>, @MessageBody(ParseStringPipe) roomId: string) {
        const room = this.roomsManagerService.getRoom(roomId);
        return await this.gameLobbyService.canPlayerJoinRoom(client.id, room);
    }

    @SubscribeMessage(RoomEvent.JOIN_ROOM)
    async joinRoom(@ConnectedSocket() client: Socket<RoomSettingsMap>, @MessageBody(ParseStringPipe) roomId: string) {
        const room = this.roomsManagerService.getRoom(roomId);
        if (!room) return;

        let chatRoom: ChatRoom | null;
        const chatRoomId = this.chatRoomManagerService.formatRoomChatId(roomId);
        if (room.gameMaster.socketId === client.id) {
            chatRoom = (await this.chatRoomManagerService.createRoom(
                chatRoomId,
                ChatRoomType.GAME_ROOM,
                room.gameConfig.hasSoundboard,
            )) as ChatRoomDto;
            await this.organiserJoin(client, roomId, room);
        } else {
            chatRoom = await this.chatRoomManagerService.getRoomByName(chatRoomId);
            await this.playerJoin(client, roomId, room);
        }
        await this.payEntryPrice(client, room);
        await this.chatRoomManagerService.joinRoom(client, chatRoomId); // HashTag for Game Room
        if (chatRoom) {
            client.emit(
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
        }
        return {
            gameMode: room.gameConfig.gameMode,
            arePowerUpsEnabled: room.gameConfig.arePowerUpsEnabled,
        };
    }

    @SubscribeMessage(RoomEvent.START_GAME)
    async startGame(@ConnectedSocket() client: Socket<RoomSettingsMap>) {
        const roomId = this.roomsManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return;
        const room = this.roomsManagerService.getRoom(roomId);
        if (!room || !this.roomsManagerService.isGameMaster(client.id)) return;

        const startGameStatus = this.gameLobbyService.canGameBeStarted(room);
        if (startGameStatus !== StartGameStatus.CAN_CREATE) return startGameStatus;

        if (room.isRandomGame) {
            await this.gameLobbyService.transformOrganizerToPlayer(room, roomId, client.id);
            this.homeLobbyService.playerJoin(roomId);
        }
        if (room.gameConfig.gameMode === GameMode.TEAM) {
            await this.joinChatRoom(roomId, room);
        }

        this.powerUpService.resetPowerUps(roomId);

        room.setStartGameState();
        if (room.gameConfig.gameMode === GameMode.ELIMINATION) room.gameMaster.hasLeft = true;
        this.server.to(roomId).emit(GameEvent.NEXT_QUESTION, room.currentQuestion);
        this.homeLobbyService.updateRoomState(roomId, room.roomState);
        try {
            await this.gameLobbyService.startGameSequence(roomId, room);
            room.moneyPool = room.payers * room.gameConfig.entryPrice;
        } catch (error) {
            this.logger.error(error, 'RoomManager');
            return null;
        }
        return startGameStatus;
    }

    @SubscribeMessage(RoomEvent.BAN)
    banPlayer(@ConnectedSocket() client: Socket<RoomSettingsMap>, @MessageBody(ParseStringPipe) playerName: string) {
        const roomId = this.roomsManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return;
        const room = this.roomsManagerService.getRoom(roomId);
        if (!room || !this.roomsManagerService.isGameMaster(client.id)) return;

        this.gameLobbyService.banPlayer(playerName, room);
        this.gameLobbyService.updateParticipantList(roomId, room);
    }

    @SubscribeMessage(RoomEvent.UPDATE_PARTICIPANT_LIST)
    updateParticipantsList(@ConnectedSocket() client: Socket<RoomSettingsMap>) {
        const roomId = this.roomsManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return;
        const room = this.roomsManagerService.getRoom(roomId);
        if (!room) return;

        this.gameLobbyService.updateParticipantList(roomId, room);
    }

    @SubscribeMessage(RoomEvent.SWITCH_LOCK)
    lockRoom(@ConnectedSocket() client: Socket<RoomSettingsMap>) {
        const roomId = this.roomsManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return;
        const room = this.roomsManagerService.getRoom(roomId);
        if (!room || !this.roomsManagerService.isGameMaster(client.id)) return;

        this.gameLobbyService.lockRoom(roomId, room);
        this.homeLobbyService.updateRoomState(roomId, room.roomState);
    }

    @SubscribeMessage(RoomEvent.LEAVE_GAME)
    clientLeavesGame(@ConnectedSocket() client: Socket<RoomSettingsMap>) {
        this.handleDisconnect(client);
    }

    @SubscribeMessage(RoomEvent.CREATE_TEAM)
    createTeam(@ConnectedSocket() client: Socket<RoomSettingsMap>, @MessageBody() teamId: TeamId) {
        const roomId = this.roomsManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return;
        const room = this.roomsManagerService.getRoom(roomId);
        if (!room || !teamId.name) return;
        if (room.teams.has(teamId.name)) return TeamCreationResponse.TEAM_NAME_TAKEN;
        if (room.teams.size === TEAM_NUMBER_LIMIT) return TeamCreationResponse.MAXIMUM_TEAM_LIMIT_REACHED;

        const player = room.players.getPlayerFromSocket(client.id);
        if (!player) return;
        player.teamName = teamId.name;
        const [icon, color] = this.gameLobbyService.getRandomColor(room.teams.size, room);
        const team: Team = { ...teamId, icon, color };
        room.teams.set(team.name, team);
        this.gameLobbyService.updateTeamList(roomId, room);
        this.gameLobbyService.updateParticipantList(roomId, room);

        return TeamCreationResponse.TEAM_CREATED;
    }

    @SubscribeMessage(RoomEvent.UPDATE_TEAMS)
    updateTeams(@ConnectedSocket() client: Socket<RoomSettingsMap>) {
        const roomId = this.roomsManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return;
        const room = this.roomsManagerService.getRoom(roomId);
        if (!room) return;
        client.emit(RoomEvent.UPDATE_TEAMS, [...room.teams.values()]);
    }

    @SubscribeMessage(RoomEvent.SELECT_TEAM)
    selectTeam(@ConnectedSocket() client: Socket<RoomSettingsMap>, @MessageBody() teamId: TeamId) {
        const roomId = this.roomsManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return;
        const room = this.roomsManagerService.getRoom(roomId);
        if (!room) return;
        const player = room.players.getPlayerFromSocket(client.id);
        if (!player) return;
        player.teamName = teamId.name;
        this.gameLobbyService.updateTeamList(roomId, room);
        this.gameLobbyService.updateParticipantList(roomId, room);
    }

    async handleDisconnect(client: Socket<RoomSettingsMap>) {
        this.logger.debug(`All Rooms ${[...this.roomsManagerService.rooms.keys()].join(' ')}`, 'RoomManager');
        const roomId = this.roomsManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return;
        const room = this.roomsManagerService.getRoom(roomId);
        this.logger.log(`Client disconnected: ${room?.players.getPlayerFromSocket(client.id) ?? client.id} for room ${roomId}`, 'RoomManager');
        if (!room) return;

        client.leave(roomId);
        room.clientLeft(client.id);

        this.logger.log(
            `Room ${roomId}, Player Count: ${room.players.playerNotLeftCount}, GameMaster in: ${!room.gameMaster.hasLeft}`,
            'RoomManager',
        );

        const giveBackMoneyPromise = this.giveBackMoney(client, room);

        const chatGameId = this.chatRoomManagerService.formatRoomChatId(roomId);
        const leaveChatRoomPromise = this.chatRoomManagerService.leaveRoom(chatGameId, client);
        client.emit(ChatEvent.DELETE_ROOM, chatGameId); // delete room from client

        if (this.gameLobbyService.shouldDestroyRoom(room)) {
            const roomDestructionReason = this.gameLobbyService.roomDestructionReason(client, room);
            this.server.to(roomId).emit(RoomEvent.LEAVE_GAME, roomDestructionReason);
            await this.destroyRoom(roomId, room);
        }

        const player = room.players.getPlayerFromSocket(client.id);
        if (player) {
            await this.playerLeft(roomId, room);
            if (player.teamName) {
                const chatTeamId = this.chatRoomManagerService.formatTeamChatId(roomId, player.teamName);
                client.emit(ChatEvent.DELETE_ROOM, chatTeamId);
                await this.chatRoomManagerService.leaveRoom(chatTeamId, client);
            }
        }

        await giveBackMoneyPromise;
        await leaveChatRoomPromise;
    }

    private async joinChatRoom(roomId: string, room: Room) {
        const teamChats = await this.createTeamChatRooms(roomId, room);
        const clients = await this.server.to(roomId).fetchSockets();

        for (const [, player] of room.players.activePlayers) {
            const client = clients.find((c) => c.id === player.socketId);
            if (!client) continue;
            const chatTeamId = this.chatRoomManagerService.formatTeamChatId(roomId, player.teamName);
            await this.chatRoomManagerService.joinRoom(client, chatTeamId);
        }
        this.gameLobbyService.createTeamChats(room, teamChats);
    }

    private async createTeamChatRooms(roomId: string, room: Room) {
        const teamChats = new Map<string, ChatRoom>();
        for (const teamName of room.teams.keys()) {
            const chatTeamId = this.chatRoomManagerService.formatTeamChatId(roomId, teamName);
            const teamChat = await this.chatRoomManagerService.createRoom(chatTeamId, ChatRoomType.TEAM_ROOM, room.gameConfig.hasSoundboard);
            if ('error' in teamChat) {
                this.logger.error(`TEAM CHAT COULD NOT BE CREATE ${teamChat}`, 'RoomManager');
                continue;
            }
            teamChats.set(teamName, teamChat);
        }
        return teamChats;
    }

    private async playerJoin(client: Socket<RoomSettingsMap>, roomId: string, room: Room) {
        if (!(await this.gameLobbyService.tryAddPlayer(client.id, room))) return;

        client.join(roomId);
        this.gameLobbyService.updateTeamList(roomId, room);
        this.gameLobbyService.updateParticipantList(roomId, room);
        await this.homeLobbyService.playerJoin(roomId);
        this.logger.log(`(${client.id}) joined room: ${roomId}`, 'RoomManager');
    }

    private async organiserJoin(client: Socket<RoomSettingsMap>, roomId: string, room: Room) {
        client.join(roomId);
        await this.homeLobbyService.masterJoin(roomId, room);
        this.logger.log(`Organizer (${client.id}) joined room: ${roomId}`, 'RoomManager');
    }

    private async destroyRoom(roomId: string, room: Room) {
        room.destroy();
        this.roomsManagerService.destroyRoom(roomId);
        this.homeLobbyService.destroyRoom(roomId);
        const chatRoomId = this.chatRoomManagerService.formatRoomChatId(roomId);
        await this.chatRoomManagerService.deleteRoom(chatRoomId);
        for (const teamName of room.teams.keys()) {
            const chatTeamId = this.chatRoomManagerService.formatTeamChatId(roomId, teamName);
            await this.chatRoomManagerService.deleteRoom(chatTeamId);
        }
        await this.s3Service.emptyFolder(`drawings/${roomId}/`);
    }

    private async playerLeft(roomId: string, room: Room) {
        this.gameLobbyService.updateParticipantList(roomId, room);
        this.server.to(room.gameMaster.socketId).emit(RoomEvent.UPDATE_PLAYERS_STATS, room.getPlayersStats());
        await this.homeLobbyService.playerLeave(roomId);
    }

    private async payEntryPrice(client: Socket, room: Room) {
        if (room.gameConfig.entryPrice === 0) return;

        const player = room.players.getPlayerFromSocket(client.id);
        if (room.gameMaster.socketId === client.id && room.gameConfig.gameMode === GameMode.ELIMINATION) {
            const currency = await this.currencyService.subtractCurrencyByUsername(room.gameMaster.name, room.gameConfig.entryPrice);
            client.emit(HomeEvent.UPDATE_USER_MONEY, { currency });
            room.payers++;
        } else if (player) {
            const currency = await this.currencyService.subtractCurrencyByUsername(player.name, room.gameConfig.entryPrice);
            client.emit(HomeEvent.UPDATE_USER_MONEY, { currency });
            room.payers++;
        }
    }

    private async giveBackMoney(client: Socket, room: Room) {
        if (room.gameConfig.entryPrice < 1) return;
        if (room.moneyPool > 0) return;
        const player = room.players.getPlayerFromSocket(client.id);
        if (!player) {
            this.logger.warn('Could not give money back to player', 'RoomGateway');
            return;
        }
        const currency = await this.currencyService.addCurrencyUsername(player.name, room.gameConfig.entryPrice);
        client.emit(HomeEvent.UPDATE_USER_MONEY, { currency });
    }
}
