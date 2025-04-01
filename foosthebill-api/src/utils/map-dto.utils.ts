import { IMatch } from 'src/matches/dto/match.dto';
import { IRanking } from 'src/rankings/dto/ranking.dto';
import { Ranking } from 'src/rankings/ranking.entity';
import { Team } from 'src/teams/team.entity';
import { ITournament } from 'src/tournaments/dto/tournament.dto';
import { ITeam, ITeamRanking, ITeamScore } from 'src/teams/dto/team.dto';
import { Tournament } from 'src/tournaments/tournament.entity';
import { IUser } from 'src/users/dto/user.dto';
import { User } from 'src/users/user.entity';
import { Match } from 'src/matches/match.entity';


export function mapToITournament(tournament: Tournament, isRegister: boolean, isMatches: boolean, participantNumber: number): ITournament {
    return {
        id: tournament.id,
        name: tournament.name,
        description: tournament.description,
        startDate: tournament.start_date,
        isRegister: isRegister,
        isMatches: isMatches,
        participantNumber: participantNumber,
        adminId: tournament.admin.id,
        config: tournament.config
    }
}

export function mapToITeam(team: Team, userId: string): ITeam {
    const isMyTeam = team.players.some(player => player.id === userId);

    return {
        id: team.id,
        name: team.name,
        isMyTeam: isMyTeam,
        players: team.players.map(mapToIUser),
    }
}

export function mapToITeamRanking(team: Team, userId: string, ranking: IRanking | null): ITeamRanking {
    const isMyTeam = team.players.some(player => player.id === userId);
    return {
        id: team.id,
        name: team.name,
        isMyTeam: isMyTeam,
        players: team.players.map(mapToIUser),
        position: ranking ? ranking.position : 0,
        points: ranking ? ranking.points : 0
    }
}

export function mapToITeamScore(team: Team, userId: string, score: number): ITeamScore {
    const isMyTeam = team.players.some(player => player.id === userId);
    return {
        id: team.id,
        score: score, // Utiliser le score individuel de l'équipe
        name: team.name,
        isMyTeam: isMyTeam,
        players: team.players.map(mapToIUser)
    };
}


export function mapToIRanking(ranking: Ranking, userId: string): IRanking {
    return {
        id: ranking.id,
        points: ranking.points,
        position: ranking.position,
        tournamentId: ranking.tournament.id,
        team: mapToITeam(ranking.team, userId)
    }
}


export function mapToIUser(user: User): IUser {
    return {
        id: user.id,
        name: user.name,
        firstname: user.firstname,
        role: user.role
    }
}

export function mapToIMatch(match: Match, userId: string, scores: Record<string, number>, teams: Team[]): IMatch {
    return {
        id: match.id,
        round: match.round,
        teams: teams.map(team => {
            const score = scores[team.id] || 0;
            return mapToITeamScore(team, userId, score);
        }),
        isClosed: match.isClosed
    };
}

