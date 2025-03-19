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
     * 
     * Validates that the start date is not in the past, assigns the tournament creator as the admin,
     * and persists the tournament in the database.
     * 
     * @param createTournamentDto - Data transfer object containing tournament details (name, description, start date).
     * @returns Promise<TournamentResponseDto> - A response object with tournament details and the assigned admin.
     * @throws BadRequestException - If the start date is in the past.
     * @throws InternalServerErrorException - If an error occurs during creation.
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
            throw new InternalServerErrorException(error.message);
        }
    }

    /**
     * Retrieves all tournaments.
     * 
     * Fetches all tournaments along with their respective admin and teams, 
     * then calculates the number of unique participants.
     * 
     * @returns Promise<TournamentPeopleResponseDto[]> - A list of tournaments with their details and participant count.
     * @throws InternalServerErrorException - If an error occurs while retrieving tournaments.
     */
    async findAll(userId: string): Promise<TournamentPeopleResponseDto[]> {
        try {
            const tournaments = await this.tournamentsRepository.find({
                relations: ['admin', 'teams', 'teams.participant1', 'teams.participant2'],
            });

            const tournamentResponses: TournamentPeopleResponseDto[] = [];

            for (const tournament of tournaments) {
                // Use a Set to track unique participant IDs
                const participants = new Set<string>();

                for (const team of tournament.teams) {
                    if (team.participant1) {
                        participants.add(team.participant1.id);
                    }
                    if (team.participant2) {
                        participants.add(team.participant2.id);
                    }
                }

                let isUserRegistered = false;
            if (userId) {
                isUserRegistered = await this.teamsService.isUserInTeam(userId, tournament.id);
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
                    participant_number: participants.size,
                    isRegister: isUserRegistered
                };

                tournamentResponses.push(tournamentResponse);
            }

            return tournamentResponses;
        } catch (error) {
            console.error("[Service findAll] Error: ", error);
            throw new InternalServerErrorException(error.message);
        }
    }

    /**
     * Retrieves a single tournament by its ID.
     * 
     * Fetches the tournament details along with its admin.
     * 
     * @param id - The ID of the tournament to retrieve.
     * @returns Promise<TournamentResponseDto> - Tournament details including admin info.
     * @throws NotFoundException - If no tournament is found with the given ID.
     * @throws InternalServerErrorException - If an error occurs during retrieval.
     */
    async findOne(id: string): Promise<TournamentResponseDto> {
        try {
            const tournament = await this.tournamentsRepository.findOne({
                where: { id },
                relations: ['admin'],
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
            throw new InternalServerErrorException(error.message);
        }
    }

    /**
     * Updates an existing tournament.
     * 
     * Modifies tournament details based on the provided ID.
     * 
     * @param id - The ID of the tournament to update.
     * @param tournament - The updated tournament data.
     * @returns Promise<void> - Resolves if the update is successful.
     * @throws NotFoundException - If no tournament is found with the given ID.
     * @throws InternalServerErrorException - If an error occurs during the update.
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
            throw new InternalServerErrorException(error.message);
        }
    }

    /**
     * Deletes a tournament by ID.
     * 
     * Removes a tournament from the database based on the given ID.
     * 
     * @param id - The ID of the tournament to delete.
     * @returns Promise<void> - Resolves if the deletion is successful.
     * @throws NotFoundException - If no tournament is found with the given ID.
     * @throws InternalServerErrorException - If an error occurs during deletion.
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
            throw new InternalServerErrorException(error.message);
        }
    }
}
