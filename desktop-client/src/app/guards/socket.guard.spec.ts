import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PageUrl } from '@app/enum/page-url';
import { WebsocketService } from '@app/shared/services/websocket/websocket.service';
import { socketGuard } from './socket.guard';

describe('SocketGuard', () => {
    let webSocketServiceSpy: jasmine.SpyObj<WebsocketService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        webSocketServiceSpy = jasmine.createSpyObj('WebsocketService', ['isSocketConnected']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [
                { provide: WebsocketService, useValue: webSocketServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
    });

    it('should allow access when socket is connected', () => {
        webSocketServiceSpy.isSocketConnected.and.returnValue(true);
        const canActivatePage = TestBed.runInInjectionContext(() => socketGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as boolean);
        expect(canActivatePage).toBe(true);
    });

    it('should not allow access when socket is not connect or undefined', () => {
        routerSpy.navigate.and.stub();
        webSocketServiceSpy.isSocketConnected.and.returnValue(false);
        const canActivatePage = TestBed.runInInjectionContext(() => socketGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as boolean);
        expect(canActivatePage).toBe(false);
        expect(routerSpy.navigate).toHaveBeenCalledWith([`/${PageUrl.LOGIN}`]);
    });
});
