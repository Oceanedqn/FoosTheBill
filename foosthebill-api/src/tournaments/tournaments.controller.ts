import { Controller, Get, Post, Param, Body, Put, Delete, HttpStatus, UseFilters, UseGuards } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { CreateTournamentDto, TournamentTeamsResponseDto, UpdateTournamentDto } from './dto/tournament.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { TeamsService } from '../teams/teams.service';
import { CreateTeamDto, TeamResponseDto } from 'src/teams/dto/team.dto';

@Controller('tournaments')
@UseFilters(new AllExceptionsFilter())
export class TournamentsController {
    constructor(private readonly tournamentsService: TournamentsService, private readonly teamService: TeamsService) { }

    /**
     * Creates a new tournament.
     * Only authenticated and authorized users (with the required roles) can create a tournament.
     * @param createTournamentDto - DTO containing tournament details (name, description, start date).
     * @param req - Request object containing user details (used to extract user ID).
     * @returns A response containing status, success message, and created tournament details.
     * @throws ForbiddenException - If the user lacks the necessary permissions.
     * @throws BadRequestException - If validation fails.
     */
    @UseGuards(AuthGuard, RolesGuard)
    @Post()
    async create(@Body() createTournamentDto: CreateTournamentDto, @Request() req) {
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
     * @returns A list of all tournaments.
     * @throws UnauthorizedException - If the user is not authenticated.
     * @throws InternalServerErrorException - If an error occurs during retrieval.
     */
    @UseGuards(AuthGuard)
    @Get()
    async findAll() {
        const tournaments = await this.tournamentsService.findAll();
        return {
            statusCode: HttpStatus.OK,
            message: 'Tournaments retrieved successfully',
            data: tournaments,
        }
    }

    /**
     * Retrieves a specific tournament by its ID.
     * @param id - Tournament ID.
     * @returns The requested tournament.
     * @throws NotFoundException - If the tournament is not found.
     */
    @UseGuards(AuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string) {
        const tournament = await this.tournamentsService.findOne(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Tournament retrieved successfully',
            data: tournament,
        }
    }

    /**
     * Updates an existing tournament.
     * Only authenticated and authorized users can update a tournament.
     * @param id - Tournament ID.
     * @param tournament - DTO containing updated tournament details.
     * @returns A success message upon successful update.
     * @throws ForbiddenException - If the user lacks the necessary permissions.
     * @throws NotFoundException - If the tournament is not found.
     * @throws BadRequestException - If provided data is invalid.
     */
    @UseGuards(AuthGuard, RolesGuard)
    @Put(':id')
    async update(@Param('id') id: string, @Body() tournament: UpdateTournamentDto) {
        await this.tournamentsService.update(id, tournament);
        return {
            statusCode: HttpStatus.OK,
            message: 'Tournament updated successfully',
        };
    }

    /**
     * Deletes a tournament by its ID.
     * Only authenticated and authorized users can delete a tournament.
     * @param id - Tournament ID.
     * @returns A success message upon deletion.
     * @throws ForbiddenException - If the user lacks the necessary permissions.
     * @throws NotFoundException - If the tournament is not found.
     */
    @UseGuards(AuthGuard, RolesGuard)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.tournamentsService.remove(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Tournament deleted successfully',
        }
    }

    /**
     * Retrieves all teams associated with a specific tournament.
     * @param id - Tournament ID.
     * @returns A list of teams in the tournament.
     * @throws NotFoundException - If the tournament is not found.
     */
    @UseGuards(AuthGuard)
    @Get(':id/teams')
    async findAllTeams(@Param('id') id: string) {
        const tournament: TournamentTeamsResponseDto = await this.teamService.findAllTeamByTournamentId(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Teams retrieved successfully',
            data: tournament,
        };
    }

    /**
     * Creates a new team within a tournament.
     * @param id - Tournament ID.
     * @param createTournamentDto - DTO containing team details.
     * @param req - Request object containing user details (used to extract user ID).
     * @returns A success message and the created team details.
     */
    @UseGuards(AuthGuard)
    @Post(':id/teams')
    async createTeam(@Param('id') id: string, @Body() createTournamentDto: CreateTeamDto, @Request() req) {
        const userId = req.user.id;
        createTournamentDto.participant1 = userId;
        createTournamentDto.tournament_id = id;

        const createdTeam = await this.teamService.createTeamByTournamentId(createTournamentDto);

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Team created successfully',
            data: createdTeam,
        };
    }

    /**
     * Checks if a user is already part of a team in a specific tournament.
     * @param tournamentId - Tournament ID.
     * @param req - Request object containing user details (used to extract user ID).
     * @returns true if the user is in a team, otherwise false.
     */
    @Get(':id/teams/isInTeam')
    @UseGuards(AuthGuard)
    async checkIfUserInTeam(@Param('id') tournamentId: string, @Request() req): Promise<{ isInTeam: boolean }> {
        const userId = req.user.id;
        const isInTeam = await this.teamService.isUserInTeam(userId, tournamentId);
        return { isInTeam };
    }
}
