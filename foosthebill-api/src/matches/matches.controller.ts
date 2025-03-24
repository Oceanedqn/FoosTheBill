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
     * Met à jour les informations d'un match existant.
     * 
     * @param id L'ID du match à mettre à jour.
     * @param match Les nouvelles données du match sous forme de `UpdateMatchDto`.
     * @returns Un objet de réponse avec le statut HTTP 200 et un message de succès si la mise à jour réussit.
     * @throws HttpException Si une erreur se produit lors de la mise à jour, renvoie un statut HTTP 500 avec un message d'erreur.
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
