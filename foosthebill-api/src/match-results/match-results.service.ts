import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchResult } from './match-result.entity';

@Injectable()
export class MatchResultsService {
    constructor(
        @InjectRepository(MatchResult)
        private matchResultsRepository: Repository<MatchResult>,
    ) { }

    async create(matchResult: MatchResult): Promise<MatchResult> {
        try {
            return await this.matchResultsRepository.save(matchResult);
        } catch (error) {
            throw new InternalServerErrorException('Error creating match result', error.message);
        }
    }

    async findAll(): Promise<MatchResult[]> {
        try {
            return await this.matchResultsRepository.find();
        } catch (error) {
            throw new InternalServerErrorException('Error fetching match results', error.message);
        }
    }

    async findOne(id: string): Promise<MatchResult> {
        try {
            const matchResult = await this.matchResultsRepository.findOne({ where: { id } });
            if (!matchResult) {
                throw new NotFoundException(`Match result with id ${id} not found`);
            }
            return matchResult;
        } catch (error) {
            throw new InternalServerErrorException('Error fetching match result', error.message);
        }
    }

    async update(id: string, matchResult: MatchResult): Promise<void> {
        try {
            await this.findOne(id);
            await this.matchResultsRepository.update(id, matchResult);
        } catch (error) {
            throw new InternalServerErrorException('Error updating match result', error.message);
        }
    }

    async remove(id: string): Promise<void> {
        try {
            await this.findOne(id);
            await this.matchResultsRepository.delete(id);
        } catch (error) {
            throw new InternalServerErrorException('Error deleting match result', error.message);
        }
    }
}
