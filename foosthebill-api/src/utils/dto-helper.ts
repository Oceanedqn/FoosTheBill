// utils/user-helper.ts
import { TournamentResponseDto } from 'src/tournaments/dto/tournament.dto';
import { UserResponseDto } from 'src/users/dto/user.dto';

/**
 * Mapper un tournoi en DTO TournamentResponseDto
 * @param tournament - L'entité Tournament à transformer
 * @returns TournamentResponseDto
 */
export function mapToTournamentResponseDto(tournament: any): TournamentResponseDto {
    const tournamentDto = new TournamentResponseDto();
    tournamentDto.id = tournament.id;
    tournamentDto.name = tournament.name;
    tournamentDto.description = tournament.description;
    tournamentDto.start_date = tournament.start_date;

    // Mapper l'administrateur (lien vers UserResponseDto)
    tournamentDto.admin = this.mapToUserResponseDto(tournament.admin)!;

    return tournamentDto;
}

/**
 * Helper function to map a User entity to UserResponseDto.
 * @param user - The user entity to map.
 * @returns UserResponseDto | null - The mapped user DTO or null if the user doesn't exist.
 */
export function mapToUserResponseDto(user: any): UserResponseDto | null {
    if (!user) {
        return null; // Si l'utilisateur est undefined ou null, renvoyer null
    }

    const userDto = new UserResponseDto();
    userDto.id = user.id;
    userDto.name = user.name;
    userDto.firstname = user.firstname; // Assurez-vous que vous avez ces champs dans votre entité User
    userDto.email = user.email;
    userDto.role = user.role;  // Vous pouvez ajuster selon la structure de votre modèle 'Role'
    return userDto;
}