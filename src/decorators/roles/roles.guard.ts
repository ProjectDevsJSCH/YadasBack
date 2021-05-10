import {
    Injectable, CanActivate, ExecutionContext, UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());

        if (!roles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        console.log(request.route.path);
        return true;
        const { rol } = request.user;

        if (!roles.includes(rol)) {
            throw new UnauthorizedException(
                {
                    message: 'El usuario no tiene los permisos necesarios para acceder a este recurso',
                },
            );
        }

        return true;
    }
}
