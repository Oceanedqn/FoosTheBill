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
        private tournamentsRepository: Repository<Tournament>,
        private readonly usersService: UsersService,
    ) { }

    /**
     * Creates a new tournament.
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
     * @returns Promise<TournamentResponseDto[]> - An array of tournament response objects containing tournament details and admin info.
     * @throws InternalServerErrorException - If an error occurs while retrieving tournaments.
     */
    async findAll(): Promise<TournamentResponseDto[]> {
        try {
            const tournaments = await this.tournamentsRepository.find({
                relations: ['admin'],
            });

            const tournamentResponses: TournamentResponseDto[] = [];

            for (const tournament of tournaments) {
                const tournamentResponse: TournamentResponseDto = {
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

                tournamentResponses.push(tournamentResponse);
            }

            return tournamentResponses;

        } catch (error) {
            console.error("[Service findAll] Error: ", error);
            throw new InternalServerErrorException('Error retrieving tournaments', error.message);
        }
    }

    /**
     * Retrieves a single tournament by ID.
     * @param id - The ID of the tournament to retrieve.
     * @returns Promise<TournamentResponseDto> - The details of the tournament along with admin info.
     * @throws NotFoundException - If the tournament with the given ID is not found.
     * @throws InternalServerErrorException - If an error occurs while retrieving the tournament.
     */
    async findOne(admin_id: string): Promise<TournamentResponseDto> {
        try {
            const tournament = await this.tournamentsRepository.findOne({
                where: { admin: { id: admin_id } },
                relations: ['admin'],
            });

            if (!tournament) {
                throw new NotFoundException(`Tournament with admin_id ${admin_id} not found`);
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
