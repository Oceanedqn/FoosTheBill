// src/tournaments/tournaments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tournament } from './tournament.entity';
import { TournamentsService } from './tournaments.service';
import { TournamentsController } from './tournaments.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Tournament])],
    providers: [TournamentsService],
    controllers: [TournamentsController],
})
export class TournamentsModule { }
