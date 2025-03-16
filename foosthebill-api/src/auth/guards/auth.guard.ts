import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization; // Bearer token
        const accessToken = authorization.split(' ')[1];

        if (!accessToken) {
            throw new UnauthorizedException();
        }

        try {
            const tokenPayload = await this.jwtService.verifyAsync(accessToken);
            request.user = {
                id: tokenPayload.sub,
                email: tokenPayload.email
            }
            return true;

        } catch (error) {
            throw new UnauthorizedException();
        }
    }
}