import { Injectable } from '@angular/core';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { PlayerPrize } from '@common/interfaces/player-prize';
import { GameEvent } from '@common/socket-events/game-event';

@Injectable({
    providedIn: 'root',
})
export class PrizeService {
    gamePrize: number = 0;
    potPrize: number = 0;
    constructor(private readonly websocketService: WebsocketService) {}

    initialize(): void {
        this.websocketService.on<PlayerPrize>(GameEvent.MONEY_PRIZE, (prize) => {
            if (!prize) return;
            this.gamePrize = prize.gamePrize;
            this.potPrize = prize.potPrize;
        });
    }

    removeListeners(): void {
        this.websocketService.removeAllListeners(GameEvent.MONEY_PRIZE);
        this.gamePrize = 0;
        this.potPrize = 0;
    }
}
