import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SERVER_URL_API } from '@app/constants/server-url-and-api-constant';
import { UserAuthService } from '@app/shared/services/user-auth/user-auth.service'; // Your auth service
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private userAuthService: UserAuthService) {}

    intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        if (req.url.includes(SERVER_URL_API)) {
            const authReq = req.clone(this.userAuthService.requestOptions());
            return next.handle(authReq);
        }
        return next.handle(req);
    }
}
