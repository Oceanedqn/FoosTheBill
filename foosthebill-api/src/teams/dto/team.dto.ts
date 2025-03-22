import { TournamentResponseDto } from "src/tournaments/dto/tournament.dto";
import { UserResponseDto } from "src/users/dto/user.dto";

export class TeamResponseDto {
    id: string;
    name: string;
    isMyTeam: boolean;
    participant1: UserResponseDto;
    participant2: UserResponseDto | null;
}

export class UpdateTeamDto {
    participantId: string
}

export class TeamWithTournamentReponseDto extends TeamResponseDto {
    tournament: TournamentResponseDto;
}

export class TeamsWithTournamentReponseDto {
    tournament: TournamentResponseDto;
    teams: TeamResponseDto[];
}

export class CreateTeamDto {
    name: string;
    tournament_id: string;
    participant1: string;
    participant2?: string;
}