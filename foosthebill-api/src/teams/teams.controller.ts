import { Controller, Get, Post, Param, Body, Put, Delete, HttpException, HttpStatus, NotFoundException, UseFilters, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { Team } from './team.entity';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('teams')
@UseFilters(new AllExceptionsFilter())
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    /**
     * Create a new team.
     * @param team - The team data to be created.
     * @returns A response containing the created team data and a success message.
     */
    @UseGuards(AuthGuard)
    @Post()
    async create(@Body() team: Team) {
        const newTeam = await this.teamsService.create(team);
        return {
            code: HttpStatus.CREATED,
            message: 'Team created successfully',
            data: newTeam
        };
    }

    /**
     * Retrieve all teams for a specific tournament.
     * @param tournamentId - The ID of the tournament for which teams are to be retrieved.
     * @returns A response containing a list of teams and a success message.
     * @throws HttpException if there is an error while fetching the teams.
     */
    @UseGuards(AuthGuard)
    @Get(':id')
    async findAll(@Param('id') tournamentId: string) {
        try {
            const teams = await this.teamsService.findAll(tournamentId);
            return { code: HttpStatus.OK, message: 'Teams fetched successfully', data: teams };
        } catch (error) {
            throw new HttpException({
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error fetching teams',
                error: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieve a specific team by its IDs (commented out in the code).
     * @param id1 - The first part of the team identifier.
     * @param id2 - The second part of the team identifier.
     * @returns A response containing the team data and a success message.
     * @throws NotFoundException if the team is not found.
     */
    // @UseGuards(AuthGuard)
    // @Get(':id1/:id2')
    // async findOne(@Param('id1') id1: string, @Param('id2') id2: string) {
    //     try {
    //         const team = await this.teamsService.findOne(id1, id2);
    //         return { code: HttpStatus.OK, message: 'Team fetched successfully', data: team };
    //     } catch (error) {
    //         throw new NotFoundException(error.message);
    //     }
    // }

    /**
     * Update an existing team by its ID.
     * @param id - The ID of the team to be updated.
     * @param team - The updated team data.
     * @returns A response with a success message.
     * @throws HttpException if there is an error while updating the team.
     */
    // @UseGuards(AuthGuard)
    // @Put(':id')
    // async update(@Param('id') id: string, @Body() team: Team) {
    //     try {
    //         await this.teamsService.update(id, team);
    //         return { code: HttpStatus.OK, message: 'Team updated successfully' };
    //     } catch (error) {
    //         throw new HttpException({
    //             code: HttpStatus.INTERNAL_SERVER_ERROR,
    //             message: 'Error updating team',
    //             error: error.message,
    //         }, HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    /**
     * Delete a specific team by its ID.
     * @param id - The ID of the team to be deleted.
     * @returns A response with a success message.
     * @throws HttpException if there is an error while deleting the team.
     */
    // @UseGuards(AuthGuard)
    // @Delete(':id')
    // async remove(@Param('id') id: string) {
    //     try {
    //         await this.teamsService.remove(id);
    //         return { code: HttpStatus.OK, message: 'Team deleted successfully' };
    //     } catch (error) {
    //         throw new HttpException({
    //             code: HttpStatus.INTERNAL_SERVER_ERROR,
    //             message: 'Error deleting team',
    //             error: error.message,
    //         }, HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }
}
