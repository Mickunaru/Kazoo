import { User } from '@app/model/database/user';
import { Player } from '@app/model/game-models/player/player';
import { GameMode } from '@common/enum/game-mode';
import { PlayerInfo, PlayerStatus } from '@common/interfaces/player-info';
import { PlayerDto } from '@common/interfaces/playerDto';

export class PlayerMap {
    private readonly nameToPlayerMap = new Map<string, Player>();

    // the name is the key and the socket the value
    private readonly socketToNameMap = new Map<string, string>();

    get size(): number {
        return this.nameToPlayerMap.size;
    }

    get activePlayerCount(): number {
        return this.activePlayers.length;
    }

    get playerNotLeftCount() {
        return this.playerNotLeft.length;
    }

    get activePlayers() {
        return Array.from(this.nameToPlayerMap).filter(([, player]) => player.isInGame());
    }

    get playerNotLeft() {
        return Array.from(this.nameToPlayerMap).filter(([, player]) => player.status !== PlayerStatus.Left);
    }

    get allPlayers() {
        return Array.from(this.nameToPlayerMap);
    }

    get highestScore(): number {
        let highestScore = 0;
        this.nameToPlayerMap.forEach((player: Player) => {
            if (player.score > highestScore) {
                highestScore = player.score;
            }
        });
        return highestScore;
    }

    getPlayerFromName(name: string): Player | undefined {
        return this.nameToPlayerMap.get(name.trim());
    }

    getPlayerFromSocket(socketId: string): Player | undefined {
        const name = this.socketToNameMap.get(socketId);
        return name ? this.getPlayerFromName(name) : undefined;
    }

    getTeamSocketIdsFromSocket(socketId: string): string[] {
        const result: string[] = [];
        const player = this.getPlayerFromSocket(socketId);
        if (!player) return result;

        const teamName = player.teamName;

        for (const [socket, name] of this.socketToNameMap.entries()) {
            const teamMember = this.nameToPlayerMap.get(name);
            if (teamMember && teamMember.teamName === teamName) {
                result.push(socket);
            }
        }

        return result;
    }

    addPlayer(socketId: string, user: User) {
        const { username, avatar } = user;
        if (this.nameToPlayerMap.has(username.trim())) {
            const player = this.nameToPlayerMap.get(username.trim());
            if (!player) return;
            player.status = PlayerStatus.Pending;
            player.imageUrl = avatar;
        } else {
            const player = new Player(socketId, username.trim());
            player.imageUrl = avatar;
            this.nameToPlayerMap.set(username.trim(), player);
        }
        this.socketToNameMap.set(socketId, username.trim());
    }

    resetPlayersStateForNextQuestion() {
        this.nameToPlayerMap.forEach((player: Player) => {
            if (player.isInGame()) player.status = PlayerStatus.Pending;
            player.clearPoints();
        });
    }

    hasName(name: string): boolean {
        return this.nameToPlayerMap.has(name.trim());
    }

    hasSocketId(socketId: string): boolean {
        return this.socketToNameMap.has(socketId);
    }

    hasNotLeft(socketId: string): boolean {
        const player = this.getPlayerFromSocket(socketId);
        return !!player && player.status !== PlayerStatus.Left;
    }

    isPlayerActive(name: string): boolean {
        return (this.hasName(name) && this.getPlayerFromName(name)?.isInGame()) ?? false;
    }

    getActiveSocketIds(): string[] {
        const activeSocketIds: string[] = [];

        for (const [socketId, name] of this.socketToNameMap.entries()) {
            const player = this.nameToPlayerMap.get(name);
            if (player && player.isInGame()) {
                activeSocketIds.push(socketId);
            }
        }

        return activeSocketIds;
    }

    forEach(callback: (player: Player, name?: string) => void) {
        this.nameToPlayerMap.forEach(callback);
    }

    getStats(gameMode: GameMode): PlayerInfo[] {
        return GameMode.TEAM === gameMode ? this.getTeamStats() : this.getPlayerStats();
    }

    getPlayerStats(): PlayerInfo[] {
        return Array.from(
            this.nameToPlayerMap,
            ([username, player]): PlayerInfo => ({
                username,
                score: player.score,
                bonusCount: player.bonusCount,
                status: player.status,
            }),
        );
    }

    getTeamStats(): PlayerInfo[] {
        const teamMap = new Map<string, PlayerInfo>();

        for (const player of this.nameToPlayerMap.values()) {
            if (!teamMap.has(player.teamName)) {
                teamMap.set(player.teamName, {
                    username: player.teamName,
                    score: 0,
                    bonusCount: 0,
                    status: PlayerStatus.Pending,
                });
            }

            const team = teamMap.get(player.teamName);
            if (!team) continue;
            team.score += player.score;
            team.bonusCount += player.bonusCount;
        }

        return Array.from(teamMap.values());
    }

    getPlayerList(): PlayerDto[] {
        return Array.from(
            this.nameToPlayerMap,
            ([username, player]): PlayerDto => ({
                username,
                teamName: player.teamName,
                hasLeft: !player.isInGame(),
                imageUrl: player.imageUrl,
            }),
        );
    }
}
