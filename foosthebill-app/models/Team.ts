// models/Team.ts
import { Tournament } from './Tournament';
import { User } from './User';

export interface CreateTeam {
    name: string;
    tournament_id: string;
    participant1: User;
    participant2?: User | null; // Nullable si on ajoute un seul joueur au début
}

export interface BasicTeam {
    id: string;
    name: string;
    participant1: User;
    participant2?: User | null; // Nullable si on ajoute un seul joueur au début
}

export class Team {
    id: string;
    name: string;
    tournament: Tournament;
    participant1: User;
    participant2?: User | null; // Nullable si on ajoute un seul joueur au début

    constructor(id: string, name: string, tournament: Tournament, participant1: User, participant2?: User | null) {
        this.id = id;
        this.name = name;
        this.tournament = tournament;
        this.participant1 = participant1;
        this.participant2 = participant2 ?? null; // Assigner null si pas de second joueur
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
