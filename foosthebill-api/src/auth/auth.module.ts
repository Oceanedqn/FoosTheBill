import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { getEnv } from 'src/utils/env.utils';

@Module({
    providers: [AuthService],
    controllers: [AuthController],
    imports: [
        UsersModule,
        JwtModule.register({
            global: true,
            secret: getEnv('JWT_SECRET'),
            signOptions: { expiresIn: '1d' }
        }),
    ],
})
export class AuthModule { }
