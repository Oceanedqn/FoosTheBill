import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from './tournament.entity';
import { CreateTournamentDto, TournamentResponseDto, UpdateTournamentDto } from './dto/tournament.dto';
import { UsersService } from 'src/users/users.service';
import { TeamsService } from 'src/teams/teams.service';
import { calculateParticipants } from 'src/utils/services.utils';
import { mapToTournamentResponseDto, mapToUserResponseDto } from 'src/utils/map-dto.utils';

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
     */async create(createTournamentDto: CreateTournamentDto): Promise<TournamentResponseDto> {
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

      return mapToTournamentResponseDto(tournament, mapToUserResponseDto(user)!, new Set(), false);
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
     */async findAll(userId: string): Promise<TournamentResponseDto[]> {
    try {
      const tournaments = await this.tournamentsRepository.find({
        relations: ['admin', 'teams', 'teams.participant1', 'teams.participant2'],
      });

      return await Promise.all(
        tournaments.map(async (tournament) => {
          const participants = calculateParticipants(tournament);
          const isUserRegistered = userId ? await this.teamsService.isUserInTeam(userId, tournament.id) : false;
          return mapToTournamentResponseDto(tournament, mapToUserResponseDto(tournament.admin)!, participants, isUserRegistered);
        })
      );
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

      return mapToTournamentResponseDto(tournament, mapToUserResponseDto(tournament.admin)!, new Set(), false);
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
