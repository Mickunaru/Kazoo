import { Injectable } from '@angular/core';
import { RELAY_RECEIVED_WS_EVENT, SEND_WS_ACK, SEND_WS_EVENT } from '@app/chat/chat.const';
import { HomeEvent } from '@common/socket-events/home-event';
import { SocketEvent } from '@common/socket-events/socket-event';
import { Subject } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class WebsocketService {
    connectionEvent = new Subject<void>();
    private socket: Socket;

    // TO IMPLEMENT BACK FOR ROOM-ONLY CHAT CHANNELS
    // constructor(router: Router) {
    //     router.events.subscribe((event) => {
    //         if (event.type === EventType.NavigationEnd) {
    //             this.handlePageChange(event.url);
    //         }
    //     });
    // }

    get id() {
        return this.socket.id;
    }

    isSocketConnected(): boolean {
        return Boolean(this.socket) && this.socket.connected;
    }

    async connect() {
        return new Promise<void>((resolve) => {
            if (!this.socket || this.socket.disconnected) {
                this.socket = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });

                // Relay all socket events between windows
                this.setUpIpcWebsocketRelay();

                this.once(HomeEvent.CONNECTION_ACK, () => {
                    this.connectionEvent.next();
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    disconnect() {
        this.socket.disconnect();
    }

    removeAllListeners(event: SocketEvent) {
        this.socket?.removeAllListeners(event);
    }

    on<T>(event: SocketEvent, action: (data?: T) => void): void {
        this.socket.on(event, action);
    }

    once<T>(event: SocketEvent, action: (data?: T) => void): void {
        this.socket.once(event, action);
    }

    send<T>(event: SocketEvent, data?: T): void {
        this.socket.emit(event, data);
    }

    async sendWithAck<T, U>(event: SocketEvent, data?: T): Promise<U> {
        return this.socket.emitWithAck(event, data);
    }

    private setUpIpcWebsocketRelay() {
        if (window.electron) {
            this.socket.onAny((event, data) => {
                window.electron?.send(RELAY_RECEIVED_WS_EVENT, { event, data });
            });

            window.electron.on(SEND_WS_EVENT, (wsEvent: { event: SocketEvent; data: unknown }) => {
                this.socket.emit(wsEvent.event, wsEvent.data);
            });

            window.electron.on(SEND_WS_ACK, async ({ event, data, id }) => {
                const response = await this.sendWithAck(event, data);
                window.electron?.send(`${SEND_WS_ACK}-${id}`, response);
            });
        }
    }
}
