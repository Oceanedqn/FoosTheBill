import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

type AuthInput = { email: string, password: string };
type SignInData = { id: string, email: string };
type AuthResult = { accessToken: string; id: string; email: string };

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async authenticate(input: AuthInput): Promise<AuthResult> {
        const user = await this.validateUser(input);
        if (!user) {
            throw new UnauthorizedException();
        }

        return this.signIn(user);
    }


    async validateUser(input: AuthInput): Promise<SignInData | null> {
        const user = await this.usersService.findUserByEmail(input.email);

        if (!user) {
            return null;
        }

        if (user && await bcrypt.compare(input.password, user.password)) {
            return { id: user.id, email: user.email };
        }
        throw new UnauthorizedException('Unauthorized');
    }

    async signIn(user: SignInData): Promise<AuthResult> {
        const tokenPayload = { email: user.email, sub: user.id };

        const accessToken = await this.jwtService.signAsync(tokenPayload);
        return {
            accessToken,
            id: user.id,
            email: user.email,
        }
    }
}
