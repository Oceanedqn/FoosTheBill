import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { User } from '../users/user.entity';
import { CreateTeamDto, TeamResponseDto, TeamsWithTournamentReponseDto } from './dto/team.dto';
import { mapToTournamentResponseDto, mapToUserResponseDto } from 'src/utils/dto-helper';
import { Tournament } from 'src/tournaments/tournament.entity';
import { UsersService } from 'src/users/users.service';
import { TournamentsService } from 'src/tournaments/tournaments.service';
import { TournamentTeamsResponseDto } from 'src/tournaments/dto/tournament.dto';

@Injectable()
export class TeamsService {
    constructor(
        @InjectRepository(Team) private teamsRepository: Repository<Team>,
        @InjectRepository(Tournament) private tournamentsRepository: Repository<Tournament>,
        @InjectRepository(User) private usersRepository: Repository<User>,
        private readonly usersService: UsersService,
        private readonly tournamentService: TournamentsService
    ) { }


    /**
     * Create a new team with one or two participants.
     * @param team - The team data to be created, including participants and tournament.
     * @returns The created team data.
     * @throws NotFoundException if the tournament or participants are not found.
     * @throws InternalServerErrorException if there is an error during team creation.
     */
    async createByTournamentId(createTeamDto: CreateTeamDto): Promise<TeamsWithTournamentReponseDto> {
        try {

            const player1 = await this.usersService.findOne(createTeamDto.participant1);
            const tournament = await this.tournamentService.findOne(createTeamDto.tournament_id);
    
            // Vérifier si le participant 2 existe (si fourni)
            let player2: User | null = null;
            if (createTeamDto.participant2) {
                player2 = await this.usersRepository.findOne({
                    where: { id: createTeamDto.participant2 },
                });
            }
    
            // Créer l'équipe
            const team = this.teamsRepository.create({
                name: createTeamDto.name,
                tournament: tournament,  // Assurez-vous d'assigner l'entité tournoi
                participant1: player1,
                participant2: player2,
            });
    
            // Sauvegarder l'équipe
            await this.teamsRepository.save(team);
    
            // Renvoyer la réponse structurée avec les données appropriées
            return {
                id: team.id,
                name: team.name,
                tournament: tournament,
                participant1: player1,
                participant2: player2,
            };
        } catch (error) {
            console.error("Error creating team:", error); // Log the error to understand the failure point
            throw new InternalServerErrorException('Error creating team', error.message);
        }
    }

    

    /**
         * Retrieves all teams associated with a specific tournament.
         * This function fetches the list of teams related to a specific tournament and maps them to DTOs.
         * @param tournamentId - The ID of the tournament.
         * @returns Promise<TeamResponseDto[]> - A list of teams associated with the tournament.
         * @throws NotFoundException - If the tournament with the given ID is not found.
         * @throws InternalServerErrorException - If an error occurs while retrieving teams.
         */
        async findAllByTournamentId(tournamentId: string): Promise<TournamentTeamsResponseDto> {
            try {
                const tournament = await this.tournamentService.findOne(tournamentId);
    
                if (!tournament) {
                    throw new NotFoundException(`Tournament with id ${tournamentId} not found`);
                }

                const teams = await this.teamsRepository.find({ where: { tournament: { id: tournamentId } }, relations: ['participant1', 'participant2'] });
    
                // Mapping the teams to DTOs
                const response: TournamentTeamsResponseDto = {
                    tournament: tournament,
                    teams: teams.map(team => ({
                        id: team.id,
                        name: team.name,
                        participant1: {
                            id: team.participant1.id,
                            name: team.participant1.name,
                            firstname: team.participant1.firstname,
                            email: team.participant1.email,
                            role: team.participant1.role
                        },
                        participant2: team.participant2
                            ? {
                                id: team.participant2.id,
                                name: team.participant2.name,
                                firstname: team.participant2.firstname,
                                email: team.participant2.email,
                                role: team.participant2.role
                            }
                            : null,
                    })),
                }
    
                return response;
            } catch (error) {
                console.error("[Service findAllTeams] Error: ", error);
                throw new InternalServerErrorException('Error retrieving teams for tournament', error.message);
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
