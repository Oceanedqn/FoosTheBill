import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { Team } from 'src/teams/team.entity';
import { Tournament } from 'src/tournaments/tournament.entity';
import { UsersController } from './users.controller';
import { TeamsModule } from 'src/teams/teams.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Team, Tournament]),
    forwardRef(() => TeamsModule)
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule { }
