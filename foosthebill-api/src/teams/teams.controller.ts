import { Controller, Get, Param, Put, Delete, HttpStatus, UseFilters, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { Request } from '@nestjs/common';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('teams')
@UseFilters(new AllExceptionsFilter())
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    /**
     * Retrieve a specific team by its ID.
     * This method fetches the team data based on the provided ID and returns it.
     * 
     * @param id - The ID of the team to be fetched.
     * @param req - The request object containing the authenticated user's ID.
     * @returns A response containing the team data and a success message.
     * @throws NotFoundException - If the team with the given ID is not found.
     */
    @UseGuards(AuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        const userId = req.user.id;
        const team = await this.teamsService.findOne(id, userId);
        return { code: HttpStatus.OK, message: 'Team fetched successfully', data: team };
    }

    /**
     * Update an existing team by its ID.
     * This method updates the team by assigning a second participant (if applicable).
     * 
     * @param teamId - The ID of the team to be updated.
     * @param req - The request object containing the authenticated user's ID.
     * @returns A response with a success message after the team has been updated.
     * @throws HttpException - If there is an error while updating the team.
     * @throws NotFoundException - If the team or user is not found.
     * @throws ConflictException - If the user is already in the team or the team already has two participants.
     */
    @UseGuards(AuthGuard)
    @Put(':id')
    async update(@Param('id') teamId: string, @Request() req) {
        const userId = req.user.id;
        const team = await this.teamsService.update(teamId, userId);
        return { code: HttpStatus.OK, message: 'Team updated successfully', data: team };
    }


    /**
     * Remove the user from the team.
     * This method allows a user to quit the team by removing them from the players list.
     * 
     * @param teamId - The ID of the team from which the user will quit.
     * @param req - The request object containing the authenticated user's ID.
     * @returns A response with a success message after the user has been removed from the team.
     * @throws HttpException - If there is an error while updating the team.
     * @throws NotFoundException - If the team is not found.
     * @throws ConflictException - If the user is not part of the team.
     */
    @UseGuards(AuthGuard)
    @Put(':id/quit')
    async quitTeam(@Param('id') teamId: string, @Request() req) {
        const userId = req.user.id;
        const team = await this.teamsService.quitTeam(teamId, userId);
        return { code: HttpStatus.OK, message: 'Team updated successfully', data: team };
    }


    /**
     * Delete a specific team by its ID.
     * This method deletes the team identified by the given ID.
     * 
     * @param id - The ID of the team to be deleted.
     * @param req - The request object containing the authenticated user's ID.
     * @returns A response with a success message once the team has been deleted.
     * @throws HttpException - If there is an error while deleting the team.
     * @throws NotFoundException - If the team with the given ID is not found.
     */
    @UseGuards(AuthGuard, RolesGuard)
    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
        const userId = req.user.id;
        await this.teamsService.remove(id, userId);
        return { code: HttpStatus.OK, message: 'Team deleted successfully' };
    }
}
