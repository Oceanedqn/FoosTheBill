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

    async create(ranking: Ranking): Promise<Ranking> {
        try {
            return await this.rankingsRepository.save(ranking);
        } catch (error) {
            throw new InternalServerErrorException('Error creating ranking', error.message);
        }
    }

    async findAllByTournamentId(tournamentId: string, userId: string): Promise<IRanking[]> {
        try {
            // Retrieve rankings with the appropriate relations
            const rankings = await this.rankingsRepository.find({
                where: { tournament: { id: tournamentId } },
                relations: ['team', 'team.players', 'tournament'],
                order: { points: 'DESC' }
            });

            console.log("Rankings with loaded relations:", rankings);

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



    async update(tournamentId: string, team1Id: string, team2Id: string, scoreTeam1: number, scoreTeam2: number): Promise<void> {
        console.log("Updating rankings for teams:", team1Id, team2Id);
        console.log("Scores:", scoreTeam1, scoreTeam2);

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
