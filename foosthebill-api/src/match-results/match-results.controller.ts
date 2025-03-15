import { Controller, Get, Post, Param, Body, Put, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { MatchResultsService } from './match-results.service';
import { MatchResult } from './match-result.entity';

@Controller('match-results')
export class MatchResultsController {
    constructor(private readonly matchResultsService: MatchResultsService) { }

    @Post()
    async create(@Body() matchResult: MatchResult) {
        try {
            const newMatchResult = await this.matchResultsService.create(matchResult);
            return { code: HttpStatus.CREATED, message: 'Match result created successfully', data: newMatchResult };
        } catch (error) {
            throw new HttpException({ code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error creating match result', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async findAll() {
        try {
            const matchResults = await this.matchResultsService.findAll();
            return { code: HttpStatus.OK, message: 'Match results fetched successfully', data: matchResults };
        } catch (error) {
            throw new HttpException({ code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error fetching match results', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        try {
            const matchResult = await this.matchResultsService.findOne(id);
            return { code: HttpStatus.OK, message: 'Match result fetched successfully', data: matchResult };
        } catch (error) {
            throw new HttpException({ code: HttpStatus.NOT_FOUND, message: error.message }, HttpStatus.NOT_FOUND);
        }
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() matchResult: MatchResult) {
        try {
            await this.matchResultsService.update(id, matchResult);
            return { code: HttpStatus.OK, message: 'Match result updated successfully' };
        } catch (error) {
            throw new HttpException({ code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error updating match result', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        try {
            await this.matchResultsService.remove(id);
            return { code: HttpStatus.OK, message: 'Match result deleted successfully' };
        } catch (error) {
            throw new HttpException({ code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error deleting match result', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}