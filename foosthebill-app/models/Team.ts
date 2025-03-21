// models/Team.ts
import { Tournament } from './Tournament';
import { User, type IUser } from './User';

export interface CreateTeam {
    name: string;
    participant2?: User | null; // Nullable si on ajoute un seul joueur au début
}

export interface ITeam {
    id: string;
    name: string;
    isMyTeam: boolean;
    participant1: IUser;
    participant2?: IUser | null; // Nullable si on ajoute un seul joueur au début
}

export class Team {
    id: string;
    name: string;
    isMyTeam: boolean;
    tournament: Tournament;
    participant1: User;
    participant2?: User | null; // Nullable si on ajoute un seul joueur au début

    constructor(id: string, name: string, tournament: Tournament, participant1: User, isMyTeam: boolean, participant2?: User | null) {
        this.id = id;
        this.name = name;
        this.tournament = tournament;
        this.participant1 = participant1;
        this.participant2 = participant2 ?? null; // Assigner null si pas de second joueur
        this.isMyTeam = isMyTeam;
    }

    // Méthode pour ajouter un second participant
    addParticipant(player: User) {
        if (!this.participant2) {
            this.participant2 = player;
        } else {
            throw new Error('This team already has two participants.');
        }
    }
}
