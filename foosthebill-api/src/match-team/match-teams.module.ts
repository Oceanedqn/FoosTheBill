import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchTeamsController } from './match-teams.controller';
import { MatchTeamsService } from './match-teams.service';
import { MatchTeam } from './match-team.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MatchTeam])],
    controllers: [MatchTeamsController],
    providers: [MatchTeamsService],
    exports: [MatchTeamsService]
})
export class MatchTeamsModule { }
