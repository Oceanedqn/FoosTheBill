import { Controller, Get, Post, Param, Body, Put, Delete, HttpException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { Ranking } from './ranking.entity';

@Controller('rankings')
export class RankingsController {
    constructor(private readonly rankingsService: RankingsService) { }

    @Post()
    async create(@Body() ranking: Ranking) {
        try {
            const newRanking = await this.rankingsService.create(ranking);
            return { code: HttpStatus.CREATED, message: 'Ranking created successfully', data: newRanking };
        } catch (error) {
            throw error instanceof InternalServerErrorException
                ? new HttpException({ code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error creating ranking', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR)
                : error;
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const ranking = await this.rankingsService.findOne(id);
            return { code: HttpStatus.OK, message: 'Ranking fetched successfully', data: ranking };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new HttpException(
                { code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error fetching ranking', error: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        try {
            await this.rankingsService.remove(id);
            return { code: HttpStatus.OK, message: 'Ranking deleted successfully' };
        } catch (error) {
            if (error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new HttpException(
                { code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error deleting ranking', error: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}