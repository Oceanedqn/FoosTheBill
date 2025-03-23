import { TeamResponseDto } from "src/teams/dto/team.dto";
import { TournamentResponseDto } from "src/tournaments/dto/tournament.dto";

export class RankingsResponseDto {
    id: string;
    position: number;
    points: number;
    team: TeamResponseDto;

}

export class TournamentRankingsResponseDto {
    tournament: TournamentResponseDto;
    rankings: RankingsResponseDto[];
}