// src/matches/matches.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './match.entity';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { TournamentsModule } from 'src/tournaments/tournaments.module';
import { TeamsModule } from 'src/teams/teams.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Match]),
        forwardRef(() => TournamentsModule)
    ],
    providers: [MatchesService],
    controllers: [MatchesController],
    exports: [MatchesService],
})
export class MatchesModule { }
