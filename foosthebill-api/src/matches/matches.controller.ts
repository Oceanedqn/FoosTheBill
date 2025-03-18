import { Controller, Get, Post, Param, Body, Put, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { Match } from './match.entity';

@Controller('matches')
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) { }

    @Post()
    async create(@Body() match: Match) {
        try {
            const newMatch = await this.matchesService.create(match);
            return { code: HttpStatus.CREATED, message: 'Match created successfully', data: newMatch };
        } catch (error) {
            throw new HttpException({ code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error creating match', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async findAll() {
        try {
            const matches = await this.matchesService.findAll();
            return { code: HttpStatus.OK, message: 'Matches fetched successfully', data: matches };
        } catch (error) {
            throw new HttpException({ code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error fetching matches', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const match = await this.matchesService.findOne(id);
            return { code: HttpStatus.OK, message: 'Match fetched successfully', data: match };
        } catch (error) {
            throw new HttpException({ code: HttpStatus.NOT_FOUND, message: error.message }, HttpStatus.NOT_FOUND);
        }
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() match: Match) {
        try {
            await this.matchesService.update(id, match);
            return { code: HttpStatus.OK, message: 'Match updated successfully' };
        } catch (error) {
            throw new HttpException({ code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error updating match', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        try {
            await this.matchesService.remove(id);
            return { code: HttpStatus.OK, message: 'Match deleted successfully' };
        } catch (error) {
            throw new HttpException({ code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error deleting match', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
