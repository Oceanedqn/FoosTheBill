import type { ITeam } from "./Team";

export interface IRanking {
    id: string;
    position: number;
    points: number;
    tournamentId: string;
    team: ITeam
}