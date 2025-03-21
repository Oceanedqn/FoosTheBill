import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tournament } from './tournament.entity';
import { TournamentsService } from './tournaments.service';
import { TournamentsController } from './tournaments.controller';
import { UsersModule } from 'src/users/users.module';
import { TeamsModule } from 'src/teams/teams.module';
import { MatchesModule } from 'src/matches/matches.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tournament]), forwardRef(() => UsersModule), forwardRef(() => TeamsModule), forwardRef(() => MatchesModule),],
  providers: [TournamentsService],
  controllers: [TournamentsController],
  exports: [TournamentsService]
})
export class TournamentsModule { }
