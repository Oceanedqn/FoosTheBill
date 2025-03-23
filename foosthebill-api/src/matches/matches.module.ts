// src/matches/matches.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './match.entity';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { TournamentsModule } from 'src/tournaments/tournaments.module';
import { TeamsModule } from 'src/teams/teams.module';
import { MatchResultsService } from 'src/match-results/match-results.service';
import { MatchResult } from 'src/match-results/match-result.entity';
import { UsersModule } from 'src/users/users.module';
import { RankingsModule } from 'src/rankings/rankings.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Match, MatchResult]),
        forwardRef(() => TournamentsModule), forwardRef(() => RankingsModule), forwardRef(() => UsersModule)
    ],
    providers: [MatchesService, MatchResultsService],
    controllers: [MatchesController],
    exports: [MatchesService],
})
export class MatchesModule { }
