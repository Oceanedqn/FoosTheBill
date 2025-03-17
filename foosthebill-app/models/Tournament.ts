// models/Tournament.ts
import { Team } from './Team';
import { Match } from './Match';
import type { User } from './User';

export interface CreateTournament {
    name: string;
    start_date: Date;
    description: string;
};

export interface BasicTournament {
    id: number;
    name: string;
    start_date: string;
    description: string;
    admin_id: string;
}

export class Tournament {
    id: number;
    name: string;
    start_date: string;
    description: string;
    admin: User;
    teams: Team[];
    matches: Match[];

    constructor(id: number, name: string, date: string, description: string, user: User) {
        this.id = id;
        this.name = name;
        this.start_date = date;
        this.description = description;
        this.admin = user;
        this.teams = [];
        this.matches = [];
    }

    // Méthode pour ajouter un match au tournoi
    addMatch(match: Match) {
        this.matches.push(match);
    }

    // Méthode pour enregistrer un résultat et mettre à jour les classements
    recordResult(matchId: number, team1Score: number, team2Score: number) {
        const match = this.matches.find(m => m.id === matchId);
        if (match) {
            match.result = { team1Score, team2Score };
            this.updateRankings();
        }
    }

    // Méthode pour mettre à jour les classements
    private updateRankings() {
        // Logique pour recalculer les classements
    }
}
