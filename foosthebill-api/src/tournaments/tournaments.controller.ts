import { Controller, Get, Post, Param, Body, Put, Delete, HttpStatus, UseFilters, UseGuards } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { ICreateTournament, IUpdateTournament } from './dto/tournament.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { TeamsService } from '../teams/teams.service';
import { MatchesService } from 'src/matches/matches.service';
import { RankingsService } from 'src/rankings/rankings.service';
import { ICreateTeam, ITeam } from 'src/teams/dto/team.dto';
import { ICreateMatches } from 'src/matches/dto/match.dto';

@Controller('tournaments')
@UseFilters(new AllExceptionsFilter())
export class TournamentsController {
    constructor(
        private readonly tournamentsService: TournamentsService,
        private readonly teamsService: TeamsService,
        private readonly matchesService: MatchesService,
        private readonly rankingsService: RankingsService
    ) { }

    /**
     * Creates a new tournament.
     * Only authenticated and authorized users (with the required roles) can create a tournament.
     * 
     * @param createTournamentDto - DTO containing tournament details (name, description, start date).
     * @param req - Request object containing user details (used to extract user ID).
     * @returns A response containing status, success message, and created tournament details.
     * @throws ForbiddenException - If the user lacks the necessary permissions.
     * @throws BadRequestException - If validation fails.
     */
    @UseGuards(AuthGuard, RolesGuard)
    @Post()
    async create(@Body() createTournamentDto: ICreateTournament, @Request() req) {
        const userId = req.user.id;
        createTournamentDto.admin_id = userId;

        const createdTournament = await this.tournamentsService.create(createTournamentDto);

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Tournament created successfully',
            data: createdTournament,
        };
    }

    /**
     * Retrieves all tournaments.
     * 
     * @returns A list of all tournaments.
     * @throws UnauthorizedException - If the user is not authenticated.
     * @throws InternalServerErrorException - If an error occurs during retrieval.
     */
    @UseGuards(AuthGuard)
    @Get()
    async findAll(@Request() req) {
        const userId = req.user.id;
        const tournaments = await this.tournamentsService.findAll(userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Tournaments retrieved successfully',
            data: tournaments,
        }
    }

    /**
      * Retrieves a specific tournament by its ID.
      * 
      * @param id - Tournament ID.
      * @returns The requested tournament.
      * @throws NotFoundException - If the tournament is not found.
      */
    @UseGuards(AuthGuard)
    @Get(':id/details')
    async findTournamentDetails(@Param('id') id: string, @Request() req) {
        const userId = req.user.id;
        const tournament = await this.tournamentsService.findOneTournamentDetails(id, userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Tournament with teams and users retrieved successfully',
            data: tournament,
        }
    }

    /**
      * Retrieves a specific tournament by its ID.
      * 
      * @param id - Tournament ID.
      * @returns The requested tournament.
      * @throws NotFoundException - If the tournament is not found.
      */
    @UseGuards(AuthGuard)
    @Get(':id/matches')
    async findTournamentMatches(@Param('id') id: string, @Request() req) {
        const userId = req.user.id;
        const tournament = await this.tournamentsService.findOneTournamentMatches(id, userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Tournament with my team and matches retrieved successfully',
            data: tournament,
        }
    }



    /**
     * Creates a new team within a tournament.
     * 
     * @param id - Tournament ID.
     * @param createTournamentDto - DTO containing team details.
     * @param req - Request object containing user details (used to extract user ID).
     * @returns A success message and the created team details.
     */
    @UseGuards(AuthGuard)
    @Post(':id/team')
    async createTeam(@Param('id') id: string, @Body() createTeam: ICreateTeam, @Request() req) {
        const userId = req.user.id;
        createTeam.tournamentId = id;
        const createdTeam = await this.teamsService.createTeamByTournamentId(createTeam, userId, true);

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Team created successfully',
            data: createdTeam,
        };
    }

    /**
     * Creates a new teams within a tournament.
     * 
     * @param id - Tournament ID.
     * @param createTournamentDto - DTO containing team details.
     * @param req - Request object containing user details (used to extract user ID).
     * @returns A success message and the created team details.
     */
    @UseGuards(AuthGuard, RolesGuard)
    @Post(':id/teams')
    async createTeams(@Param('id') id: string, @Body() createTeams: ICreateTeam[], @Request() req) {
        const userId = req.user.id;
        createTeams.forEach(team => {
            team.tournamentId = id;
        });

        const createdTeam = await this.teamsService.createTeamsByTournamentId(createTeams, userId);

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Team created successfully',
            data: createdTeam,
        };
    }


    /**
    * Creates matches for a tournament based on the teams provided.
    * Only authenticated and authorized users (with the required roles) can create matches.
    * 
    * @param tournamentId - Tournament ID.
    * @param teams - The list of teams for which to create matches.
    * @param req - Request object containing user details (used to extract user ID).
    * @returns A success message and the created match details.
    * @throws ForbiddenException - If the user lacks the necessary permissions.
    */
    @Post(':id/matches')
    @UseGuards(AuthGuard, RolesGuard)
    async createAllMatches(@Param('id') tournamentId: string, @Body() teams: ITeam[], @Request() req) {
        const userId = req.user.id;
        const createMatchesDto: ICreateMatches = {
            tournamentId: tournamentId,
            teams: teams
        }
        const matches = await this.matchesService.createMatches(createMatchesDto, userId);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Matches created successfully',
            data: matches,
        };
    }
}
