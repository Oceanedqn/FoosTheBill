import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { User } from '../users/user.entity';
import { ICreateTeam, ITeam } from './dto/team.dto';
import { mapToITeam } from 'src/utils/map-dto.utils';
import { Tournament } from 'src/tournaments/tournament.entity';
import { UsersService } from 'src/users/users.service';
import { TournamentsService } from 'src/tournaments/tournaments.service';

@Injectable()
export class TeamsService {
    constructor(
        @InjectRepository(Team) private teamsRepository: Repository<Team>,
        @InjectRepository(User) private usersRepository: Repository<User>,
        private readonly usersService: UsersService,
        private readonly tournamentsService: TournamentsService
    ) { }

    /**
     * Creates a new team with one or two participants and associates it with a tournament.
     * Checks if the participants are already in a team for the specified tournament before creation.
     * 
     * @param createTeamDto - Data Transfer Object containing the team name, participant 1 ID, participant 2 ID (optional), and tournament ID.
     * @param userId - The ID of the user who is requesting the creation of the team, typically for authorization purposes.
     * @returns A promise that resolves to a `TeamWithTournamentReponseDto` containing the created team and tournament information.
     * @throws NotFoundException - If the tournament or any participant is not found.
     * @throws ConflictException - If any participant is already part of a team in the tournament.
     * @throws InternalServerErrorException - If an error occurs during the team creation process.
     */
    async createTeamByTournamentId(createTeamDto: ICreateTeam, userId: string, isOneTeam: boolean): Promise<ITeam> {
        const user = await this.usersService.findOne(userId);
        if (!createTeamDto.players) {
            createTeamDto.players = [];
        }

        if (isOneTeam) {
            createTeamDto.players.unshift(user);
        }

        try {
            for (const player of createTeamDto.players) {
                const existingTeamForPlayer = await this.isUserInTeam(player.id, createTeamDto.tournamentId);
                if (existingTeamForPlayer) {
                    throw new Error(`Player ${player.name} is already in a team in this tournament.`);
                }
            }

            const players = await Promise.all(createTeamDto.players.map(player => this.usersService.findOne(player.id)));
            const tournament = await this.tournamentsService.findOne(createTeamDto.tournamentId, userId);

            const team = this.teamsRepository.create({
                name: createTeamDto.name,
                tournament: tournament,
                players: players, // Les joueurs sont directement ajoutés à l'équipe
            });
            await this.teamsRepository.save(team);

            return mapToITeam(team, userId);
        } catch (error) {
            console.error("Error creating team:", error); // Log error for debugging
            throw new InternalServerErrorException(error.message);
        }
    }


    /**
     * Creates a new team with one or two participants and associates it with a tournament.
     * Checks if the participants are already in a team for the specified tournament before creation.
     * 
     * @param createTeamDtos - An array of Data Transfer Objects containing the team name, participant 1 ID, participant 2 ID (optional), and tournament ID.
     * @param userId - The ID of the user who is requesting the creation of the team, typically for authorization purposes.
     * @returns A promise that resolves to a `TeamWithTournamentReponseDto` containing the created team and tournament information.
     * @throws NotFoundException - If the tournament or any participant is not found.
     * @throws ConflictException - If any participant is already part of a team in the tournament.
     * @throws InternalServerErrorException - If an error occurs during the team creation process.
     */
    async createTeamsByTournamentId(createTeams: ICreateTeam[], userId: string): Promise<ITeam[]> {
        try {
            const createdTeams: ITeam[] = [];

            // Iterate over the provided teams
            for (const createTeamDto of createTeams) {
                // Create each team using the existing createTeamByTournamentId method
                const createdTeam = await this.createTeamByTournamentId(createTeamDto, userId, false);

                // Push the created team to the result array
                createdTeams.push(createdTeam);
            }

            return createdTeams;  // Return the array of created teams
        } catch (error) {
            console.error("Error creating teams:", error); // Log error for debugging
            throw new InternalServerErrorException(error.message);
        }
    }

