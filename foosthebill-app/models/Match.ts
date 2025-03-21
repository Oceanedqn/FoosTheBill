// models/Match.ts
import { Team } from './Team';

export interface CreateMatchesTournament {
    tournamentId: string;
    teams: Team[]
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
    team1: Team;
    team2: Team;
}

export interface IMatchUpdate {
    score_team_1: number;
    score_team_2: number;
}
