import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from './tournament.entity';

@Injectable()
export class TournamentsService {
    constructor(
        @InjectRepository(Tournament)
        private tournamentsRepository: Repository<Tournament>,
    ) { }

    async create(tournament: Tournament): Promise<Tournament> {
        try {
            return await this.tournamentsRepository.save(tournament);
        } catch (error) {
            throw new InternalServerErrorException('Error creating tournament', error.message);
        }
    }

    async findAll(): Promise<Tournament[]> {
        try {
            return await this.tournamentsRepository.find();
        } catch (error) {
            throw new InternalServerErrorException('Error retrieving tournaments', error.message);
        }
    }

    async findOne(id: string): Promise<Tournament> {
        try {
            const tournament = await this.tournamentsRepository.findOne({ where: { id } });
            if (!tournament) {
                throw new NotFoundException(`Tournament with id ${id} not found`);
            }
            return tournament;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error retrieving tournament', error.message);
        }
    }

    async update(id: string, tournament: Tournament): Promise<void> {
        try {
            const result = await this.tournamentsRepository.update(id, tournament);
            if (result.affected === 0) {
                throw new NotFoundException(`Tournament with id ${id} not found`);
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error updating tournament', error.message);
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const result = await this.tournamentsRepository.delete(id);
            if (result.affected === 0) {
                throw new NotFoundException(`Tournament with id ${id} not found`);
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error deleting tournament', error.message);
        }
    }
}
