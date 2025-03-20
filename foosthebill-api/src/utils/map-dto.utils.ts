import { TeamResponseDto, TeamsWithTournamentReponseDto } from 'src/teams/dto/team.dto';
import { Team } from 'src/teams/team.entity';
import { TournamentResponseDto } from 'src/tournaments/dto/tournament.dto';
import { Tournament } from 'src/tournaments/tournament.entity';
import { UserResponseDto } from 'src/users/dto/user.dto';


/**
 * Maps a User entity to UserResponseDto.
 * @param user - The user entity to map.
 * @returns UserResponseDto | null - The mapped user DTO or null if the user does not exist.
 */
export function mapToUserResponseDto(user: any): UserResponseDto | null {
    if (!user) {
        return null; // Si l'utilisateur est undefined ou null, renvoyer null
    }
    return {
        id: user.id,
        name: user.name,
        firstname: user.firstname,
        role: user.role
    };
}

/**
 * Maps a Tournament entity to TournamentResponseDto.
 * @param tournament - The tournament entity to map.
 * @param user - The user who administers the tournament.
 * @param participants - A set of participant IDs.
 * @param isRegister - A boolean indicating if the user is registered.
 * @returns TournamentResponseDto - The mapped tournament DTO.
 */
export function mapToTournamentResponseDto(tournament: Tournament, user: UserResponseDto, participants: Set<string>, isRegister: boolean): TournamentResponseDto {
    return {
        id: tournament.id,
        name: tournament.name,
        description: tournament.description,
        start_date: tournament.start_date,
        participant_number: participants.size,
        isRegister,
        admin: mapToUserResponseDto(user)!
    };
}

/**
 * Maps a Team entity to TeamResponseDto.
 * @param team - The team entity to map.
 * @returns TeamResponseDto - The mapped team DTO.
 */
export function mapToTeamResponseDto(team: Team, currentUserId: string): TeamResponseDto {
    return {
        id: team.id,
        name: team.name,
        isMyTeam: team.participant1.id === currentUserId || (team.participant2 ? team.participant2.id === currentUserId : false),
        participant1: mapToUserResponseDto(team.participant1)!,
        participant2: team.participant2 ? mapToUserResponseDto(team.participant2) : null,
    };
}


/**
 * Maps a Team entity to TeamsWithTournamentReponseDto, including tournament details.
 * @param team - The team entity to map.
 * @param currentUserId - The ID of the current user to determine if they are part of the team.
 * @returns TeamsWithTournamentReponseDto - The mapped team DTO with tournament details.
 */
export function mapToTeamsWithTournamentResponseDto(team: Team, currentUserId: string): TeamsWithTournamentReponseDto {
    return {
        id: team.id,
        name: team.name,
        isMyTeam: team.participant1.id === currentUserId || (team.participant2 ? team.participant2.id === currentUserId : false),
        tournament: mapToTournamentResponseDto(team.tournament, mapToUserResponseDto(team.tournament.admin)!, new Set(), false),
        participant1: mapToUserResponseDto(team.participant1)!,
        participant2: team.participant2 ? mapToUserResponseDto(team.participant2) : null,
    };
}