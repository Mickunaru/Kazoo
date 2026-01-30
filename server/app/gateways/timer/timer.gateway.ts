import { Room } from '@app/model/game-models/room/room';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { PANIC_ACTIVATION_CUTOFF, PANIC_ACTIVATION_CUTOFF_REVIEWABLE_QUESTION } from '@common/constants/game-constants';
import { QuestionType } from '@common/enum/question-type';
import { TimerEventMap } from '@common/interfaces/event-maps';
import { TimerEvent } from '@common/socket-events/timer-event';
import { Logger } from '@nestjs/common';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class TimerGateway {
    @WebSocketServer() server: Server<TimerEventMap>;

    constructor(
        private roomManagerService: RoomsManagerService,
        private logger: Logger,
    ) {}

    @SubscribeMessage(TimerEvent.STOP_TIMER)
    stopTimer(@ConnectedSocket() client: Socket) {
        const roomId = this.roomManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return;
        const room = this.roomManagerService.getRoom(roomId);
        if (!room) return;
        room.timer.stopCountdown();
    }

    @SubscribeMessage(TimerEvent.RESUME_TIMER)
    resumeTimer(@ConnectedSocket() client: Socket) {
        const roomId = this.roomManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return;
        const room = this.roomManagerService.getRoom(roomId);
        if (!room) return;
        room.timer.resumeCountdown();
    }

    @SubscribeMessage(TimerEvent.PANIC_TIMER)
    panicTimer(@ConnectedSocket() client: Socket) {
        this.logger.log('Panic mode switch');
        const roomId = this.roomManagerService.getRoomIdWithClientId(client.id);
        if (!roomId) return;
        const room = this.roomManagerService.getRoom(roomId);
        if (!room) return;
        if (this.isEligibleForPanicToggle(room)) {
            room.timer.togglePanicMode();
            this.server.to(roomId).emit(TimerEvent.PANIC_TIMER);
        }
    }

    isEligibleForPanicToggle(room: Room) {
        const question = room.currentQuestion;
        if (room.timer.isPanicked) return false;
        switch (question.type) {
            case QuestionType.MultiChoice:
            case QuestionType.Estimation:
                return room.timer.time >= PANIC_ACTIVATION_CUTOFF;
            case QuestionType.OpenEnded:
            case QuestionType.Drawing:
                return room.timer.time >= PANIC_ACTIVATION_CUTOFF_REVIEWABLE_QUESTION;
        }
    }
}
