// models/Match.ts
import { Team } from './Team';

export class Match {
    id: number;
    team1: Team;
    team2: Team;
    result: { team1Score: number; team2Score: number } | null;

    constructor(id: number, team1: Team, team2: Team) {
        this.id = id;
        this.team1 = team1;
        this.team2 = team2;
        this.result = null;
    }
}
