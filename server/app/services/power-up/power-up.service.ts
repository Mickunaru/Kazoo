import { Room } from '@app/model/game-models/room/room';
import { GameMode } from '@common/enum/game-mode';
import { PowerUpType } from '@common/enum/power-up-type';
import { GameEvent } from '@common/socket-events/game-event';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class PowerUpService {
    server: Server;
    vitessePowerUpSenderIds: string[] = [];

    resetPowerUps(roomId: string) {
        this.server.to(roomId).emit(GameEvent.RESET_POWER_UP);
    }

    enablePowerUps(roomId: string, room: Room) {
        this.resetPowerUps(roomId);

        const gameMasterId = room.gameMaster.socketId;
        const isElimination = room.gameConfig.gameMode === GameMode.ELIMINATION;
        const isTeam = room.gameConfig.gameMode === GameMode.TEAM;

        for (const [clientId, powerUp] of room.nextQuestionPowerUps.entries()) {
            const { name, content } = powerUp;

            switch (name) {
                case PowerUpType.TRICHEUR:
                    this.server.to(clientId).emit(GameEvent.ACTIVATE_POWER_UP, { name, content });
                    break;
                case PowerUpType.VITESSE:
                    this.vitessePowerUpSenderIds.push(clientId);
                    break;
                default:
                    if (isElimination) {
                        const activeSocketIds = room.players.getActiveSocketIds();
                        for (const socketId of activeSocketIds) {
                            if (socketId !== clientId) {
                                this.server.to(socketId).emit(GameEvent.ACTIVATE_POWER_UP, { name });
                            }
                        }
                    } else if (isTeam) {
                        const teamPlayerSocketIds = room.players.getTeamSocketIdsFromSocket(clientId);
                        this.server
                            .to(roomId)
                            .except([...teamPlayerSocketIds, gameMasterId])
                            .emit(GameEvent.ACTIVATE_POWER_UP, { name });
                    } else {
                        this.server.to(roomId).except([clientId, gameMasterId]).emit(GameEvent.ACTIVATE_POWER_UP, { name });
                    }
            }
        }
        room.nextQuestionPowerUps.clear();
    }

    activatePowerUpOnSubmit(cliendId: string, roomId: string, room: Room) {
        if (!this.vitessePowerUpSenderIds.includes(cliendId)) return;

        const recipients =
            room.gameConfig.gameMode === GameMode.ELIMINATION ? this.server.to(roomId) : this.server.to(roomId).except(room.gameMaster.socketId);

        recipients.emit(GameEvent.ACTIVATE_POWER_UP, { name: PowerUpType.VITESSE });

        room.timer.time = 3;
        this.vitessePowerUpSenderIds = [];
    }
}
