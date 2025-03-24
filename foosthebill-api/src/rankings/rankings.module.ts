// src/rankings/rankings.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ranking } from './ranking.entity';
import { RankingsService } from './rankings.service';
import { RankingsController } from './rankings.controller';
import { TournamentsModule } from 'src/tournaments/tournaments.module';
import { Team } from 'src/teams/team.entity';
import { Tournament } from 'src/tournaments/tournament.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Ranking, Team, Tournament]), forwardRef(() => TournamentsModule)],
    providers: [RankingsService],
    controllers: [RankingsController],
    exports: [RankingsService]
})
export class RankingsModule { }
