import { Controller, Param, Body, Put, HttpException, HttpStatus, UseGuards, UseFilters } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { IUpdateMatch } from './dto/match.dto';

@Controller('matches')
@UseFilters(new AllExceptionsFilter())
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) { }



    /**
     * Updates the information of an existing match.
     * 
     * @param id - The ID of the match to update.
     * @param match - The updated match data as an `IUpdateMatch` object.
     * @returns An object with an HTTP status code 200 and a success message if the update is successful.
     * @throws HttpException - If an error occurs during the update, throws an HTTP status 500 with an error message.
     */
    @UseGuards(AuthGuard, RolesGuard)
    @Put(':id')
    async update(@Param('id') id: string, @Body() match: IUpdateMatch) {
        try {
            await this.matchesService.update(id, match);
            return { code: HttpStatus.OK, message: 'Match updated successfully' };
        } catch (error) {
            throw new HttpException({ code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error updating match', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
