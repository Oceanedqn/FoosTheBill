import { ITeam } from "src/teams/dto/team.dto";

export interface IRanking {
    id: string;
    position: number;
    points: number;
    tournamentId: string;
    team: ITeam
}