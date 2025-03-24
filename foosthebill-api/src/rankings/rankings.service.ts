import { Injectable, NotFoundException, InternalServerErrorException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ranking } from './ranking.entity';
import { IRanking } from './dto/ranking.dto';
import { mapToIRanking } from 'src/utils/map-dto.utils';
import { TournamentsService } from 'src/tournaments/tournaments.service';

@Injectable()
export class RankingsService {
    constructor(
        @InjectRepository(Ranking)
        private rankingsRepository: Repository<Ranking>
    ) { }


    /**
     * Creates a new ranking.
     * This method saves the provided ranking to the database.
     * 
     * @param ranking - The ranking to be created.
     * @returns A promise containing the created ranking.
     * @throws InternalServerErrorException - If there is an error while creating the ranking.
     */
    async create(ranking: Ranking): Promise<Ranking> {
        try {
            return await this.rankingsRepository.save(ranking);
        } catch (error) {
            throw new InternalServerErrorException('Error creating ranking', error.message);
        }
    }


    /**
     * Fetches all rankings for a specific tournament.
     * This method retrieves the rankings for a tournament, ordered by points in descending order,
     * and maps them to the IRanking DTO format.
     * 
     * @param tournamentId - The ID of the tournament.
     * @param userId - The ID of the user for additional context (e.g., checking if a user is part of the team).
     * @returns A promise containing the list of rankings for the given tournament.
     * @throws InternalServerErrorException - If there is an error while fetching the rankings.
     */
    async findAllByTournamentId(tournamentId: string, userId: string): Promise<IRanking[]> {
        try {
            // Retrieve rankings with the appropriate relations
            const rankings = await this.rankingsRepository.find({
                where: { tournament: { id: tournamentId } },
                relations: ['team', 'team.players', 'tournament'],
                order: { points: 'DESC' }
            });

            if (!rankings || rankings.length === 0) {
                return [];
            }

            const mapRankings = rankings
                .map(ranking => {
                    if (!ranking.team || !ranking.team.id) {
                        console.error('Missing team or team ID for ranking:', ranking.id);
                        return null;
                    }

                    if (!ranking.tournament || !ranking.tournament.id) {
                        console.error('Missing tournament or invalid tournament for ranking:', ranking.id);
                        return null;
                    }

                    return mapToIRanking(ranking, userId);
                })
                .filter((ranking): ranking is IRanking => ranking !== null);

            return mapRankings;

        } catch (error) {
            throw new InternalServerErrorException('Error fetching rankings');
        }
    }


    /**
     * Updates the rankings based on the match results.
     * This method updates the rankings by awarding points to the teams based on the match scores.
     * 
     * @param tournamentId - The ID of the tournament in which the match took place.
     * @param team1Id - The ID of the first team.
     * @param team2Id - The ID of the second team.
     * @param scoreTeam1 - The score of the first team.
     * @param scoreTeam2 - The score of the second team.
     * @returns A promise indicating that the rankings have been updated.
     * @throws NotFoundException - If the rankings for one or both teams are not found.
     * @throws InternalServerErrorException - If there is an error while updating the rankings.
     */
    async update(tournamentId: string, team1Id: string, team2Id: string, scoreTeam1: number, scoreTeam2: number): Promise<void> {
        try {
            const team1Ranking = await this.rankingsRepository.findOne({
                where: { tournament: { id: tournamentId }, team: { id: team1Id } }
            });

            const team2Ranking = await this.rankingsRepository.findOne({
                where: { tournament: { id: tournamentId }, team: { id: team2Id } }
            });

            if (!team1Ranking || !team2Ranking) {
                throw new NotFoundException('Ranking not found for one or both teams');
            }

            // Calculer les points pour l'équipe 1 en fonction du score
            if (scoreTeam1 > scoreTeam2) {
                team1Ranking.points += 3;
            } else if (scoreTeam2 > scoreTeam1) {
                team2Ranking.points += 3;
            } else {
                team1Ranking.points += 1;
                team2Ranking.points += 1;
            }

            await this.rankingsRepository.save([team1Ranking, team2Ranking]);
            await this.updateRankingPositions(tournamentId);

        } catch (error) {
            throw new InternalServerErrorException('Error updating rankings', error.message);
        }
    }

    /**
     * Updates the ranking positions based on the current points.
     * This method recalculates the positions of all teams in the tournament based on the points in descending order.
     * 
     * @param tournamentId - The ID of the tournament whose rankings are to be updated.
     * @returns A promise indicating that the ranking positions have been updated.
     * @throws InternalServerErrorException - If there is an error while updating the ranking positions.
     */
    async updateRankingPositions(tournamentId: string): Promise<void> {
        try {
            const rankings = await this.rankingsRepository.find({
                where: { tournament: { id: tournamentId } },
                order: { points: 'DESC' },
            });

            rankings.forEach((ranking, index) => {
                ranking.position = index + 1;
            });

            await this.rankingsRepository.save(rankings);
        } catch (error) {
            throw new InternalServerErrorException('Error updating ranking positions', error.message);
        }
    }
}
