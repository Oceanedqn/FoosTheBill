import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchTeam } from './match-team.entity';

@Injectable()
export class MatchTeamsService {
    constructor(
        @InjectRepository(MatchTeam)
        private readonly matchTeamsRepository: Repository<MatchTeam>,
    ) { }

    // Récupérer tous les MatchTeams
    async findAll(): Promise<MatchTeam[]> {
        return this.matchTeamsRepository.find({ relations: ['match', 'team'] });
    }

    async findOneByMatchAndTeam(matchId: string, teamId: string): Promise<MatchTeam> {
        const matchTeam = await this.matchTeamsRepository.findOne({
            where: {
                match: { id: matchId },
                team: { id: teamId },
            },
            relations: ['match', 'team'],
        });

        if (!matchTeam) {
            throw new NotFoundException(`MatchTeam with match ID ${matchId} and team ID ${teamId} not found`);
        }

        return matchTeam;
    }

    // Récupérer un MatchTeam spécifique par son ID
    async findOne(id: string): Promise<MatchTeam> {
        const matchTeam = await this.matchTeamsRepository.findOne({
            where: { id },
            relations: ['match', 'team'],
        });
        if (!matchTeam) {
            throw new NotFoundException(`MatchTeam with ID ${id} not found`);
        }
        return matchTeam;
    }

    // Créer un nouveau MatchTeam
    async create(matchTeamData: MatchTeam): Promise<MatchTeam> {
        const matchTeam = this.matchTeamsRepository.create(matchTeamData);
        return this.matchTeamsRepository.save(matchTeam);
    }

    // Mettre à jour le score d'un MatchTeam
    async update(id: string, matchTeamData: Partial<MatchTeam>): Promise<MatchTeam> {
        const matchTeam = await this.findOne(id);
        if (!matchTeam) {
            throw new NotFoundException(`MatchTeam with ID ${id} not found`);
        }

        // Mise à jour du score
        if (matchTeamData.score !== undefined) {
            matchTeam.score = matchTeamData.score;
        }

        return this.matchTeamsRepository.save(matchTeam);
    }
}
