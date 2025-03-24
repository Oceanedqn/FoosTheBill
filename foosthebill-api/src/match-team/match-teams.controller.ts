import { Controller, Get, Param, Post, Body, Put } from '@nestjs/common';
import { MatchTeam } from './match-team.entity';
import { MatchTeamsService } from './match-teams.service';

@Controller('match-teams')
export class MatchTeamsController {
    constructor(private readonly matchTeamsService: MatchTeamsService) { }


}
