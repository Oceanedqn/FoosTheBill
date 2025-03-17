import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';

@Controller('auth')
@UseFilters(new AllExceptionsFilter())
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() input: { email: string, password: string }) {
        const login = await this.authService.authenticate(input);
        return {
            statusCode: HttpStatus.OK,
            message: 'Connexion réussie',
            data: login,
        };
    }

    @UseGuards(AuthGuard)
    @Get('me')
    async getUserInfo(@Request() request) {
        if (!request.user) {
            throw new UnauthorizedException('User not authenticated');
        }

        return {
            statusCode: HttpStatus.OK,
            message: 'Utilisateur récupéré avec succès',
            data: request.user,
        };
    }
}
