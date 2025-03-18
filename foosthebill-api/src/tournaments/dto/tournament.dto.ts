import { TeamResponseDto } from 'src/teams/dto/team.dto';
import { UserResponseDto } from 'src/users/dto/user.dto';

export class TournamentResponseDto {
  id: string;
  name: string;
  description: string;
  start_date: Date;
  admin: UserResponseDto;
}

export class TournamentPeopleResponseDto {
  id: string;
  name: string;
  description: string;
  start_date: Date;
  participant_number: number;
  admin: UserResponseDto;
}

export class TournamentTeamsResponseDto {
  tournament: TournamentResponseDto;
  teams: TeamResponseDto[];
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
