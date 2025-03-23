import type { ITeam } from "./Team";
import type { ITournament } from "./Tournament";

export interface ITournamentRankings {
    tournament: ITournament;
    rankings: IRanking[];

}

export interface IRanking {
    id: string;
    position: number;
    points: number;
    team: ITeam;
}