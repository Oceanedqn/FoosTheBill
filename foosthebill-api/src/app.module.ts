import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { TeamsModule } from './teams/teams.module';
import { MatchesModule } from './matches/matches.module';
import { RankingsModule } from './rankings/rankings.module';
import { MatchResultsModule } from './match-results/match-results.module';
import { User } from './users/user.entity';
import { Tournament } from './tournaments/tournament.entity';
import { Team } from './teams/team.entity';
import { Match } from './matches/match.entity';
import { Ranking } from './rankings/ranking.entity';
import { MatchResult } from './match-results/match-result.entity';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

// Check if value is defined in environment variables
const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
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
  ],
})

export class AppModule { }