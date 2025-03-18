import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
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
     * Creates a new team with one or two participants and associates it with a tournament.
     * @param createTeamDto - The team data to be created, including participants and tournament.
     * @returns The created team with participants and tournament.
     * @throws NotFoundException if the tournament or any participant is not found.
     * @throws InternalServerErrorException if an error occurs during the team creation process.
     */
    async createTeamByTournamentId(createTeamDto: CreateTeamDto): Promise<TeamsWithTournamentReponseDto> {
        try {
            // Check if participant 1 is already in a team as either participant1 or participant2 in the tournament
            const existingTeamForPlayer1 = await this.teamsRepository.findOne({
                where: [
                    { tournament: { id: createTeamDto.tournament_id }, participant1: { id: createTeamDto.participant1 } },
                    { tournament: { id: createTeamDto.tournament_id }, participant2: { id: createTeamDto.participant1 } },
                ],
            });

            // If participant 1 is already in another team, throw an error
            if (existingTeamForPlayer1) {
                throw new Error(`Participant 1 is already in a team in this tournament.`);
            }

            // Check if participant 2 is already in a team as either participant1 or participant2 in the tournament
            let existingTeamForPlayer2: Team | null = null;  // Explicit type to allow Team | null
            if (createTeamDto.participant2) {
                existingTeamForPlayer2 = await this.teamsRepository.findOne({
                    where: [
                        { tournament: { id: createTeamDto.tournament_id }, participant1: { id: createTeamDto.participant2 } },
                        { tournament: { id: createTeamDto.tournament_id }, participant2: { id: createTeamDto.participant2 } },
                    ],
                });

                // If participant 2 is already in another team, throw an error
                if (existingTeamForPlayer2) {
                    throw new Error(`Participant 2 is already in a team in this tournament.`);
                }
            }

            // Retrieve participants and tournament
            const player1 = await this.usersService.findOne(createTeamDto.participant1);
            const tournament = await this.tournamentService.findOne(createTeamDto.tournament_id);

            // Check if participant 2 exists (if provided)
            let player2: User | null = null;
            if (createTeamDto.participant2) {
                player2 = await this.usersRepository.findOne({
                    where: { id: createTeamDto.participant2 },
                });
            }

            // Create the team
            const team = this.teamsRepository.create({
                name: createTeamDto.name,
                tournament: tournament,  // Ensure tournament entity is assigned
                participant1: player1,
                participant2: player2,
            });

            // Save the team
            await this.teamsRepository.save(team);

            // Return structured response with relevant data
            return {
                id: team.id,
                name: team.name,
                tournament: tournament,
                participant1: player1,
                participant2: player2,
            };
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
    async findAllTeamByTournamentId(tournamentId: string): Promise<TournamentTeamsResponseDto> {
        try {
            const tournament = await this.tournamentService.findOne(tournamentId);

            if (!tournament) {
                throw new NotFoundException(`Tournament with id ${tournamentId} not found`);
            }

            const teams = await this.teamsRepository.find({ where: { tournament: { id: tournamentId } }, relations: ['participant1', 'participant2'] });

            // Map teams to DTOs
            return {
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
    async findOne(id: string): Promise<TeamResponseDto> {
        try {
            const team = await this.teamsRepository.findOne({ where: { id }, relations: ['tournament', 'participant1', 'participant2'] });
            if (!team) {
                throw new NotFoundException(`Team with id ${id} not found`);
            }
            return {
                id: team.id,
                name: team.name,
                participant1: {
                    id: team.participant1.id,
                    name: team.participant1.name,
                    firstname: team.participant1.firstname,
                    email: team.participant1.email,
                    role: team.participant1.role,
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
            };
        } catch (error) {
            throw new InternalServerErrorException(error.message);
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
