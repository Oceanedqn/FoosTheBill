// models/Team.ts
export class Team {
    id: number;
    name: string;
    players: string[];

    constructor(id: number, name: string, players: string[]) {
        this.id = id;
        this.name = name;
        this.players = players;
    }

    // Méthode pour ajouter un joueur
    addPlayer(player: string) {
        this.players.push(player);
    }
}
