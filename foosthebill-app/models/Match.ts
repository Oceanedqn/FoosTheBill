// models/Match.ts
import { type ITeam } from './Team';

export interface CreateMatchesTournament {
    tournamentId: string;
    teams: ITeam[]
};

export interface IMatchesTournament {
    round: number;
    matches: IMatchTournament[];
}

export interface IMatchTournament {
    id: string;
    round: number;
    score_team_1: number;
    score_team_2: number;
    team1: ITeam;
    team2: ITeam;
}

export interface IMatchUpdate {
    score_team_1: number;
    score_team_2: number;
    isClosed: boolean;
}
