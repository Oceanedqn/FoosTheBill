import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from './tournament.entity';
import { CreateTournamentDto, TournamentPeopleResponseDto, TournamentResponseDto, UpdateTournamentDto } from './dto/tournament.dto';
import { UsersService } from 'src/users/users.service';
import { TeamsService } from 'src/teams/teams.service';

@Injectable()
export class TournamentsService {
    constructor(
        @InjectRepository(Tournament) private tournamentsRepository: Repository<Tournament>,
        @Inject(forwardRef(() => TeamsService)) private readonly teamsService: TeamsService,
        private readonly usersService: UsersService,
    ) { }


    /**
     * Creates a new tournament.
     * This function checks the start date to ensure it is not in the past,
     * maps the user creating the tournament as an admin, and creates the tournament record.
     * @param createTournamentDto - Data transfer object containing tournament details (name, description, start date).
     * @param userId - The ID of the user creating the tournament (admin).
     * @returns Promise<TournamentResponseDto> - A response object containing the details of the created tournament and admin.
     * @throws BadRequestException - If the start date is in the past.
     * @throws InternalServerErrorException - If an error occurs during the creation process.
     */
    async create(createTournamentDto: CreateTournamentDto): Promise<TournamentResponseDto> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const startDate = new Date(createTournamentDto.start_date);
            if (startDate < today) {
                throw new BadRequestException("Start date cannot be in the past.");
            }

            const user = await this.usersService.findOne(createTournamentDto.admin_id);

            const tournament = this.tournamentsRepository.create({
                name: createTournamentDto.name,
                description: createTournamentDto.description,
                start_date: createTournamentDto.start_date,
                admin: user,
            });

            await this.tournamentsRepository.save(tournament);

            return {
                id: tournament.id,
                name: tournament.name,
                description: tournament.description,
                start_date: tournament.start_date,
                admin: {
                    id: user.id,
                    name: user.name,
                    firstname: user.firstname,
                    email: user.email,
                    role: user.role
                },
            };
        } catch (error) {
            throw new InternalServerErrorException('Error creating tournament', error.message);
        }
    }


    /**
     * Retrieves all tournaments.
     * This function fetches all the tournaments along with their respective admin details.
     * @returns Promise<TournamentResponseDto[]> - An array of tournament response objects containing tournament details and admin info.
     * @throws InternalServerErrorException - If an error occurs while retrieving tournaments.
     */
    async findAll(): Promise<TournamentPeopleResponseDto[]> {
        try {
            const tournaments = await this.tournamentsRepository.find({
                relations: ['admin', 'teams', 'teams.participant1', 'teams.participant2'],
            });

            const tournamentResponses: TournamentPeopleResponseDto[] = [];

            for (const tournament of tournaments) {
                // Calculer le nombre de participants distincts
                const participants = new Set<string>(); // Utiliser un Set pour éviter les doublons

                // Itérer sur toutes les équipes du tournoi
                for (const team of tournament.teams) {
                    if (team.participant1) {
                        participants.add(team.participant1.id); // Ajouter l'ID du participant1
                    }
                    if (team.participant2) {
                        participants.add(team.participant2.id); // Ajouter l'ID du participant2
                    }
                }

                const tournamentResponse: TournamentPeopleResponseDto = {
                    id: tournament.id,
                    name: tournament.name,
                    description: tournament.description,
                    start_date: tournament.start_date,
                    admin: {
                        id: tournament.admin.id,
                        name: tournament.admin.name,
                        firstname: tournament.admin.firstname,
                        email: tournament.admin.email,
                        role: tournament.admin.role,
                    },
                    participant_number: participants.size, // Nombre de participants uniques
                };

                tournamentResponses.push(tournamentResponse);
            }

            return tournamentResponses;
        } catch (error) {
            console.error("[Service findAll] Error: ", error);
            throw new InternalServerErrorException('Error retrieving tournaments', error.message);
        }
    }


    /**
     * Retrieves a single tournament by its ID.
     * This function fetches the details of a specific tournament along with its admin information.
     * @param id - The ID of the tournament to retrieve.
     * @returns Promise<TournamentResponseDto> - The details of the tournament along with admin info.
     * @throws NotFoundException - If the tournament with the given ID is not found.
     * @throws InternalServerErrorException - If an error occurs while retrieving the tournament.
     */
    async findOne(id: string): Promise<TournamentResponseDto> {
        try {
            const tournament = await this.tournamentsRepository.findOne({
                where: { id },
                relations: ['admin'],  // Include the admin relation
            });

            if (!tournament) {
                throw new NotFoundException(`Tournament with id ${id} not found`);
            }

            return {
                id: tournament.id,
                name: tournament.name,
                description: tournament.description,
                start_date: tournament.start_date,
                admin: {
                    id: tournament.admin.id,
                    name: tournament.admin.name,
                    firstname: tournament.admin.firstname,
                    email: tournament.admin.email,
                    role: tournament.admin.role,
                },
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error retrieving tournament', error.message);
        }
    }


    /**
     * Updates an existing tournament.
     * This function updates the tournament details for a given tournament ID.
     * @param id - The ID of the tournament to update.
     * @param tournament - The updated tournament data.
     * @returns Promise<void> - Void if the update is successful.
     * @throws NotFoundException - If the tournament with the given ID is not found.
     * @throws InternalServerErrorException - If an error occurs while updating the tournament.
     */
    async update(id: string, tournament: UpdateTournamentDto): Promise<void> {
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


    /**
     * Deletes a tournament by ID.
     * This function deletes a specific tournament based on its ID.
     * @param id - The ID of the tournament to delete.
     * @returns Promise<void> - Void if the deletion is successful.
     * @throws NotFoundException - If the tournament with the given ID is not found.
     * @throws InternalServerErrorException - If an error occurs while deleting the tournament.
     */
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
