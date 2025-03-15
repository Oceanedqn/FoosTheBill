import { Role } from '../user.entity'; // Assurez-vous que le Role est importé

export class UserResponseDTO {
    id: string;
    name: string;
    firstname: string;
    email: string;
    role: Role;
    creation_date: Date;
}