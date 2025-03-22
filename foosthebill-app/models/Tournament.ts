// models/Tournament.ts
import { type ITeam } from './Team';
import type { User } from './User';

export interface CreateTournament {
    name: string;
    start_date: Date;
    description: string;
};

export interface BasicTournament {
    id: string;
    name: string;
    start_date: string;
    description: string;
    admin_id: string;
}

// Use in /tournaments
export interface ITournament {
    id: string;
    name: string;
    start_date: string;
    description: string;
    participant_number: number;
    isRegister: boolean;
    isMatches: boolean;
    admin: User;

}

export interface ITournamentWithTeams {
    tournament: ITournament
    teams: ITeam[];
}

export interface ITournamentWithTeam {
    tournament: ITournament
    team: ITeam;
}
