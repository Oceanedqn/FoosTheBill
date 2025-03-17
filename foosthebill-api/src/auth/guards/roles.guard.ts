import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "src/users/user.entity";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRole = Role.ADMIN;
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || user.role !== requiredRole) {
            throw new ForbiddenException("Accès refusé : vous devez être administrateur");
        }

        return true;
    }
}
