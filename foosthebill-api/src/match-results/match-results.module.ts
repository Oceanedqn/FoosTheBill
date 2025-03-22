// src/match-results/match-results.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchResult } from './match-result.entity';
import { MatchResultsService } from './match-results.service';
import { MatchResultsController } from './match-results.controller';
import { MatchesModule } from 'src/matches/matches.module';

@Module({
    imports: [TypeOrmModule.forFeature([MatchResult]), forwardRef(() => MatchesModule),],
    providers: [MatchResultsService],
    controllers: [MatchResultsController],
})
export class MatchResultsModule { }
