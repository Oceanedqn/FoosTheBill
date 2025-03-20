import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { MatchResult } from './match-results/match-result.entity';
import { MatchResultsModule } from './match-results/match-results.module';
import { Match } from './matches/match.entity';
import { MatchesModule } from './matches/matches.module';
import { Ranking } from './rankings/ranking.entity';
import { RankingsModule } from './rankings/rankings.module';
import { Team } from './teams/team.entity';
import { TeamsModule } from './teams/teams.module';
import { Tournament } from './tournaments/tournament.entity';
import { TournamentsModule } from './tournaments/tournaments.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { getEnv } from './utils/env.utils';

@Module({
  providers: [
    {
      provide: APP_FILTER,
          useClass: AllExceptionsFilter,
    },
    AuthService,
  ],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: getEnv('DB_HOST'),
      port: parseInt(getEnv('DB_PORT')),
      username: getEnv('DB_USERNAME'),
      password: getEnv('DB_PASSWORD'),
      database: getEnv('DB_NAME'),
      entities: [
        User,
        Tournament,
        Team,
        Match,
        Ranking,
        MatchResult,
      ],
      synchronize: true,  // TODO: Automatically synchronize DB schema (to be used with caution in production)
    }),
    UsersModule,
    TournamentsModule,
    TeamsModule,
    MatchesModule,
    RankingsModule,
    MatchResultsModule,
    AuthModule,
  ],
  controllers: [AuthController],
})

export class AppModule { }