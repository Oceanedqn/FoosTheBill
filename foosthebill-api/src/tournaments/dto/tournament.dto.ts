import { UserResponseDto } from "src/users/dto/user.dto";

export class TournamentResponseDto {
    id: string;
    name: string;
    description: string;
    start_date: Date;
    admin: UserResponseDto
}

export class CreateTournamentDto {
    name: string;
    description: string;
    start_date: Date;
    admin_id: string;
}

export class UpdateTournamentDto {
    name?: string;
    description?: string;
    start_date?: Date;
    admin_id?: string;
}