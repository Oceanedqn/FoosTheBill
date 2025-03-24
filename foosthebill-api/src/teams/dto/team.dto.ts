import { IUser } from "src/users/dto/user.dto";

export interface ITeam {
    id: string;
    name: string;
    isMyTeam: boolean;
    players: IUser[];
}

export interface ICreateTeam {
    name: string;
    tournamentId: string;
    players: IUser[];
}

export interface ITeamRanking extends ITeam {
    position: number;
    points: number;
}

export interface ITeamScore extends ITeam {
    score: number;
}

export interface IUpdateTeam {
    participantId: string
}