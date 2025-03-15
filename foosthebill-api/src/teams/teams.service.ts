import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';

@Injectable()
export class TeamsService {
    constructor(
        @InjectRepository(Team)
        private teamsRepository: Repository<Team>,
    ) { }

    async create(team: Team): Promise<Team> {
        try {
            return await this.teamsRepository.save(team);
        } catch (error) {
            throw new InternalServerErrorException('Error creating team', error.message);
        }
    }

    async findAll(): Promise<Team[]> {
        try {
            return await this.teamsRepository.find();
        } catch (error) {
            throw new InternalServerErrorException('Error fetching teams', error.message);
        }
    }

    async findOne(id: number): Promise<Team> {
        try {
            const team = await this.teamsRepository.findOne({ where: { id } });
            if (!team) {
                throw new NotFoundException(`Team with id ${id} not found`);
            }
            return team;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error; // Relancer NotFoundException
            }
            throw new InternalServerErrorException('Error fetching team', error.message);
        }
    }

    async update(id: number, team: Team): Promise<void> {
        try {
            await this.findOne(id); // Vérifier si l'équipe existe avant de la mettre à jour
            await this.teamsRepository.update(id, team);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error; // Relancer NotFoundException si l'équipe n'est pas trouvée
            }
            throw new InternalServerErrorException('Error updating team', error.message);
        }
    }

    async remove(id: number): Promise<void> {
        try {
            const team = await this.findOne(id);  // Vérifier si l'équipe existe
            if (!team) {
                throw new NotFoundException(`Team with id ${id} not found`); // Ajouter la NotFoundException
            }
            await this.teamsRepository.delete(id);
        } catch (error) {
            throw new InternalServerErrorException('Error deleting team', error.message);
        }
    }
}
