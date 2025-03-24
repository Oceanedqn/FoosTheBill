// models/User.ts
export enum Role {
    ADMIN = 'admin',
    PARTICIPANT = 'participant',
}

export interface IUser {
    id: string;
    name: string;
    firstname: string;
    role: Role;
}

export interface ICreateUser {
    name: string;
    firstname: string;
    email: string;
    password: string;
    role: Role;
    creation_date: Date;
}
