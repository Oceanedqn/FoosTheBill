import { Role } from '../user.entity'; // Assurez-vous que le Role est importé

export class UserResponseDto {
    id: string;
    name: string;
    firstname: string;
    email: string;
    role: Role;
}

export class UpdateUserDto {
    name?: string;
    firstname?: string;
    email?: string;
    role?: Role;
}

export class CreateUserDto {
    name: string;
    firstname: string;
    email: string;
    password: string;
    role: Role;
    creation_date: Date;
}