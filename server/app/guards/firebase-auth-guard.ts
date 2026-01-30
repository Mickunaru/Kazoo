import { ConnectionService } from '@app/services/connection/connection.service';
import { CanActivate, ExecutionContext, Injectable, createParamDecorator } from '@nestjs/common';

export const principal = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.principal;
});

@Injectable()
export class FireBaseAuthGuard implements CanActivate {
    constructor(private readonly connectionService: ConnectionService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const uid = await this.connectionService.authentificateUser(request);
        request.principal = uid;
        return !!uid;
    }
}
