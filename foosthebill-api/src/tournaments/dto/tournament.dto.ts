import { TeamResponseDto } from 'src/teams/dto/team.dto';
import { UserResponseDto } from 'src/users/dto/user.dto';

export class TournamentResponseDto {
  id: string;
  name: string;
  description: string;
  start_date: Date;
  participant_number: number;
  isRegister: boolean;
  isMatches: boolean;
  admin: UserResponseDto;
}

export class TournamentTeamsResponseDto {
  tournament: TournamentResponseDto;
  teams: TeamResponseDto[];
}

export class TournamentTeamResponseDto {
  tournament: TournamentResponseDto;
  team: TeamResponseDto;
}

export class CreateTournamentDto {
  name: string;
  description: string;
  start_date: Date;
  admin_id: string;
}

export class UpdateTournamentDto {
  name?: string;
  description?: string;
  start_date?: Date;
  admin_id?: string;
}
