import { Injectable, NotFoundException, InternalServerErrorException, ConflictException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { User } from '../users/user.entity';
import { CreateTeamDto, TeamResponseDto, TeamsWithTournamentReponseDto } from './dto/team.dto';
import { mapToTeamResponseDto, mapToTeamsWithTournamentResponseDto } from 'src/utils/map-dto.utils';
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
        private readonly tournamentsService: TournamentsService
      ) {}

    /**
     * Creates a new team with one or two participants and associates it with a tournament.
     * @param createTeamDto - The team data to be created, including participants and tournament.
     * @returns The created team with participants and tournament.
     * @throws NotFoundException if the tournament or any participant is not found.
     * @throws InternalServerErrorException if an error occurs during the team creation process.
     */
    async createTeamByTournamentId(createTeamDto: CreateTeamDto): Promise<TeamsWithTournamentReponseDto> {
        try {
            const existingTeamForPlayer1 = await this.isUserInTeam(createTeamDto.participant1, createTeamDto.tournament_id);
            if (existingTeamForPlayer1) {
                throw new Error(`Participant 1 is already in a team in this tournament.`);
            }

            let player2: User | null = null;
        
            if (createTeamDto.participant2) {
                const existingTeamForPlayer2 = await this.isUserInTeam(createTeamDto.participant2, createTeamDto.tournament_id);
                if (existingTeamForPlayer2) {
                    throw new Error(`Participant 2 is already in a team in this tournament.`);
                }

                player2 = await this.usersRepository.findOne({ where: { id: createTeamDto.participant2 }});
            }

            const player1 = await this.usersService.findOne(createTeamDto.participant1);
            const tournament = await this.tournamentsService.findOne(createTeamDto.tournament_id);

            const team = this.teamsRepository.create({
                name: createTeamDto.name,
                tournament: tournament,
                participant1: player1,
                participant2: player2,
            });

            await this.teamsRepository.save(team);

            // Return structured response with relevant data
            return mapToTeamsWithTournamentResponseDto(team, createTeamDto.participant1);
        } catch (error) {
            console.error("Error creating team:", error); // Log error for debugging
            throw new InternalServerErrorException(error.message);
        }
    }

    /**
     * Retrieves all teams associated with a specific tournament and maps them to DTOs.
     * @param tournamentId - The ID of the tournament.
     * @returns A list of teams associated with the tournament.
     * @throws NotFoundException if the tournament is not found.
     * @throws InternalServerErrorException if an error occurs while retrieving teams.
     */
    async findAllTeamByTournamentId(tournamentId: string, currentUserId: string): Promise<TournamentTeamsResponseDto> {
        try {
            const tournament = await this.tournamentsService.findOne(tournamentId);

            if (!tournament) {
                throw new NotFoundException(`Tournament with id ${tournamentId} not found`);
            }

            const teams = await this.teamsRepository.find({ where: { tournament: { id: tournamentId } }, relations: ['participant1', 'participant2'] });

            // Map teams to DTOs
            return {
                tournament: tournament,
                teams: teams.map(team => (mapToTeamResponseDto(team, currentUserId))),
            };
        } catch (error) {
            console.error("[Service findAllTeams] Error: ", error);
            throw new InternalServerErrorException(error.message);
        }
    }

    /**
     * Retrieves a specific team by its ID along with related data such as participants and tournament.
     * @param id - The ID of the team.
     * @returns The team with the specified ID, including its participants and tournament.
     */
    async findOne(id: string, currentUserId: string): Promise<TeamResponseDto> {
        try {
            const team = await this.teamsRepository.findOne({ where: { id }, relations: ['tournament', 'participant1', 'participant2'] });
            if (!team) {
                throw new NotFoundException(`Team with id ${id} not found`);
            }
            return mapToTeamResponseDto(team, currentUserId);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
    

    /**
      * Update an existing team by its ID, assigning a second participant if possible.
      * @param teamId - The ID of the team to be updated.
      * @param userId - The ID of the user to be added as participant2.
      * @returns void
      * @throws NotFoundException if the team or user is not found.
      * @throws ConflictException if the user is already in the team or if the team already has two participants.
      * @throws InternalServerErrorException if there is an error during the update process.
      */
    async update(teamId: string, userId: string): Promise<void> {
        const team = await this.teamsRepository.findOne({
            where: { id: teamId },
            relations: ['participant1', 'participant2']
        });
        if (!team) {
            throw new NotFoundException(`Team not found`);
        }

        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User not found`);
        }

        if (userId === team.participant1.id) {
            throw new ConflictException(`User is already in the team`);
        }

        if (team.participant2) {
            throw new ConflictException(`Team already has a second participant`);
        }

        await this.teamsRepository.update(teamId, { participant2: user });
    }


    async remove(id: string, userId: string): Promise<void> {
        try {
            const team = await this.findOne(id, userId);
            if (!team) {
                throw new NotFoundException(`Team with id ${id} not found`);
            }
            await this.teamsRepository.delete(id);
        } catch (error) {
            throw new InternalServerErrorException('Error deleting team', error.message);
        }
    }

    /**
     * Checks if a user is already in a team for a specific tournament.
     * @param userId - The ID of the user to check.
     * @param tournamentId - The ID of the tournament.
     * @returns true if the user is already in a team, otherwise false.
     */
    async isUserInTeam(userId: string, tournamentId: string): Promise<boolean> {
        try {
            const existingTeam = await this.teamsRepository.findOne({
                where: [
                    { tournament: { id: tournamentId }, participant1: { id: userId } },
                    { tournament: { id: tournamentId }, participant2: { id: userId } },
                ],
            });

            return existingTeam !== null;
        } catch (error) {
            console.error("Error checking if user is in a team:", error);
            throw new InternalServerErrorException(error.message);
        }
    }
}

