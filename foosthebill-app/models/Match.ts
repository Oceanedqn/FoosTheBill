// models/Match.ts
import type { GenericResponse } from './Response';
import { Team } from './Team';

export interface CreateMatchesTournament {
    tournamentId: string;
    teams: Team[]
};

export interface MatchesTournamentResponse extends GenericResponse {
    data: {
        round: number;
        matches: MatchTournament[];
    }
}

export interface MatchTournament {
    id: string;
    round: number;
    score_team_1: number;
    score_team_2: number;
    team1: Team;
    team2: Team;
}


export class Match {
    id: string;
    team1: Team;
    team2: Team;
    result: { team1Score: number; team2Score: number } | null;

    constructor(id: string, team1: Team, team2: Team) {
        this.id = id;
        this.team1 = team1;
        this.team2 = team2;
        this.result = null;
    }
}
