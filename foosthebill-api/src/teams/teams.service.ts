import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { Tournament } from '../tournaments/tournament.entity';
import { User } from '../users/user.entity';

@Injectable()
export class TeamsService {
    constructor(
        @InjectRepository(Team)
        private teamsRepository: Repository<Team>,

        @InjectRepository(Tournament)
        private tournamentsRepository: Repository<Tournament>,

        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    /**
     * Create a new team with one or two participants.
     * @param team - The team data to be created, including participants and tournament.
     * @returns The created team data.
     * @throws NotFoundException if the tournament or participants are not found.
     * @throws InternalServerErrorException if there is an error during team creation.
     */
    async create(team: Team): Promise<Team> {
        try {
            // Check if the tournament exists
            const tournament = await this.tournamentsRepository.findOne({
                where: { id: team.tournament.id },
            });
            if (!tournament) {
                throw new NotFoundException(`Tournament with id ${team.tournament.id} not found`);
            }

            // Check if participant 1 exists
            if (!team.participant1) {
                throw new NotFoundException('Participant 1 is required');
            }
            const participant1 = await this.usersRepository.findOne({
                where: { id: team.participant1.id },
            });
            if (!participant1) {
                throw new NotFoundException(`Participant 1 with id ${team.participant1.id} not found`);
            }

            // If participant 2 is provided, check its existence
            if (team.participant2) {
                const participant2 = await this.usersRepository.findOne({
                    where: { id: team.participant2.id },
                });
                if (!participant2) {
                    throw new NotFoundException(`Participant 2 with id ${team.participant2.id} not found`);
                }
            }

            // Save the new team
            team.tournament = tournament;
            team.participant1 = participant1;
            return await this.teamsRepository.save(team);
        } catch (error) {
            throw new InternalServerErrorException('Error creating team', error.message);
        }
    }

    /**
     * Retrieve all teams, optionally filtered by tournament ID.
     * @param tournamentId - (Optional) The ID of the tournament to filter teams by.
     * @returns A list of teams, potentially filtered by tournament.
     * @throws InternalServerErrorException if there is an error while fetching the teams.
     */
    async findAll(tournamentId?: string): Promise<Team[]> {
        try {
            const query = this.teamsRepository.createQueryBuilder('team')
                .leftJoinAndSelect('team.tournament', 'tournament')  // Join with tournament
                .leftJoinAndSelect('team.participant1', 'participant1')  // Join with participant 1
                .leftJoinAndSelect('team.participant2', 'participant2');  // Join with participant 2

            // If a tournamentId is provided, filter by tournament
            if (tournamentId) {
                query.where('team.tournament_id = :tournamentId', { tournamentId });
            }

            return await query.getMany();  // Retrieve all teams
        } catch (error) {
            console.error('Error in findAll:', error);  // Log error details
            throw new InternalServerErrorException('Error fetching teams', error.message);
        }
    }

    /**
     * Retrieve a specific team by its IDs (commented-out in the code).
     * @param id1 - The first part of the team's ID.
     * @param id2 - The second part of the team's ID.
     * @returns The team with the specified IDs and its related data.
     * @throws NotFoundException if the team is not found.
     * @throws InternalServerErrorException if there is an error during retrieval.
     */
    // async findOne(id1: string, id2: string): Promise<Team> {
    //     try {
    //         const team = await this.teamsRepository.findOne({
    //             where: { id1, id2 },
    //             relations: ['tournament', 'participant1', 'participant2'],  // Load related entities
    //         });
    //         if (!team) {
    //             throw new NotFoundException(`Team with id ${id} not found`);
    //         }
    //         return team;
    //     } catch (error) {
    //         if (error instanceof NotFoundException) {
    //             throw error;  // Rethrow NotFoundException
    //         }
    //         throw new InternalServerErrorException('Error fetching team', error.message);
    //     }
    // }

    /**
     * Update an existing team by its ID (commented-out in the code).
     * @param id - The ID of the team to be updated.
     * @param team - The updated team data.
     * @returns void
     * @throws NotFoundException if the team, participants, or tournament are not found.
     * @throws InternalServerErrorException if there is an error while updating the team.
     */
    // async update(id: string, team: Team): Promise<void> {
    //     try {
    //         const existingTeam = await this.findOne(id); // Check if team exists
    //         if (!existingTeam) {
    //             throw new NotFoundException(`Team with id ${id} not found`);
    //         }

    //         // Check if participants and tournament exist
    //         if (team.participant1) {
    //             const participant1 = await this.usersRepository.findOne({
    //                 where: { id: team.participant1.id },
    //             });
    //             if (!participant1) {
    //                 throw new NotFoundException(`Participant 1 with id ${team.participant1.id} not found`);
    //             }
    //             existingTeam.participant1 = participant1;
    //         }

    //         if (team.participant2) {
    //             const participant2 = await this.usersRepository.findOne({
    //                 where: { id: team.participant2.id },
    //             });
    //             if (!participant2) {
    //                 throw new NotFoundException(`Participant 2 with id ${team.participant2.id} not found`);
    //             }
    //             existingTeam.participant2 = participant2;
    //         }

    //         if (team.tournament) {
    //             const tournament = await this.tournamentsRepository.findOne({
    //                 where: { id: team.tournament.id },
    //             });
    //             if (!tournament) {
    //                 throw new NotFoundException(`Tournament with id ${team.tournament.id} not found`);
    //             }
    //             existingTeam.tournament = tournament;
    //         }

    //         // Save updated team
    //         await this.teamsRepository.save(existingTeam);
    //     } catch (error) {
    //         throw new InternalServerErrorException('Error updating team', error.message);
    //     }
    // }

    /**
     * Delete a specific team by its ID (commented-out in the code).
     * @param id - The ID of the team to be deleted.
     * @returns void
     * @throws NotFoundException if the team is not found.
     * @throws InternalServerErrorException if there is an error while deleting the team.
     */
    // async remove(id: string): Promise<void> {
    //     try {
    //         const team = await this.findOne(id);  // Check if team exists
    //         if (!team) {
    //             throw new NotFoundException(`Team with id ${id} not found`);
    //         }
    //         await this.teamsRepository.delete(id);
    //     } catch (error) {
    //         throw new InternalServerErrorException('Error deleting team', error.message);
    //     }
    // }
}
