import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EventType, Router } from '@angular/router';
import { RouterEventMock } from '@app/constants/test-interfaces';
import { ID_MOCK } from '@app/constants/test-utils';
import { PageUrl } from '@app/enum/page-url';
import { GameEvent } from '@common/socket-events/game-event';
import { HomeEvent } from '@common/socket-events/home-event';
import { SocketEvent } from '@common/socket-events/socket-event';
import { Subject } from 'rxjs';
import * as SocketIO from 'socket.io-client';
import { WebsocketService } from './websocket.service';

describe('WebsocketService', () => {
    let service: WebsocketService;
    // let ioSpy: jasmine.Spy<typeof SocketIO.io>;
    // const validSocketMock = { connected: true, disconnected: false, emit: jasmine.createSpy() } as unknown as SocketIO.Socket;
    let routerObservableMock: Subject<RouterEventMock>;
    beforeEach(() => {
        // ioSpy = spyOn(SocketIO, 'io').and.returnValue(validSocketMock);
        routerObservableMock = new Subject<RouterEventMock>();
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: Router,
                    useValue: {
                        events: routerObservableMock,
                    },
                },
            ],
        });
        service = TestBed.inject(WebsocketService);
    });

    afterEach(() => {
        routerObservableMock?.unsubscribe();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should connect', () => {
        spyOn(service, 'once').and.callFake((event: SocketEvent, resolve) => {
            expect(event).toBe(HomeEvent.CONNECTION_ACK);
            resolve();
        });
        service.connect();
        expect(service['once']).toHaveBeenCalled();
    });

    it('should not connect when socket is defined', () => {
        service['socket'] = {} as SocketIO.Socket;
        spyOn(service, 'once').and.stub();
        service.connect();
        expect(service['once']).not.toHaveBeenCalled();
    });

    it('should disconnect properly', () => {
        const socketMock = {
            disconnect: jasmine.createSpy(),
        };
        service['socket'] = socketMock as unknown as SocketIO.Socket;

        service.disconnect();

        expect(socketMock.disconnect).toHaveBeenCalled();
    });

    it('should register event listener properly', () => {
        const event = 'testEvent' as SocketEvent;
        const callback = () => {
            return;
        };
        const socketMock = {
            on: jasmine.createSpy(),
        };
        service['socket'] = socketMock as unknown as SocketIO.Socket;

        service.on(event, callback);

        expect(socketMock.on).toHaveBeenCalledWith(event, callback);
    });

    it('should register on time event listener properly', () => {
        const event = 'testEvent' as SocketEvent;
        const callback = () => {
            return;
        };
        const socketMock = {
            once: jasmine.createSpy(),
        };
        service['socket'] = socketMock as unknown as SocketIO.Socket;

        service.once(event, callback);

        expect(socketMock.once).toHaveBeenCalledWith(event, callback);
    });

    it('should send event properly', () => {
        const event = 'testEvent' as SocketEvent;
        const data = { test: 'test value' };
        const socketMock = {
            emit: jasmine.createSpy(),
        };
        service['socket'] = socketMock as unknown as SocketIO.Socket;

        service.send(event, data);

        expect(socketMock.emit).toHaveBeenCalledWith(event, data);
    });

    it('should send event with acknowledgement properly', fakeAsync(() => {
        const event = 'testEvent' as SocketEvent;
        const data = { test: 'test value' };
        const expectedResult = 'result';
        const socketMock = {
            emitWithAck: jasmine.createSpy().and.resolveTo(expectedResult),
        };
        service['socket'] = socketMock as unknown as SocketIO.Socket;
        let result = 'bad result';
        service.sendWithAck(event, data).then((answer) => {
            result = answer as string;
        });
        tick();

        expect(socketMock.emitWithAck).toHaveBeenCalledWith(event, data);
        expect(result).toBe(expectedResult);
    }));

    it('should keep connection if changing to a page that is part of the valid socket routes', () => {
        const routerEvent: RouterEventMock = {
            type: EventType.NavigationEnd,
            url: `/${PageUrl.GAME}`,
        };
        const socketMock = {
            connected: true,
            disconnect: jasmine.createSpy(),
        };
        service['socket'] = socketMock as unknown as SocketIO.Socket;

        routerObservableMock.next(routerEvent);
        expect(socketMock.disconnect).not.toHaveBeenCalled();
    });

    it('should keep connection if event is not NavigationEnd', () => {
        const routerEvent: RouterEventMock = {
            type: EventType.NavigationStart,
            url: '/home',
        };
        const socketMock = {
            connected: true,
            disconnect: jasmine.createSpy(),
        };
        service['socket'] = socketMock as unknown as SocketIO.Socket;

        routerObservableMock.next(routerEvent);
        expect(socketMock.disconnect).not.toHaveBeenCalled();
    });

    // it('should disconnect if the start of a route is not part of the valid socket routes', () => {
    //     const routerEvent: RouterEventMock = {
    //         type: EventType.NavigationEnd,
    //         url: '/home',
    //     };
    //     const socketMock = {
    //         connected: true,
    //         disconnect: jasmine.createSpy(),
    //     };
    //     service['socket'] = socketMock as unknown as SocketIO.Socket;

    //     routerObservableMock.next(routerEvent);
    //     expect(socketMock.disconnect).toHaveBeenCalled();
    // });

    it('should return true if socket is defined and connected', () => {
        const socketMock = { connected: true };
        service['socket'] = socketMock as unknown as SocketIO.Socket;
        expect(service.isSocketConnected()).toBe(true);
    });

    it('should return false if socket not connected', () => {
        const socketMock = { connected: false };
        service['socket'] = socketMock as unknown as SocketIO.Socket;
        expect(service.isSocketConnected()).toBe(false);
    });

    it('should return false if socket is undefined', () => {
        expect(service.isSocketConnected()).toBe(false);
    });

    it('shoudl get id', () => {
        service['socket'] = { id: ID_MOCK } as unknown as SocketIO.Socket;
        expect(service.id).toBe(ID_MOCK);
    });

    it('should remove all listenrs', () => {
        const socketMock = { removeAllListeners: jasmine.createSpy() };
        service['socket'] = socketMock as unknown as SocketIO.Socket;
        service.removeAllListeners(GameEvent.SEND_GAME);
        expect(socketMock.removeAllListeners).toHaveBeenCalledWith(GameEvent.SEND_GAME);
    });
});
