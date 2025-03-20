import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { Team } from 'src/teams/team.entity';
import { Tournament } from 'src/tournaments/tournament.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Team, Tournament])],
    providers: [UsersService],
    exports: [UsersService],
  })
export class UsersModule { }
