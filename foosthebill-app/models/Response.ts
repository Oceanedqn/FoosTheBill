import type { BasicTournament } from "./Tournament";
import type { User } from "./User";

export interface GenericResponse {
    statusCode: number;
    message: string;

}


export interface AuthResponse extends GenericResponse {
    data: {
        accessToken: string,
        id: string,
        email: string
    }
}

export interface UserResponse extends GenericResponse {
    data: User
};

export interface CreateTournamentResponse extends GenericResponse {
    data: BasicTournament
}
