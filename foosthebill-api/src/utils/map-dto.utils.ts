import { MatchDto, MatchesResponseDto, MatchResponseDto } from 'src/matches/dto/match.dto';
import { RankingsResponseDto } from 'src/rankings/dto/ranking.dto';
import { Ranking } from 'src/rankings/ranking.entity';
import { TeamResponseDto, TeamsWithTournamentReponseDto, TeamWithTournamentReponseDto } from 'src/teams/dto/team.dto';
import { Team } from 'src/teams/team.entity';
import { TournamentResponseDto } from 'src/tournaments/dto/tournament.dto';
import { Tournament } from 'src/tournaments/tournament.entity';
import { UserResponseDto } from 'src/users/dto/user.dto';
import { User } from 'src/users/user.entity';


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
export function mapToTournamentResponseDto(tournament: Tournament, user: UserResponseDto, participants: Set<string>, isRegister: boolean, isMatches): TournamentResponseDto {
    return {
        id: tournament.id,
        name: tournament.name,
        description: tournament.description,
        start_date: tournament.start_date,
        isRegister,
        isMatches,
        participant_number: participants.size,
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
 * Maps a Team entity to TeamWithTournamentReponseDto, including tournament details.
 * @param team - The team entity to map.
 * @param currentUserId - The ID of the current user to determine if they are part of the team.
 * @returns TeamWithTournamentReponseDto - The mapped team DTO with tournament details.
 */
export function mapToTeamWithTournamentResponseDto(team: Team, currentUserId: string): TeamWithTournamentReponseDto {
    return {
        id: team.id,
        name: team.name,
        isMyTeam: team.participant1.id === currentUserId || (team.participant2 ? team.participant2.id === currentUserId : false),
        tournament: mapToTournamentResponseDto(team.tournament, mapToUserResponseDto(team.tournament.admin)!, new Set(), false, false),
        participant1: mapToUserResponseDto(team.participant1)!,
        participant2: team.participant2 ? mapToUserResponseDto(team.participant2) : null,
    };
}

/**
 * Maps a Team entity to TeamWithTournamentReponseDto, including tournament details.
 * @param team - The team entity to map.
 * @param currentUserId - The ID of the current user to determine if they are part of the team.
 * @returns TeamWithTournamentReponseDto - The mapped team DTO with tournament details.
 */
export function mapToTeamsWithTournamentResponseDto(teams: Team[], tournament: Tournament, user: User): TeamsWithTournamentReponseDto {
    const mappedTeams = teams.map(team => mapToTeamResponseDto(team, user.id));
    return {
        tournament: mapToTournamentResponseDto(tournament, mapToUserResponseDto(user)!, new Set(), false, false),
        teams: mappedTeams
    };
}

export function mapToMatchResponseDto(match: MatchDto, currentUserId: string): MatchResponseDto {
    return {
        id: match.id,
        round: match.round,
        score_team_1: match.score_team_1,
        score_team_2: match.score_team_2,
        team1: mapToTeamResponseDto(match.team1, currentUserId),
        team2: mapToTeamResponseDto(match.team2, currentUserId),
        isClosed: match.isClosed
    };
}

export function mapToMatchesResponseDto(matches: MatchDto[]): MatchesResponseDto[] {
    const groupedMatches: { [key: number]: MatchDto[] } = {};

    // Grouper les matchs par round
    matches.forEach(match => {
        const round = match.round || 1;  // Si aucun round, utiliser 1
        if (!groupedMatches[round]) {
            groupedMatches[round] = [];
        }

        groupedMatches[round].push({
            id: match.id,
            round: match.round,
            score_team_1: match.score_team_1,
            score_team_2: match.score_team_2,
            team1: match.team1,
            team2: match.team2,
            isClosed: match.isClosed
        });
    });

    return Object.keys(groupedMatches).map(round => ({
        round: parseInt(round),
        matches: groupedMatches[parseInt(round)].map(match => mapToMatchResponseDto(match, "")),
    }));
}


export function mapToRankingsResponseDto(rankings: Ranking[], currentUserId: string): RankingsResponseDto[] {
    return rankings.map((ranking, index) => ({
        id: ranking.id,
        position: index + 1,
        points: ranking.points,
        team: mapToTeamResponseDto(ranking.team, currentUserId),
    }));
}