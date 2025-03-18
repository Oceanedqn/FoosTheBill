// src/teams/teams.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './team.entity';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { User } from 'src/users/user.entity';
import { Tournament } from 'src/tournaments/tournament.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Team, Tournament, User]), UsersModule],
    providers: [TeamsService],
    controllers: [TeamsController],
})
export class TeamsModule { }
