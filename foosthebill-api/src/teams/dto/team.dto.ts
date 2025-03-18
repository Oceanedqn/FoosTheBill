import { TournamentResponseDto } from "src/tournaments/dto/tournament.dto";
import { UserResponseDto } from "src/users/dto/user.dto";

export class TeamResponseDto {
    id: string;
    name: string;
    tournament: TournamentResponseDto;
    participant1: UserResponseDto;
    participant2: UserResponseDto | null;
}