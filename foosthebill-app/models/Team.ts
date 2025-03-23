import { type IUser } from './User';

export interface CreateTeam {
    name: string;
    participant2?: string | null;
}

export interface CreateTeams {
    name: string;
    participant1?: IUser | null;
    participant2?: IUser | null;
}

export interface CreateTeamsService {
    name: string;
    participant1?: string | null;
    participant2?: string | null;
}

export interface ITeam {
    id: string;
    name: string;
    isMyTeam: boolean;
    participant1: IUser;
    participant2?: IUser | null;
}