    /**
     * Retrieves a specific team by its ID along with related data such as participants and tournament.
     * 
     * @param id - The ID of the team to retrieve.
     * @param currentUserId - The ID of the current user to customize the response.
     * @returns A promise that resolves to a `TeamResponseDto` containing the team data along with related participants and tournament.
     * @throws NotFoundException - If the team with the specified ID is not found.
     * @throws InternalServerErrorException - If an error occurs while fetching the team.
     */
    async findOne(id: string, currentUserId: string): Promise<ITeam> {
        try {
            const team = await this.teamsRepository.findOne({
                where: { id },
                relations: ['tournament', 'players'],
            });
            if (!team) {
                throw new NotFoundException(`Team with id ${id} not found`);
            }
            return mapToITeam(team, currentUserId);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }




    /**
      * Updates an existing team by adding a second participant.
      * Checks for conflicts, such as the user already being in the team or the team already having two participants.
      * 
      * @param teamId - The ID of the team to update.
      * @param userId - The ID of the user to be added as the second participant.
      * @returns A promise that resolves once the team is successfully updated.
      * @throws NotFoundException - If the team or user is not found.
      * @throws ConflictException - If the user is already in the team or if the team already has two participants.
      * @throws InternalServerErrorException - If an error occurs during the update process.
      */
    async update(teamId: string, userId: string): Promise<ITeam> {
        const team = await this.teamsRepository.findOne({
            where: { id: teamId },
            relations: ['players'],
        });
        if (!team) {
            throw new NotFoundException(`Team not found`);
        }
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User not found`);
        }
        if (team.players.some(player => player.id === userId)) {
            throw new ConflictException(`User is already in the team`);
        }
        if (team.players.length >= 2) {
            throw new ConflictException(`Team already has two participants`);
        }
        team.players.push(user);

        await this.teamsRepository.save(team);
        return mapToITeam(team, userId);
    }


    /**
     * Removes a player from a team based on the team ID and player ID.
     * 
     * @param teamId - The ID of the team from which the player will be removed.
     * @param playerId - The ID of the player to remove from the team.
     * @returns A promise that resolves once the player is successfully removed from the team.
     * @throws NotFoundException - If the team or player is not found.
     * @throws ConflictException - If the player is not part of the team.
     * @throws InternalServerErrorException - If an error occurs during the update process.
     */
    async quitTeam(teamId: string, playerId: string): Promise<void> {
        try {
            // Récupérer l'équipe avec les joueurs associés
            const team = await this.teamsRepository.findOne({
                where: { id: teamId },
                relations: ['players'], // Charger les joueurs de l'équipe
            });

            // Vérifier si l'équipe existe
            if (!team) {
                throw new NotFoundException(`Team with id ${teamId} not found`);
            }

            // Vérifier si le joueur fait partie de l'équipe
            const playerIndex = team.players.findIndex(player => player.id === playerId);
            if (playerIndex === -1) {
                throw new ConflictException(`Player with id ${playerId} is not part of this team`);
            }

            // Retirer le joueur de l'équipe
            team.players.splice(playerIndex, 1); // Retirer le joueur du tableau des joueurs

            if(team.players.length == 0){
                await this.remove(teamId)
            }

            // Sauvegarder les modifications dans la base de données
            await this.teamsRepository.save(team);
        } catch (error) {
            throw new InternalServerErrorException('Error removing player from team', error.message);
        }
    }


    /**
     * Deletes a team by its ID.
     * 
     * @param id - The ID of the team to delete.
     * @param userId - The ID of the user requesting the deletion (used for authorization checks if needed).
     * @returns A promise that resolves once the team is successfully deleted.
     * @throws NotFoundException - If the team with the given ID is not found.
     * @throws InternalServerErrorException - If an error occurs during the team deletion process.
     */
    async remove(id: string): Promise<void> {
        try {
            const team = await this.teamsRepository.findOne({
                where: { id },
                relations: ['players', 'tournament'],
            });
    
            if (!team) {
                throw new NotFoundException(`Team with id ${id} not found`);
            }
    
            // Suppression des relations dans la table de liaison
            if (team.players.length > 0) {
                await this.teamsRepository
                    .createQueryBuilder()
                    .relation(Team, "players")
                    .of(team)
                    .remove(team.players);
            }
    
            // Suppression de l'équipe
            await this.teamsRepository.delete(id);
        } catch (error) {
            throw new InternalServerErrorException('Error deleting team', error.message);
        }
    }

    /**
     * Checks if a user is already in a team for a specific tournament.
     *
     * @param userId - The ID of the user to check.
     * @param tournamentId - The ID of the tournament in which the user is potentially already part of a team.
     * @returns A promise that resolves to a boolean: `true` if the user is already part of a team in the tournament, otherwise `false`.
     * @throws InternalServerErrorException - If an error occurs while checking the team's existence.
     */
    async isUserInTeam(userId: string, tournamentId: string): Promise<boolean> {
        try {
            const existingTeam = await this.teamsRepository
                .createQueryBuilder('team')
                .innerJoin('team.players', 'player')
                .where('team.tournament_id = :tournamentId', { tournamentId })  // Utilisez 'tournament_id' et non 'tournamentId'
                .andWhere('player.id = :userId', { userId })
                .getOne();

            return existingTeam !== null;
        } catch (error) {
            console.error("Error checking if user is in a team:", error);
            throw new InternalServerErrorException(error.message);
        }
    }
}

