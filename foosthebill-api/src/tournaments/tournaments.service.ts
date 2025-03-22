import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from './tournament.entity';
import { CreateTournamentDto, TournamentResponseDto, UpdateTournamentDto } from './dto/tournament.dto';
import { UsersService } from 'src/users/users.service';
import { TeamsService } from 'src/teams/teams.service';
import { calculateParticipants } from 'src/utils/services.utils';
import { mapToTournamentResponseDto, mapToUserResponseDto } from 'src/utils/map-dto.utils';
import { UserResponseDto } from 'src/users/dto/user.dto';
import { MatchesService } from 'src/matches/matches.service';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(Tournament) private tournamentsRepository: Repository<Tournament>,
    @Inject(forwardRef(() => TeamsService)) private readonly teamsService: TeamsService,
    @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
    @Inject(forwardRef(() => MatchesService)) private readonly matchesService: MatchesService,
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
      return mapToTournamentResponseDto(tournament, mapToUserResponseDto(user)!, new Set(), false, false);
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
 * @param userId - The ID of the user requesting the tournaments (used for checking if they are registered).
 * @returns Promise<TournamentResponseDto[]> - A list of tournaments with their details and participant count.
 * @throws InternalServerErrorException - If an error occurs while retrieving tournaments.
 */
  async findAll(userId: string): Promise<TournamentResponseDto[]> {
    try {
      const tournaments = await this.tournamentsRepository.find({
        relations: ['admin', 'teams', 'teams.participant1', 'teams.participant2'],
      });

      return await Promise.all(
        tournaments.map(async (tournament) => {
          const participants = calculateParticipants(tournament);
          const isUserRegistered = userId ? await this.teamsService.isUserInTeam(userId, tournament.id) : false;
          const isMatches = await this.matchesService.isMatchesCreated(tournament.id);
          return mapToTournamentResponseDto(tournament, mapToUserResponseDto(tournament.admin)!, participants, isUserRegistered, isMatches);
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
  async findOne(id: string, userId: string): Promise<TournamentResponseDto> {
    try {
      const tournament = await this.tournamentsRepository.findOne({
        where: { id },
        relations: ['admin'],
      });

      if (!tournament) {
        throw new NotFoundException(`Tournament with id ${id} not found`);
      }

      const isUserRegistered = userId ? await this.teamsService.isUserInTeam(userId, tournament.id) : false;
      const isMatches = await this.matchesService.isMatchesCreated(tournament.id);
      return mapToTournamentResponseDto(tournament, mapToUserResponseDto(tournament.admin)!, new Set(), isUserRegistered, isMatches);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }


  /**
 * Retrieves all users who are not registered in a team for a specific tournament.
 * 
 * @param tournamentId - The ID of the tournament for which to find users not yet registered.
 * @param userId - The ID of the user making the request (optional, for checking their status).
 * @returns Promise<UserResponseDto[]> - A list of users not registered in the given tournament.
 * @throws InternalServerErrorException - If an error occurs while fetching users.
 */
  async findAllUsersNotInTournament(tournamentId: string, userId: string): Promise<UserResponseDto[]> {
    try {
      const users = await this.usersService.findAll();
      const tournamentTeams = await this.teamsService.findAllTeamByTournamentId(tournamentId, userId);
      const usersInTeams = new Set<string>();

      tournamentTeams.teams.forEach(team => {
        if (team.participant1) {
          usersInTeams.add(team.participant1.id);
        }
        if (team.participant2) {
          usersInTeams.add(team.participant2.id);
        }
      });

      const usersNotInTournament = users.filter(user => !usersInTeams.has(user.id));

      return usersNotInTournament;

    } catch (error) {
      throw new InternalServerErrorException('Error fetching users', error.message);
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
