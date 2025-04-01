import { IRoundMatches } from 'src/matches/dto/match.dto';
import { ITeam, ITeamRanking } from 'src/teams/dto/team.dto';
import { IUser } from 'src/users/dto/user.dto';

export interface ITournament {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  participantNumber: number;
  isRegister: boolean;
  isMatches: boolean;
  adminId: string;
}

export interface ITournamentDetails {
  tournament: ITournament,
  teams: ITeamRanking[],
  users: IUser[]
}

export interface ITournamentMatches {
  tournament: ITournament,
  myTeam: ITeam | null,
  roundMatches: IRoundMatches[]
}

export interface ICreateTournament {
  name: string;
  description: string;
  startDate: Date;
  adminId: string;
}

// TODO: Create functions
export class IUpdateTournament {
  name?: string;
  description?: string;
  start_date?: Date;
  admin_id?: string;
}
