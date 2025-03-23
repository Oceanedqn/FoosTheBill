import { Injectable, NotFoundException, InternalServerErrorException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './match.entity';
import { CreateMatchesDto, MatchDto, MatchResponseDto, MatchesResponseDto, UpdateMatchDto } from './dto/match.dto';
import { TournamentsService } from 'src/tournaments/tournaments.service';
import { TeamResponseDto } from 'src/teams/dto/team.dto';
import { mapToMatchesResponseDto, mapToMatchResponseDto } from 'src/utils/map-dto.utils';
import { MatchResult } from 'src/match-results/match-result.entity';

@Injectable()
export class MatchesService {
    constructor(
        @InjectRepository(Match) private matchesRepository: Repository<Match>,
        @Inject(forwardRef(() => TournamentsService)) private readonly tournamentsService: TournamentsService,
        @InjectRepository(MatchResult) private matchResultsRepository: Repository<MatchResult>,
    ) { }

    /**
 * Creates matches for a given tournament based on the provided teams.
 * 
 * @param createMatchesDto - Data Transfer Object containing tournament ID and the list of teams to participate.
 * @param userId - The ID of the user making the request.
 * @returns A promise that resolves to an array of `MatchesResponseDto`, which represents the matches created for the tournament.
 * @throws NotFoundException - If the tournament is not found.
 * @throws InternalServerErrorException - If there is an error during the creation of the matches.
 */
    async createMatches(createMatchesDto: CreateMatchesDto, userId: string): Promise<MatchesResponseDto[]> {
        try {
            const tournament = await this.tournamentsService.findOne(createMatchesDto.tournamentId, userId);
            if (!tournament) {
                throw new NotFoundException('Tournament not found');
            }

            let teams = [...createMatchesDto.teams];

            // Check if the number of teams is odd and add a dummy team
            const isOdd = teams.length % 2 !== 0;
            if (isOdd) {
                teams.push({
                    id: "empty",
                    name: "No team",
                    participant1: null,
                    participant2: null,
                } as unknown as TeamResponseDto);
            }

            const totalRounds = teams.length - 1;
            const matchResponses: MatchesResponseDto[] = [];

            // Generate the matches while respecting the rotation of the teams
            for (let round = 0; round < totalRounds; round++) {
                const matchRounds: MatchDto[] = [];

                for (let i = 0; i < teams.length / 2; i++) {
                    const team1 = teams[i];
                    const team2 = teams[teams.length - 1 - i];

                    // Do not save a match for a fictitious team
                    if (team1.id !== "empty" && team2.id !== "empty") {
                        const match = this.matchesRepository.create({
                            tournament: tournament,
                            team1: team1,
                            team2: team2,
                            score_team_1: 0,
                            score_team_2: 0,
                            round: round + 1
                        });

                        const savedMatch = await this.matchesRepository.save(match);

                        matchRounds.push({
                            id: savedMatch.id,
                            team1: savedMatch.team1,
                            team2: savedMatch.team2,
                            round: round + 1,
                            score_team_1: savedMatch.score_team_1,
                            score_team_2: savedMatch.score_team_2,
                        });
                    }
                }

                // Map the round matches to the MatchResponseDto
                matchResponses.push({
                    round: round + 1, // ID du round
                    matches: matchRounds.map(match => mapToMatchResponseDto(match, "")),
                });

                // Team rotation: the first team stays fixed, while the others rotate
                teams = [teams[0], ...teams.slice(2), teams[1]];
            }

            return matchResponses;
        } catch (error) {
            console.error("Error in createMatches:", error);
            throw new InternalServerErrorException('Error creating match', error.message);
        }
    }


    /**
 * Retrieves all matches for a given tournament.
 * 
 * @param tournamentId - The ID of the tournament whose matches are to be fetched.
 * @returns A promise that resolves to an array of `MatchesResponseDto` containing all the matches for the tournament.
 * @throws InternalServerErrorException - If there is an error fetching the matches from the repository.
 */
    async findAll(tournamentId: string): Promise<MatchesResponseDto[]> {
        try {
            const matches = await this.matchesRepository.find({
                where: { tournament: { id: tournamentId } },
                relations: [
                    'team1', 'team2',
                    'team1.participant1', 'team1.participant2',
                    'team2.participant1', 'team2.participant2'
                ],
            });

            return mapToMatchesResponseDto(matches);
        } catch (error) {
            throw new InternalServerErrorException('Error fetching matches', error.message);
        }
    }


    /**
 * Retrieves a single match based on its ID.
 * 
 * @param id - The ID of the match to retrieve.
 * @returns A promise that resolves to a `Match` object.
 * @throws NotFoundException - If the match with the given ID is not found.
 * @throws InternalServerErrorException - If there is an error fetching the match from the repository.
 */
    async findOne(id: string): Promise<Match> {
        try {
            const match = await this.matchesRepository.findOne({ where: { id } });
            if (!match) {
                throw new NotFoundException(`Match with id ${id} not found`);
            }
            return match;
        } catch (error) {
            throw new InternalServerErrorException('Error fetching match', error.message);
        }
    }


    /**
 * Updates an existing match.
 * 
 * @param id - The ID of the match to update.
 * @param matchDto - The match object containing the updated data.
 * @returns A promise that resolves when the match is successfully updated.
 * @throws NotFoundException - If the match with the given ID is not found.
 * @throws InternalServerErrorException - If there is an error updating the match in the repository.
 */
    async update(id: string, matchDto: UpdateMatchDto): Promise<void> {
        try {
            const match = await this.findOne(id);
            if (!match) {
                throw new NotFoundException(`Match with id ${id} not found`);
            }

            // Create a new entry in MatchResult before updating the match
            const matchResult = this.matchResultsRepository.create({
                match: match,
                score_team_1: matchDto.score_team_1,
                score_team_2: matchDto.score_team_2,
                recorded_date: new Date(),
            });

            await this.matchResultsRepository.save(matchResult);

            // Update the match with the new values
            await this.matchesRepository.update(id, matchDto);
        } catch (error) {
            throw new InternalServerErrorException('Error updating match', error.message);
        }
    }


    /**
 * Deletes a match by its ID.
 * 
 * @param id - The ID of the match to delete.
 * @returns A promise that resolves to the result of the deletion operation.
 * @throws NotFoundException - If the match with the given ID is not found.
 * @throws InternalServerErrorException - If there is an error deleting the match from the repository.
 */
    async remove(id: string): Promise<any> {
        try {
            const result = await this.matchesRepository.delete(id);
            if (result.affected === 0) {
                throw new NotFoundException(`Match with id ${id} not found`);
            }
            return result;
        } catch (error) {
            throw new InternalServerErrorException('Error deleting match', error.message);
        }
    }


    /**
 * Checks whether matches have already been created for a given tournament.
 * 
 * @param tournamentId - The ID of the tournament to check for existing matches.
 * @returns A promise that resolves to a boolean: `true` if matches have been created, `false` otherwise.
 * @throws InternalServerErrorException - If there is an error checking the matches in the repository.
 */
    async isMatchesCreated(tournamentId: string): Promise<boolean> {
        try {

            const matches = await this.matchesRepository.find({
                where: { tournament: { id: tournamentId } },
            });


            return matches.length > 0;
        } catch (error) {
            throw new InternalServerErrorException('Error checking if matches are created', error.message);
        }
    }
}