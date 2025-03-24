// src/matches/matches.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './match.entity';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { TournamentsModule } from 'src/tournaments/tournaments.module';
import { MatchResultsService } from 'src/match-results/match-results.service';
import { MatchResult } from 'src/match-results/match-result.entity';
import { UsersModule } from 'src/users/users.module';
import { RankingsModule } from 'src/rankings/rankings.module';
import { MatchTeamsModule } from 'src/match-team/match-teams.module';
import { MatchTeam } from 'src/match-team/match-team.entity';
import { MatchTeamsService } from 'src/match-team/match-teams.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Match, MatchResult, MatchTeam]),
        forwardRef(() => TournamentsModule),
        forwardRef(() => RankingsModule),
        forwardRef(() => UsersModule),
        forwardRef(() => MatchTeamsModule)
    ],
    providers: [MatchesService, MatchResultsService],
    controllers: [MatchesController],
    exports: [MatchesService],
})
export class MatchesModule { }
