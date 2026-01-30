import { DocumentNotFoundError } from '@app/exceptions/document-not-found-exception';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { WAITING_ROOM_ENDPOINT } from '@common/constants/endpoint-constants';
import { GameConfigDto } from '@common/interfaces/game-config-dto';
import { RoomId } from '@common/interfaces/room-id';
import { Body, Controller, HttpCode, HttpStatus, NotFoundException, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('WaitingRoom')
@Controller(WAITING_ROOM_ENDPOINT)
export class WaitingRoomController {
    constructor(private readonly roomManagerService: RoomsManagerService) {}

    @ApiOperation({ summary: 'Creates a new room' })
    @ApiCreatedResponse({ description: 'Created roomId', type: String })
    @ApiNotFoundResponse({ description: 'Specified game does not exist' })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createRoom(@Body('gameConfig') gameConfig: GameConfigDto, @Body('creatorId') creatorId: string): Promise<RoomId> {
        try {
            const roomId = await this.roomManagerService.createRoom(gameConfig, creatorId);
            return { roomId };
        } catch (error) {
            if (error instanceof DocumentNotFoundError) {
                throw new NotFoundException(error.message);
            }
            throw error;
        }
    }
}
