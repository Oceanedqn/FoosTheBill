import { Injectable, NotFoundException, InternalServerErrorException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ranking } from './ranking.entity';
import { RankingsResponseDto, TournamentRankingsResponseDto } from './dto/ranking.dto';
import { mapToRankingsResponseDto } from 'src/utils/map-dto.utils';
import { TournamentsService } from 'src/tournaments/tournaments.service';

@Injectable()
export class RankingsService {
    constructor(
        @InjectRepository(Ranking)
        private rankingsRepository: Repository<Ranking>,
        @Inject(forwardRef(() => TournamentsService))
        private readonly tournamentsService: TournamentsService
    ) { }

    async create(ranking: Ranking): Promise<Ranking> {
        try {
            return await this.rankingsRepository.save(ranking);
        } catch (error) {
            throw new InternalServerErrorException('Error creating ranking', error.message);
        }
    }

    async findAllByTournamentId(tournamentId: string, userId: string): Promise<TournamentRankingsResponseDto> {
        const tournament = await this.tournamentsService.findOne(tournamentId, userId);

        try {
            const rankings = await this.rankingsRepository.find({
                where: { tournament: { id: tournamentId } },
                relations: ['tournament', 'team', 'team.participant1', 'team.participant2'],
                order: { points: 'DESC' }
            });

            const mapRankings = mapToRankingsResponseDto(rankings, userId);

            const tournamentRankings: TournamentRankingsResponseDto = {
                tournament: tournament,
                rankings: mapRankings
            }

            return tournamentRankings;
        } catch (error) {
            throw new InternalServerErrorException('Error fetching rankings', error.message);
        }
    }

    async findOne(id: string): Promise<Ranking> {
        try {
            const ranking = await this.rankingsRepository.findOne({ where: { id } });
            if (!ranking) {
                throw new NotFoundException(`Ranking with id ${id} not found`);
            }
            return ranking;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error fetching ranking', error.message);
        }
    }

    async update(tournamentId: string, team1Id: string, team2Id: string, score1: number, score2: number): Promise<void> {
        try {
            const rankingTeam1 = await this.rankingsRepository.findOne({
                where: { tournament: { id: tournamentId }, team: { id: team1Id } },
                relations: ["team", "tournament"]
            });

            const rankingTeam2 = await this.rankingsRepository.findOne({
                where: { tournament: { id: tournamentId }, team: { id: team2Id } },
                relations: ["team", "tournament"]
            });

            if (!rankingTeam1 || !rankingTeam2) {
                throw new NotFoundException('Ranking not found for one of the teams');
            }

            if (score1 > score2) {
                rankingTeam1.points += 3;
            } else if (score2 > score1) {
                rankingTeam2.points += 3;
            } else {
                rankingTeam1.points += 1;
                rankingTeam2.points += 1;
            }

            await this.rankingsRepository.save([rankingTeam1, rankingTeam2]);

        } catch (error) {
            throw new InternalServerErrorException('Error updating rankings', error.message);
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const existingRanking = await this.findOne(id);
            if (!existingRanking) {
                throw new NotFoundException(`Ranking with id ${id} not found`);
            }
            await this.rankingsRepository.delete(id);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error deleting ranking', error.message);
        }
    }
}
