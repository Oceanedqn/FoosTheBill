import { TournamentResponseDto } from "src/tournaments/dto/tournament.dto";
import { UserResponseDto } from "src/users/dto/user.dto";

export class TeamResponseDto {
    id: string;
    name: string;
    participant1: UserResponseDto;
    participant2: UserResponseDto | null;
}

export class TeamsWithTournamentReponseDto extends TeamResponseDto{
    tournament: TournamentResponseDto;
}

export class CreateTeamDto{
    name: string;
    tournament_id: string;
    participant1: string;
    participant2?:string;
}