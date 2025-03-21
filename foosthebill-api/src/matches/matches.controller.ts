import { Controller, Get, Post, Param, Body, Put, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { Match } from './match.entity';

@Controller('matches')
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) { }
    @Put(':id')
    async update(@Param('id') id: string, @Body() match: Match) {
        try {
            await this.matchesService.update(id, match);
            return { code: HttpStatus.OK, message: 'Match updated successfully' };
        } catch (error) {
            throw new HttpException({ code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error updating match', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
