import { Controller, Get, Post, Param, Body, Put, Delete, HttpStatus } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { Tournament } from './tournament.entity';

@Controller('tournaments')
export class TournamentsController {
    constructor(private readonly tournamentsService: TournamentsService) { }

    @Post()
    async create(@Body() tournament: Tournament) {
        try {
            const createdTournament = await this.tournamentsService.create(tournament);
            return {
                statusCode: HttpStatus.CREATED,
                message: 'Tournament created successfully',
                data: createdTournament,
            };
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error creating tournament',
                data: error.message,
            };
        }
    }

    @Get()
    async findAll() {
        try {
            const tournaments = await this.tournamentsService.findAll();
            return {
                statusCode: HttpStatus.OK,
                message: 'Tournaments retrieved successfully',
                data: tournaments,
            };
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error retrieving tournaments',
                data: error.message,
            };
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const tournament = await this.tournamentsService.findOne(id);
            return {
                statusCode: HttpStatus.OK,
                message: 'Tournament retrieved successfully',
                data: tournament,
            };
        } catch (error) {
            return {
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Tournament not found',
                data: error.message,
            };
        }
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() tournament: Tournament) {
        try {
            await this.tournamentsService.update(id, tournament);
            return {
                statusCode: HttpStatus.OK,
                message: 'Tournament updated successfully',
            };
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error updating tournament',
                data: error.message,
            };
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        try {
            await this.tournamentsService.remove(id);
            return {
                statusCode: HttpStatus.OK,
                message: 'Tournament deleted successfully',
            };
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error deleting tournament',
                data: error.message,
            };
        }
    }
}
