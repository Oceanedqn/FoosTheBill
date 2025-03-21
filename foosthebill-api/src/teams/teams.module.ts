// src/teams/teams.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './team.entity';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { User } from 'src/users/user.entity';
import { Tournament } from 'src/tournaments/tournament.entity';
import { UsersModule } from 'src/users/users.module';
import { TournamentsModule } from 'src/tournaments/tournaments.module';

@Module({
    imports: [TypeOrmModule.forFeature([Team, Tournament, User]),
    forwardRef(() => UsersModule),
    forwardRef(() => TournamentsModule)],
    providers: [TeamsService],
    controllers: [TeamsController],
    exports: [TeamsService]
})
export class TeamsModule { }
