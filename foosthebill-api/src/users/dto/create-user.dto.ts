import { Role } from '../user.entity';

export class CreateUserDto {
    name: string;
    firstname: string;
    email: string;
    password: string;
    role: Role;
    creation_date: Date;
}