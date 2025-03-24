import { Controller, Get, Post, Param, Body, Put, Delete, HttpException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { Ranking } from './ranking.entity';

@Controller('rankings')
export class RankingsController {
    constructor(private readonly rankingsService: RankingsService) { }

    /**
     * Creates a new ranking.
     * 
     * @param ranking - The ranking data to be created.
     * @returns A response containing the HTTP status code, success message, and the created ranking data.
     * @throws InternalServerErrorException - If an error occurs during the creation process.
     * @throws HttpException - If any other exception occurs.
     */
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

}