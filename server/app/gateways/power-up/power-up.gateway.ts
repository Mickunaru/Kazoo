import { UserDocument } from '@app/model/database/user';
import { Room } from '@app/model/game-models/room/room';
import { ConnectionService } from '@app/services/connection/connection.service';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { UserManagerService } from '@app/services/user-manager/user-manager.service';
import { SUCCESS_RESPONSE } from '@common/constants/power-ups-constants';
import { PowerUpType } from '@common/enum/power-up-type';
import { PowerUpMap } from '@common/interfaces/event-maps';
import { GameEvent } from '@common/socket-events/game-event';
import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class PowerUpGateway {
    @WebSocketServer() server: Server<PowerUpMap>;
    constructor(
        private readonly roomsManagerService: RoomsManagerService,
        private readonly connectionService: ConnectionService,
        private readonly userManagerService: UserManagerService,
    ) {}

    @SubscribeMessage(GameEvent.ACTIVATE_POWER_UP)
    async activatePowerUp(@ConnectedSocket() client: Socket, @MessageBody() powerUpName: PowerUpType): Promise<string> {
        const userId = this.connectionService.userMap.getUserFromSocket(client.id);
        if (!userId) return '';
        const user = await this.userManagerService.getUserById(userId.uid);
        if (!user) return '';
        const roomId = this.roomsManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return '';
        const room = this.roomsManagerService.getRoom(roomId);
        if (!room) return '';

        const errorMessage = this.validatePowerUp(user, powerUpName, room);

        if (errorMessage !== null) {
            return errorMessage;
        }

        this.updatePowerUpCount(user, powerUpName);

        const content = powerUpName === PowerUpType.TRICHEUR ? room.getNextQuestionIncorrectAnswers() : null;

        Logger.log(`Power-up ${powerUpName} added by ${client.id}`, PowerUpGateway.name);

        room.nextQuestionPowerUps.set(client.id, { name: powerUpName, content: content ?? [] });

        return SUCCESS_RESPONSE;
    }

    private validatePowerUp(user: UserDocument, powerUpName: string, room: Room): string | null {
        if (!room.gameConfig.arePowerUpsEnabled) return null;
        else if (user?.powerUpsCount[powerUpName] < 1) return `Vous ne possédez pas de modificateur de partie ${powerUpName}`;
        else if (room.players.activePlayerCount <= 1 && powerUpName !== PowerUpType.TRICHEUR)
            return "Il n'y a pas d'autres joueurs dans la partie auxquels ce modificateur peut être appliqué.";
        else if (room.isLastQuestion()) return 'Les modificateurs ne peuvent pas être utilisés à la dernière question';
        else if (
            !room.isNextQuestionMultiChoice() &&
            (powerUpName === PowerUpType.TRICHEUR || powerUpName === PowerUpType.TORNADE || powerUpName === PowerUpType.CONFUSION)
        )
            return `Le modificateur ${powerUpName} ne peut pas être utilisé car la question suivante n'est pas une QCM.`;
        else return null;
    }

    private async updatePowerUpCount(user: UserDocument, powerUpName: string): Promise<void> {
        user.powerUpsCount[powerUpName]--;
        user.markModified('powerUpsCount');
        await user.save();
    }
}
