import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService, private usersService: UsersService) { }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization; // Bearer token

        if (!authorization) {
            throw new UnauthorizedException("Token manquant");
        }

        const accessToken = authorization.split(' ')[1];

        if (!accessToken) {
            throw new UnauthorizedException("Token invalide");
        }

        try {
            const tokenPayload = await this.jwtService.verifyAsync(accessToken);
            const user = await this.usersService.findOne(tokenPayload.sub);

            if (!user) {
                throw new UnauthorizedException("Utilisateur non trouvé");
            }

            request.user = user;
            return true;

        } catch (error) {
            throw new UnauthorizedException('Token invalide ou utilisateur non trouvé');
        }
    }
}