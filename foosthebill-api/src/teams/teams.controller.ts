import { Controller, Get, Post, Param, Body, Put, Delete, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { Team } from './team.entity';

@Controller('teams')
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    @Post()
    async create(@Body() team: Team) {
        try {
            const newTeam = await this.teamsService.create(team);
            return { code: HttpStatus.CREATED, message: 'Team created successfully', data: newTeam };
        } catch (error) {
            throw new HttpException({ code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error creating team', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async findAll() {
        try {
            const teams = await this.teamsService.findAll();
            return { code: HttpStatus.OK, message: 'Teams fetched successfully', data: teams };
        } catch (error) {
            throw new HttpException({ code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error fetching teams', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        try {
            const team = await this.teamsService.findOne(id);
            return { code: HttpStatus.OK, message: 'Team fetched successfully', data: team };
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() team: Team) {
        try {
            await this.teamsService.update(id, team);
            return { code: HttpStatus.OK, message: 'Team updated successfully' };
        } catch (error) {
            throw new HttpException({ code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error updating team', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        try {
            await this.teamsService.remove(id);
            return { code: HttpStatus.OK, message: 'Team deleted successfully' };
        } catch (error) {
            throw new HttpException({ code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error deleting team', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
