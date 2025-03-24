import { Role } from '../user.entity'; // Assurez-vous que le Role est importé

export interface IUser {
    id: string;
    name: string;
    firstname: string;
    role: Role;
}

// TODO: Create functions
export interface IUpdateUser {
    name?: string;
    firstname?: string;
    email?: string;
    role?: Role;
}

export interface ICreateUser {
    name: string;
    firstname: string;
    email: string;
    password: string;
    role: Role;
    creation_date: Date;
}