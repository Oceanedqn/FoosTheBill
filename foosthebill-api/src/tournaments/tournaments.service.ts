import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from './tournament.entity';
import { ICreateTournament, ITournament, ITournamentDetails, ITournamentMatches, IUpdateTournament } from './dto/tournament.dto';
import { UsersService } from 'src/users/users.service';
import { TeamsService } from 'src/teams/teams.service';
// import { calculateParticipants } from 'src/utils/services.utils';
import { mapToITeam, mapToITeamRanking, mapToITournament, mapToIUser } from 'src/utils/map-dto.utils';
import { MatchesService } from 'src/matches/matches.service';
import { RankingsService } from 'src/rankings/rankings.service';
import { calculateParticipantsCount } from 'src/utils/services.utils';
import { IRoundMatches } from 'src/matches/dto/match.dto';
import { ITeam } from 'src/teams/dto/team.dto';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(Tournament) private tournamentsRepository: Repository<Tournament>,
    @Inject(forwardRef(() => TeamsService)) private readonly teamsService: TeamsService,
    @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
    @Inject(forwardRef(() => MatchesService)) private readonly matchesService: MatchesService,
    @Inject(forwardRef(() => RankingsService)) private readonly rankingsService: RankingsService
  ) { }


  /**
    * Creates a new tournament.
    * 
    * Validates that the start date is not in the past, assigns the tournament creator as the admin,
    * and persists the tournament in the database.
    * 
    * @param createTournament - Data transfer object containing tournament details (name, description, start date).
    * @returns {Promise<ITournament>} - The created tournament with its details.
    * @throws {BadRequestException} - If the start date is in the past.
    * @throws {InternalServerErrorException} - If an error occurs during the creation process.
    */
  async create(createTournament: ICreateTournament): Promise<ITournament> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDate = new Date(createTournament.start_date);
      if (startDate < today) {
        throw new BadRequestException("Start date cannot be in the past.");
      }

      const user = await this.usersService.findOne(createTournament.admin_id);

      const tournament = this.tournamentsRepository.create({
        name: createTournament.name,
        description: createTournament.description,
        start_date: createTournament.start_date,
        admin: user,
      });

      await this.tournamentsRepository.save(tournament);
      return mapToITournament(tournament, false, false, 0);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Retrieves the details of a single tournament by its ID.
   * 
   * Fetches the tournament along with its admin, teams, and rankings.
   * 
   * @param id - The ID of the tournament to retrieve.
   * @param userId - The ID of the user requesting the tournament details (used to check if the user is registered).
   * @returns {Promise<ITournamentDetails>} - The tournament details including admin, teams, and rankings.
   * @throws {NotFoundException} - If no tournament is found with the given ID.
   * @throws {InternalServerErrorException} - If an error occurs during the retrieval.
   */
  async findOneTournamentDetails(id: string, userId: string): Promise<ITournamentDetails> {
    try {
      const tournament = await this.tournamentsRepository.findOne({
        where: { id },
        relations: ['admin', 'teams', 'teams.players'],
      });

      if (!tournament) {
        throw new NotFoundException(`Tournament with id ${id} not found`);
      }

      const rankings = await this.rankingsService.findAllByTournamentId(id, userId);
      const isUserRegistered = userId ? await this.teamsService.isUserInTeam(userId, tournament.id) : false;
      const isMatches = await this.matchesService.isMatchesCreated(tournament.id);
      const teams = tournament.teams.map(team => {
        const ranking = rankings.find(ranking => ranking.team.id === team.id);
        return mapToITeamRanking(
          team,
          userId,
          ranking ? ranking : null
        );
      });

      teams.sort((a, b) => a.position - b.position);

      const registeredUsers = tournament.teams.flatMap(team => team.players);
      const users = await this.usersService.findAll();
      const notRegisteredUsers = users.filter(user => !registeredUsers.some(registeredUser => registeredUser.id === user.id));

      return {
        tournament: mapToITournament(tournament, isUserRegistered, isMatches, teams.length),
        users: notRegisteredUsers,
        teams,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error("Error retrieving tournament details:", error);
      throw new InternalServerErrorException(error.message);
    }
  }


  /**
   * Retrieves the tournament details along with match information by its ID.
   * 
   * Fetches tournament details and match rounds, including whether the user is registered in a team.
   * 
   * @param id - The ID of the tournament to retrieve.
   * @param userId - The ID of the user requesting the tournament details (used to check if the user is registered).
   * @returns {Promise<ITournamentMatches>} - The tournament details, including matches and user's team.
   * @throws {NotFoundException} - If no tournament is found with the given ID.
   * @throws {InternalServerErrorException} - If an error occurs during the retrieval.
   */
  async findOneTournamentMatches(id: string, userId: string): Promise<ITournamentMatches> {
    try {
      const tournament = await this.tournamentsRepository.findOne({
        where: { id },
        relations: ['admin', 'teams', 'teams.players'],
      });

      if (!tournament) {
        throw new NotFoundException(`Tournament with id ${id} not found`);
      }

      const rankings = await this.rankingsService.findAllByTournamentId(id, userId);
      const isUserRegistered = userId ? await this.teamsService.isUserInTeam(userId, tournament.id) : false;
      const isMatches = await this.matchesService.isMatchesCreated(tournament.id);
      const teams = tournament.teams.map(team => {
        const ranking = rankings.find(ranking => ranking.team.id === team.id);
        return mapToITeamRanking(
          team,
          userId, // Vérifier si l'utilisateur fait partie de l'équipe
          ranking ? ranking : null // Passer le classement trouvé
        );
      });

      const roundMatches: IRoundMatches[] = await this.matchesService.findAll(id, userId);


      let myTeam: ITeam | null = null;
      if (isUserRegistered) {
        const teamForUser = tournament.teams.find(team => team.players.some(player => player.id === userId));
        if (teamForUser) {
          myTeam = mapToITeam(teamForUser, userId);
        }
      }

      return {
        tournament: mapToITournament(tournament, isUserRegistered, isMatches, teams.length),
        myTeam: myTeam,  // L'équipe de l'utilisateur, si elle existe
        roundMatches: roundMatches  // Les matchs par round, mappés avec mapToIMatch
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error("Error retrieving tournament details:", error);
      throw new InternalServerErrorException(error.message);
    }
  }


  /**
    * Retrieves all tournaments.
    * 
    * Fetches all tournaments with their respective admins and teams, and calculates the number of participants.
    * 
    * @param userId - The ID of the user requesting the tournaments (used to check if they are registered).
    * @returns {Promise<ITournament[]>} - A list of tournaments with their details and participant count.
    * @throws {InternalServerErrorException} - If an error occurs while retrieving the tournaments.
    */
  async findAll(userId: string): Promise<ITournament[]> {
    try {
      // Récupérer tous les tournois avec les relations nécessaires
      const tournaments = await this.tournamentsRepository.find({
        relations: ['admin', 'teams', 'teams.players'], // teams est une liste d'User
      });

      return await Promise.all(
        tournaments.map(async (tournament, index) => {
          const participantsNumber = calculateParticipantsCount(tournament);
          const isUserRegistered = userId ? await this.teamsService.isUserInTeam(userId, tournament.id) : false;
          const isMatches = await this.matchesService.isMatchesCreated(tournament.id);

          return {
            ...mapToITournament(tournament, isUserRegistered, isMatches, participantsNumber)
          };
        })
      );
    } catch (error) {
      console.error("[Service findAll] Error: ", error);
      throw new InternalServerErrorException('An error occurred while fetching tournaments', error.message);
    }
  }

  /**
   * Retrieves a single tournament by its ID.
   * 
   * Fetches the tournament details along with its admin and teams, and calculates the number of participants.
   * 
   * @param id - The ID of the tournament to retrieve.
   * @param userId - The ID of the user requesting the tournament details (used to check if they are registered).
   * @returns {Promise<ITournament>} - The tournament details including admin and participant count.
   * @throws {NotFoundException} - If no tournament is found with the given ID.
   * @throws {InternalServerErrorException} - If an error occurs during the retrieval.
   */
  async findOne(id: string, userId: string): Promise<ITournament> {
    try {
      const tournament = await this.tournamentsRepository.findOne({
        where: { id },
        relations: ['admin', 'teams', 'teams.players'], // Charger les équipes et les joueurs
      });

      if (!tournament) {
        throw new NotFoundException(`Tournament with id ${id} not found`);
      }

      const participantsNumber = calculateParticipantsCount(tournament);
      const isUserRegistered = userId ? await this.teamsService.isUserInTeam(userId, tournament.id) : false;
      const isMatches = await this.matchesService.isMatchesCreated(tournament.id);

      // Mapper le tournoi et retourner la réponse
      return mapToITournament(tournament, isUserRegistered, isMatches, participantsNumber);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Gérer les autres erreurs avec un message générique
      throw new InternalServerErrorException('An error occurred while retrieving the tournament.', error.message);
    }
  }

  /**
    * Updates an existing tournament's details.
    * 
    * Modifies the tournament based on the provided ID and updated data.
    * 
    * @param id - The ID of the tournament to update.
    * @param tournament - The updated tournament data.
    * @returns {Promise<void>} - Resolves if the update is successful.
    * @throws {NotFoundException} - If no tournament is found with the given ID.
    * @throws {InternalServerErrorException} - If an error occurs during the update.
    */
  async update(id: string, tournament: IUpdateTournament): Promise<void> {
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
    * Deletes a tournament by its ID.
    * 
    * Removes the tournament from the database based on the provided ID.
    * 
    * @param id - The ID of the tournament to delete.
    * @returns {Promise<void>} - Resolves if the deletion is successful.
    * @throws {NotFoundException} - If no tournament is found with the given ID.
    * @throws {InternalServerErrorException} - If an error occurs during the deletion.
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
