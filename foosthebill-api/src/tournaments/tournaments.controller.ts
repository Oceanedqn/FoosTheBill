import { Controller, Get, Post, Param, Body, Put, Delete, HttpStatus, UseFilters, UseGuards, ForbiddenException } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { CreateTournamentDto, UpdateTournamentDto } from './dto/tournament.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { TeamResponseDto } from 'src/teams/dto/team.dto';

@Controller('tournaments')
@UseFilters(new AllExceptionsFilter())
export class TournamentsController {
    constructor(private readonly tournamentsService: TournamentsService) { }

    /**
     * Creates a new tournament.
     * This function allows authenticated and authorized users (with the appropriate roles) 
     * to create a new tournament.
     * @param createTournamentDto - Data transfer object containing the details of the tournament (name, description, start date).
     * @param req - The request object containing user details (used to extract the user ID).
     * @returns Promise<{ statusCode: number, message: string, data: TournamentResponseDto }> - Returns a status code, a success message, and the created tournament details.
     * @throws ForbiddenException - If the user does not have the necessary permissions.
     * @throws BadRequestException - If any validation fails.
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
     * This function allows authenticated users to retrieve the list of all tournaments.
     * @param req - The request object containing user details (used to extract the user ID).
     * @returns Promise<{ statusCode: number, message: string, data: TournamentResponseDto[] }> - Returns a status code, a success message, and an array of all tournaments.
     * @throws UnauthorizedException - If the user is not authenticated.
     * @throws InternalServerErrorException - If there is an error retrieving tournaments.
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
     * This function allows authenticated users to retrieve a single tournament by its ID.
     * @param id - The ID of the tournament to retrieve.
     * @param req - The request object containing user details (used to extract the user ID).
     * @returns Promise<{ statusCode: number, message: string, data: TournamentResponseDto }> - Returns a status code, a success message, and the details of the requested tournament.
     * @throws NotFoundException - If the tournament with the specified ID is not found.
     * @throws UnauthorizedException - If the user is not authenticated.
     */
    @UseGuards(AuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        const tournament = await this.tournamentsService.findOne(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Tournament retrieved successfully',
            data: tournament,
        }
    }

    /**
     * Updates an existing tournament.
     * This function allows authenticated and authorized users to update an existing tournament.
     * @param id - The ID of the tournament to update.
     * @param tournament - Data transfer object containing updated tournament details (name, description, start date).
     * @param req - The request object containing user details (used to extract the user ID).
     * @returns Promise<{ statusCode: number, message: string }> - Returns a status code and a success message.
     * @throws ForbiddenException - If the user does not have the necessary permissions to update the tournament.
     * @throws NotFoundException - If the tournament with the given ID is not found.
     * @throws BadRequestException - If the provided tournament data is invalid.
     */
    @UseGuards(AuthGuard, RolesGuard)
    @Put(':id')
    async update(@Param('id') id: string, @Body() tournament: UpdateTournamentDto, @Request() req) {
        await this.tournamentsService.update(id, tournament);
        return {
            statusCode: HttpStatus.OK,
            message: 'Tournament updated successfully',
        };
    }

    /**
     * Deletes a tournament by its ID.
     * This function allows authenticated and authorized users to delete a specific tournament.
     * @param id - The ID of the tournament to delete.
     * @param req - The request object containing user details (used to extract the user ID).
     * @returns Promise<{ statusCode: number, message: string }> - Returns a status code and a success message.
     * @throws ForbiddenException - If the user does not have the necessary permissions to delete the tournament.
     * @throws NotFoundException - If the tournament with the given ID is not found.
     */
    @UseGuards(AuthGuard, RolesGuard)
    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
        await this.tournamentsService.remove(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Tournament deleted successfully',
        }
    }

    /**
     * Retrieves all teams related to a specific tournament.
     * This function allows authenticated users to retrieve the list of teams associated with a tournament.
     * @param id - The ID of the tournament for which teams are being retrieved.
     * @returns Promise<{ statusCode: number, message: string, data: TeamResponseDto[] }> - Returns a status code, a success message, and an array of teams.
     * @throws NotFoundException - If the tournament with the given ID is not found.
     */
    @UseGuards(AuthGuard)
    @Get(':id/teams')
    async findAllTeams(@Param('id') id: string) {
        const teams: TeamResponseDto[] = await this.tournamentsService.findAllTeams(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Teams retrieved successfully',
            data: teams,
        };
    }
}
