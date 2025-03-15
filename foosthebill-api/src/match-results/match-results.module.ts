// src/match-results/match-results.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchResult } from './match-result.entity';
import { MatchResultsService } from './match-results.service';
import { MatchResultsController } from './match-results.controller';

@Module({
    imports: [TypeOrmModule.forFeature([MatchResult])],
    providers: [MatchResultsService],
    controllers: [MatchResultsController],
})
export class MatchResultsModule { }
