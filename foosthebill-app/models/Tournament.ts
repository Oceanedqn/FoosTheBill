// models/Tournament.ts
import { Team, type BaseTeam } from './Team';
import { Match } from './Match';
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
export interface TournamentPeople {
    id: string;
    name: string;
    start_date: string;
    description: string;
    participant_number: number;
    is_register: boolean;
    admin: User;

}

export interface TournamentTeams {
    id: string;
    name: string;
    start_date: string;
    description: string;
    admin: User;
    teams: BaseTeam[];
}

export class Tournament {
    id: string;
    name: string;
    start_date: string;
    description: string;
    admin: User;
    teams: Team[];
    matches: Match[];

    constructor(id: string, name: string, date: string, description: string, user: User) {
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
    recordResult(matchId: string, team1Score: number, team2Score: number) {
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
