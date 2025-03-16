// models/User.ts

export type UserRole = 'admin' | 'participant';

export class User {
    id: number;
    name: string;
    firstname: string;
    email: string;
    password: string;
    role: UserRole;
    creation_date: Date;

    constructor(
        id: number,
        name: string,
        firstname: string,
        email: string,
        password: string,
        role: UserRole,
        creation_date: Date
    ) {
        this.id = id;
        this.name = name;
        this.firstname = firstname;
        this.email = email;
        this.password = password;
        this.role = role;
        this.creation_date = creation_date;
    }

    // Méthode pour vérifier si l'utilisateur est un administrateur
    isAdmin(): boolean {
        return this.role === 'admin';
    }

    // Méthode pour vérifier si l'utilisateur est un participant
    isParticipant(): boolean {
        return this.role === 'participant';
    }

    // Méthode pour définir un nouveau mot de passe (crypté)
    setPassword(newPassword: string): void {
        // Implémenter la logique pour crypter le mot de passe
        // Utiliser un package comme bcrypt.js pour cela
        this.password = newPassword;
    }

    // Méthode pour afficher les informations de l'utilisateur (à des fins de débogage, par exemple)
    getUserInfo(): string {
        return `User ${this.firstname} ${this.name}, Email: ${this.email}, Role: ${this.role}`;
    }
}
