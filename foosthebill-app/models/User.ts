// models/User.ts
export enum Role {
    ADMIN = 'admin',
    PARTICIPANT = 'participant',
}

export class User {
    id: string;
    name: string;
    firstname: string;
    email: string;
    role: Role;

    constructor(
        id: string,
        name: string,
        firstname: string,
        email: string,
        role: Role,
    ) {
        this.id = id;
        this.name = name;
        this.firstname = firstname;
        this.email = email;
        this.role = role;
    }

    // Méthode pour vérifier si l'utilisateur est un administrateur
    isAdmin(): boolean {
        return this.role === Role.ADMIN;
    }

    // Méthode pour vérifier si l'utilisateur est un participant
    isParticipant(): boolean {
        return this.role === Role.PARTICIPANT;
    }

    // Méthode pour afficher les informations de l'utilisateur (à des fins de débogage, par exemple)
    getUserInfo(): string {
        return `User ${this.firstname} ${this.name}, Email: ${this.email}, Role: ${this.role}`;
    }
}
