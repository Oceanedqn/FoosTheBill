import { Role } from '../user.entity';

export class UpdateUserDto {
    name?: string;
    firstname?: string;
    email?: string;
    role?: Role;
}
