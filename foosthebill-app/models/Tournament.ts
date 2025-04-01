// models/Tournament.ts
import type { IRoundMatches } from './Match';
import { type ITeam, type ITeamRanking } from './Team';
import type { IUser } from './User';


export enum TournamentConfig{
    BABYFOOT = "babyfoot",
    BILLARD = "billard",
}

export interface ITournamentConfig {
    maxPerTeam: number;
    maxScore: number;
}

const TOURNAMENT_CONFIGS: Record<TournamentConfig, ITournamentConfig> = {
    [TournamentConfig.BABYFOOT]: { maxPerTeam: 2, maxScore: 8 },
    [TournamentConfig.BILLARD]: { maxPerTeam: 2, maxScore: 7 },
};

export function getTournamentConfig(type: TournamentConfig): ITournamentConfig {
    return TOURNAMENT_CONFIGS[type];
}

export interface ITournament {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    participantNumber: number;
    isRegister: boolean;
    isMatches: boolean;
    adminId: string;
    config: TournamentConfig;
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
    startDate: string;
    adminId?: string;
    config: TournamentConfig
}

// TODO: Create functions
export class IUpdateTournament {
    name?: string;
    description?: string;
    start_date?: Date;
    admin_id?: string;
}
