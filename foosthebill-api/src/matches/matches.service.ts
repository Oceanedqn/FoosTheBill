import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './match.entity';

@Injectable()
export class MatchesService {
    constructor(
        @InjectRepository(Match)
        private matchesRepository: Repository<Match>,
    ) { }

    // Méthode pour créer un match (comme dans rankings.service.ts)
    async create(match: Match): Promise<Match> {
        try {
            return await this.matchesRepository.save(match);
        } catch (error) {
            throw new InternalServerErrorException('Error creating match', error.message);
        }
    }

    async findAll(): Promise<Match[]> {
        try {
            return await this.matchesRepository.find();
        } catch (error) {
            throw new InternalServerErrorException('Error fetching matches', error.message);
        }
    }

    // Méthode pour récupérer un match
    async findOne(id: string): Promise<Match> {
        try {
            const match = await this.matchesRepository.findOne({ where: { id } });
            if (!match) {
                throw new NotFoundException(`Match with id ${id} not found`);
            }
            return match;
        } catch (error) {
            throw new InternalServerErrorException('Error fetching match', error.message);
        }
    }

    async update(id: string, match: Match): Promise<void> {
        try {
            await this.findOne(id);
            await this.matchesRepository.update(id, match);
        } catch (error) {
            throw new InternalServerErrorException('Error updating match', error.message);
        }
    }

    // Méthode pour supprimer un match
    async remove(id: string): Promise<any> {
        try {
            const result = await this.matchesRepository.delete(id);
            if (result.affected === 0) {
                throw new NotFoundException(`Match with id ${id} not found`);
            }
            return result;
        } catch (error) {
            throw new InternalServerErrorException('Error deleting match', error.message);
        }
    }
}