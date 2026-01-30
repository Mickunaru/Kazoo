import { Injectable, NgZone } from '@angular/core';
import { IPC_MAX_TIMEOUT, RELAY_RECEIVED_WS_EVENT, SEND_WS_ACK, SEND_WS_EVENT } from '@app/chat/chat.const';
import { SocketEvent } from '@common/socket-events/socket-event';

interface IpcTransport {
    event: SocketEvent;
    data?: unknown;
}
@Injectable({
    providedIn: 'root',
})
export class IpcService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscribers: Map<SocketEvent, ((data: any) => void)[]> = new Map();

    constructor(private ngZone: NgZone) {
        window.electron?.on(RELAY_RECEIVED_WS_EVENT, (message: IpcTransport) => {
            // NgZone is a service that allows the update to variables to be detected by
            // angular in the components. Without it, the callback is executed at the window
            // context (without the angular framework)
            this.ngZone.run(() => {
                this.subscribers.get(message.event)?.forEach((func) => {
                    func(message.data);
                });
            });
        });
    }

    send<T>(event: SocketEvent, data?: T): void {
        window.electron?.send(SEND_WS_EVENT, { event, data });
    }

    on<T>(event: SocketEvent, action: (data: T) => void) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }
        this.subscribers.get(event)?.push(action);
    }

    async sendWithAck<T, U>(event: SocketEvent, data?: T): Promise<U> {
        return new Promise<U>((resolve, reject) => {
            const id = crypto.randomUUID();
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout waiting for acknowledgment of event ${event} with id ${id} and data ${data}`));
            }, IPC_MAX_TIMEOUT);

            window.electron?.once(`${SEND_WS_ACK}-${id}`, (response) => {
                clearTimeout(timeout);
                resolve(response);
            });
            window.electron?.send(SEND_WS_ACK, { id, event, data });
        });
    }
}
