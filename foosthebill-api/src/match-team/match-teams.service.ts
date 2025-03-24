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

    /**
      * Retrieves all MatchTeams.
      * This method fetches all the MatchTeams, including their related match and team data.
      * 
      * @returns A promise containing an array of MatchTeams with their relations.
      */
    async findAll(): Promise<MatchTeam[]> {
        return this.matchTeamsRepository.find({ relations: ['match', 'team'] });
    }

    /**
    * Retrieves a specific MatchTeam based on the provided match and team IDs.
    * This method fetches the MatchTeam based on the given match ID and team ID,
    * including the related match and team data.
    * 
    * @param matchId - The ID of the match.
    * @param teamId - The ID of the team.
    * @returns A promise containing the found MatchTeam.
    * @throws NotFoundException - If the MatchTeam with the provided match ID and team ID is not found.
    */
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

    /**
    * Retrieves a specific MatchTeam by its ID.
    * This method fetches the MatchTeam with the given ID, including the related match and team data.
    * 
    * @param id - The ID of the MatchTeam to retrieve.
    * @returns A promise containing the found MatchTeam.
    * @throws NotFoundException - If the MatchTeam with the provided ID is not found.
    */
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

    /**
    * Creates a new MatchTeam.
    * This method creates and saves a new MatchTeam with the provided data.
    * 
    * @param matchTeamData - The data to create the new MatchTeam.
    * @returns A promise containing the newly created MatchTeam.
    */
    async create(matchTeamData: MatchTeam): Promise<MatchTeam> {
        const matchTeam = this.matchTeamsRepository.create(matchTeamData);
        return this.matchTeamsRepository.save(matchTeam);
    }

    /**
    * Updates the score of a specific MatchTeam.
    * This method updates the score of the MatchTeam identified by the given ID.
    * 
    * @param id - The ID of the MatchTeam to update.
    * @param matchTeamData - The data to update, particularly the score.
    * @returns A promise containing the updated MatchTeam.
    * @throws NotFoundException - If the MatchTeam with the provided ID is not found.
    */
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
