import { TeamResponseDto } from "src/teams/dto/team.dto";
import { Team } from "src/teams/team.entity";
import { TournamentResponseDto } from "src/tournaments/dto/tournament.dto";

export class MatchesResponseDto {
    round: number;
    matches: MatchResponseDto[];
}

export class MatchDto {
    id: string;
    round: number;
    score_team_1: number;
    score_team_2: number;
    team1: Team;
    team2: Team;
    isClosed: boolean;

}

export class MatchResponseDto {
    id: string;
    round: number;
    score_team_1: number;
    score_team_2: number;
    team1: TeamResponseDto;
    team2: TeamResponseDto;
    isClosed: boolean;
}

export class CreateMatchesDto {
    tournamentId: string;
    teams: TeamResponseDto[]
}

export class UpdateEndMatch {
    isClosed: boolean
}

export class UpdateMatchDto {
    score_team_1: number;
    score_team_2: number;
    isClosed: boolean;
}