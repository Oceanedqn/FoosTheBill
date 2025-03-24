// models/Tournament.ts
import type { IRoundMatches } from './Match';
import { type ITeam, type ITeamRanking } from './Team';
import type { IUser } from './User';

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
    start_date: Date;
    admin_id: string;
}

// TODO: Create functions
export class IUpdateTournament {
    name?: string;
    description?: string;
    start_date?: Date;
    admin_id?: string;
}
