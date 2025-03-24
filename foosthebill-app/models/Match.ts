// models/Match.ts
import { type ITeam, type ITeamScore } from './Team';

export interface IRoundMatches {
    round: number;
    matches: IMatch[];
}

export interface IMatch {
    id: string;
    round: number;
    teams: ITeamScore[]
    isClosed: boolean;
}

export interface ICreateMatches {
    tournamentId: string;
    teams: ITeam[]
}

export interface IUpdateMatch {
    team_1_id: string;
    team_2_id: string;
    score_team_1: number;
    score_team_2: number;
    isClosed: boolean;
    tournament_id: string
}
