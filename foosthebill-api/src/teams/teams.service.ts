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
     * Create a new team with one or two participants and associate it with a tournament.
     * @param createTeamDto - The team data to be created, including participants and tournament.
     * @returns The created team with participants and tournament.
     * @throws NotFoundException if the tournament or any participant is not found.
     * @throws InternalServerErrorException if an error occurs during the team creation process.
     */
    async createTeamByTournamentId(createTeamDto: CreateTeamDto): Promise<TeamsWithTournamentReponseDto> {
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
     * Retrieve a specific team by its ID and related data such as participants and tournament.
     * @param id - The ID of the team.
     * @returns The team with the specified ID and its related participants and tournament.
     * @throws NotFoundException if the team is not found.
     * @throws InternalServerErrorException if an error occurs during retrieval.
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
            if (error instanceof NotFoundException) {
                throw error;  // Rethrow NotFoundException
            }
            throw new InternalServerErrorException('Error fetching team', error.message);
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

    /**
     * Delete a specific team by its ID.
     * @param id - The ID of the team to be deleted.
     * @returns void
     * @throws NotFoundException if the team is not found.
     * @throws InternalServerErrorException if there is an error during the deletion process.
     */
    async remove(id: string): Promise<void> {
        try {
            const team = await this.findOne(id);  // Check if team exists
            if (!team) {
                throw new NotFoundException(`Team with id ${id} not found`);
            }
            await this.teamsRepository.delete(id);
        } catch (error) {
            throw new InternalServerErrorException('Error deleting team', error.message);
        }
    }
}
