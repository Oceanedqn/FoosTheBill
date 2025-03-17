import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from './tournament.entity';
import { CreateTournamentDto, TournamentResponseDto, UpdateTournamentDto } from './dto/tournament.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TournamentsService {
    constructor(
        @InjectRepository(Tournament)
        private tournamentsRepository: Repository<Tournament>,  // Tournament repository for DB operations
        private readonly usersService: UsersService,  // User service to fetch user details
    ) { }

    /**
     * Creates a new tournament.
     * 
     * @param createTournamentDto - Data transfer object containing tournament details (name, description, start date).
     * @param userId - The ID of the user creating the tournament (admin).
     * 
     * @returns Promise<TournamentResponseDto> - A response object containing the details of the created tournament and admin.
     * 
     * @throws BadRequestException - If the start date is in the past.
     * @throws InternalServerErrorException - If an error occurs during the creation process.
     */
    async create(createTournamentDto: CreateTournamentDto, userId: string): Promise<TournamentResponseDto> {
        try {
            createTournamentDto.admin_id = userId;

            // Ensure the start date is not in the past
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Only compare the date (not the time)

            const startDate = new Date(createTournamentDto.start_date);
            if (startDate < today) {
                throw new BadRequestException("Start date cannot be in the past.");
            }

            const user = await this.usersService.findOne(userId); // Fetch the user (admin)
            const tournament = await this.tournamentsRepository.save(createTournamentDto); // Save tournament to DB

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
     * 
     * @returns Promise<TournamentResponseDto[]> - An array of tournament response objects containing tournament details and admin info.
     * 
     * @throws InternalServerErrorException - If an error occurs while retrieving tournaments.
     */
    async findAll(): Promise<TournamentResponseDto[]> {
        try {
            const tournaments = await this.tournamentsRepository.find(); // Retrieve all tournaments

            // Map through all tournaments and fetch admin details for each
            return Promise.all(
                tournaments.map(async (tournament) => {
                    const admin = await this.usersService.findOne(tournament.admin_id); // Fetch admin for each tournament

                    return {
                        id: tournament.id,
                        name: tournament.name,
                        description: tournament.description,
                        start_date: tournament.start_date,
                        admin: {
                            id: admin.id,
                            name: admin.name,
                            firstname: admin.firstname,
                            email: admin.email,
                            role: admin.role
                        },
                    };
                })
            );
        } catch (error) {
            throw new InternalServerErrorException('Error retrieving tournaments', error.message);
        }
    }

    /**
     * Retrieves a single tournament by ID.
     * 
     * @param id - The ID of the tournament to retrieve.
     * 
     * @returns Promise<TournamentResponseDto> - The details of the tournament along with admin info.
     * 
     * @throws NotFoundException - If the tournament with the given ID is not found.
     * @throws InternalServerErrorException - If an error occurs while retrieving the tournament.
     */
    async findOne(id: string): Promise<TournamentResponseDto> {
        try {
            const tournament = await this.tournamentsRepository.findOne({ where: { id } }); // Retrieve tournament by ID
            if (!tournament) {
                throw new NotFoundException(`Tournament with id ${id} not found`); // If not found, throw exception
            }

            const user = await this.usersService.findOne(tournament.admin_id); // Fetch admin of the tournament

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
            if (error instanceof NotFoundException) {
                throw error; // Re-throw NotFoundException
            }
            throw new InternalServerErrorException('Error retrieving tournament', error.message); // Handle other errors
        }
    }

    /**
     * Updates an existing tournament.
     * 
     * @param id - The ID of the tournament to update.
     * @param tournament - The updated tournament data.
     * 
     * @returns Promise<void> - Void if the update is successful.
     * 
     * @throws NotFoundException - If the tournament with the given ID is not found.
     * @throws InternalServerErrorException - If an error occurs while updating the tournament.
     */
    async update(id: string, tournament: UpdateTournamentDto): Promise<void> {
        try {
            const result = await this.tournamentsRepository.update(id, tournament); // Update tournament by ID
            if (result.affected === 0) {
                throw new NotFoundException(`Tournament with id ${id} not found`); // If no rows are affected, throw exception
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error; // Re-throw NotFoundException
            }
            throw new InternalServerErrorException('Error updating tournament', error.message); // Handle other errors
        }
    }

    /**
     * Deletes a tournament by ID.
     * 
     * @param id - The ID of the tournament to delete.
     * 
     * @returns Promise<void> - Void if the deletion is successful.
     * 
     * @throws NotFoundException - If the tournament with the given ID is not found.
     * @throws InternalServerErrorException - If an error occurs while deleting the tournament.
     */
    async remove(id: string): Promise<void> {
        try {
            const result = await this.tournamentsRepository.delete(id); // Delete tournament by ID
            if (result.affected === 0) {
                throw new NotFoundException(`Tournament with id ${id} not found`); // If no rows are affected, throw exception
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error; // Re-throw NotFoundException
            }
            throw new InternalServerErrorException('Error deleting tournament', error.message); // Handle other errors
        }
    }
}
