import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ranking } from './ranking.entity';

@Injectable()
export class RankingsService {
    constructor(
        @InjectRepository(Ranking)
        private rankingsRepository: Repository<Ranking>,
    ) { }

    async create(ranking: Ranking): Promise<Ranking> {
        try {
            return await this.rankingsRepository.save(ranking);
        } catch (error) {
            throw new InternalServerErrorException('Error creating ranking', error.message);
        }
    }

    async findAll(): Promise<Ranking[]> {
        try {
            return await this.rankingsRepository.find();
        } catch (error) {
            throw new InternalServerErrorException('Error fetching rankings', error.message);
        }
    }

    async findOne(id: number): Promise<Ranking> {
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

    async update(id: number, ranking: Ranking): Promise<void> {
        try {
            const existingRanking = await this.findOne(id);
            if (!existingRanking) {
                throw new NotFoundException(`Ranking with id ${id} not found`);
            }
            await this.rankingsRepository.update(id, ranking);
        } catch (error) {
            throw new InternalServerErrorException('Error updating ranking', error.message);
        }
    }

    async remove(id: number): Promise<void> {
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
