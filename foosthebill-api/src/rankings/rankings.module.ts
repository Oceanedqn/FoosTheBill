// src/rankings/rankings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ranking } from './ranking.entity';
import { RankingsService } from './rankings.service';
import { RankingsController } from './rankings.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Ranking])],
    providers: [RankingsService],
    controllers: [RankingsController],
})
export class RankingsModule { }
