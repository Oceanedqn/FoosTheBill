import { Injectable, NotFoundException, InternalServerErrorException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICreateMatches, IMatch, IRoundMatches, IUpdateMatch } from './dto/match.dto';
import { TournamentsService } from 'src/tournaments/tournaments.service';
import { MatchResult } from 'src/match-results/match-result.entity';
import { Ranking } from 'src/rankings/ranking.entity';
import { RankingsService } from 'src/rankings/rankings.service';
import { mapToIMatch, mapToITeam, mapToITeamScore } from 'src/utils/map-dto.utils';
import { Match } from './match.entity';
import { ITeam } from 'src/teams/dto/team.dto';
import { MatchTeamsService } from 'src/match-team/match-teams.service';
import { MatchTeam } from 'src/match-team/match-team.entity';
import { Tournament } from 'src/tournaments/tournament.entity';
import { ITournament } from 'src/tournaments/dto/tournament.dto';

@Injectable()
export class MatchesService {
    constructor(
        @InjectRepository(Match) private matchesRepository: Repository<Match>,
        @Inject(forwardRef(() => TournamentsService)) private readonly tournamentsService: TournamentsService,
        @Inject(forwardRef(() => RankingsService)) private readonly rankingsService: RankingsService,
        @InjectRepository(MatchResult) private matchResultsRepository: Repository<MatchResult>,
        @InjectRepository(MatchTeam) private matchTeamsRepository: Repository<MatchTeam>,
        @Inject(forwardRef(() => MatchTeamsService)) private readonly matchTeamsService: MatchTeamsService,
    ) { }

    /**
     * Creates matches for a given tournament based on the provided teams.
     * 
     * @param createMatchesDto - Data Transfer Object containing tournament ID and the list of teams to participate.
     * @param userId - The ID of the user making the request.
     * @returns A promise that resolves to an array of `IRoundMatches`, which represents the matches created for the tournament.
     * @throws NotFoundException - If the tournament is not found.
     * @throws InternalServerErrorException - If there is an error during the creation of the matches.
     */
    async createMatches(createMatchesDto: ICreateMatches, userId: string): Promise<IRoundMatches[]> {
        try {
            // Récupérer le tournoi
            const tournament = await this.tournamentsService.findOne(createMatchesDto.tournamentId, userId);
            if (!tournament) {
                throw new NotFoundException('Tournament not found');
            }

            const teams = this.adjustTeamsForOddNumber(createMatchesDto.teams);
            const roundMatches = await this.generateRoundMatches(tournament, teams);

            await this.createInitialRankings(tournament, teams)

            return roundMatches;
        } catch (error) {
            console.error("Error in createMatches:", error);
            throw new InternalServerErrorException('Error creating match', error.message);
        }
    }


    /**
     * Creates a match between two teams for a given tournament.
     * 
     * @param tournament - The tournament in which the match is created.
     * @param round - The round number for the match.
     * @param team1 - The first team to compete.
     * @param team2 - The second team to compete.
     * @returns A promise that resolves to an `IMatch` representing the created match with associated teams and scores.
     * @throws InternalServerErrorException - If there is an error while creating the match.
     */
    private async createMatch(tournament: ITournament, round: number, team1: ITeam, team2: ITeam): Promise<IMatch> {
        try {
            // Créer un match
            const match = this.matchesRepository.create({
                tournament,
                round: round + 1,  // On commence les rounds à 1
                isClosed: false,
            });

            const savedMatch = await this.matchesRepository.save(match);

            // Vérification de la sauvegarde du match
            if (!savedMatch) {
                throw new InternalServerErrorException("Failed to save the match.");
            }

            // Créer et sauvegarder matchTeam1 pour l'équipe 1
            const matchTeam1 = this.matchTeamsRepository.create({
                match: savedMatch, // Associer le match à l'équipe 1
                team: team1,  // Associer l'équipe 1
                score: 0,     // Initialiser les scores
            });

            // Sauvegarder le matchTeam1
            const savedMatchTeam1 = await this.matchTeamsRepository.save(matchTeam1);

            // Vérification de la sauvegarde du matchTeam1
            if (!savedMatchTeam1) {
                throw new InternalServerErrorException("Failed to save match team 1.");
            }

            // Créer et sauvegarder matchTeam2 pour l'équipe 2
            const matchTeam2 = this.matchTeamsRepository.create({
                match: savedMatch, // Associer le match à l'équipe 2
                team: team2,  // Associer l'équipe 2
                score: 0,     // Initialiser les scores
            });

            // Sauvegarder le matchTeam2
            const savedMatchTeam2 = await this.matchTeamsRepository.save(matchTeam2);

            // Vérification de la sauvegarde du matchTeam2
            if (!savedMatchTeam2) {
                throw new InternalServerErrorException("Failed to save match team 2.");
            }

            // Ajouter les matchTeams au match
            savedMatch.matchTeams = [savedMatchTeam1, savedMatchTeam2];


            // Retourner le match avec les équipes et les scores
            return {
                id: savedMatch.id,
                round: round + 1,  // Round index commence à 1
                teams: [
                    mapToITeamScore(savedMatch.matchTeams[0].team, tournament.adminId, 0),
                    mapToITeamScore(savedMatch.matchTeams[1].team, tournament.adminId, 0),
                ],
                isClosed: false,
            };
        } catch (error) {
            console.error("Error creating match:", error);
            throw new InternalServerErrorException('Error creating match', error.message);
        }
    }


    /**
     * Generates the round matches for a tournament based on the provided teams.
     * 
     * @param tournament - The tournament for which round matches will be generated.
     * @param teams - The list of teams participating in the tournament.
     * @returns A promise that resolves to an array of `IRoundMatches` representing the round-based matches.
     * @throws InternalServerErrorException - If an error occurs during match generation.
     */
    private async generateRoundMatches(tournament: ITournament, teams: ITeam[]): Promise<IRoundMatches[]> {
        const roundMatches: IRoundMatches[] = [];
        const totalRounds = teams.length - 1;
        let modifiedTeams = [...teams];

        if (modifiedTeams.length % 2 !== 0) {
            modifiedTeams.push({
                id: "empty", name: "Empty",
                isMyTeam: false,
                players: []
            } as ITeam);
        }

        // Générer les matchs pour chaque round
        for (let round = 0; round < totalRounds; round++) {
            const matchRounds: IMatch[] = [];

            // Créer les matchs pour ce round
            for (let i = 0; i < modifiedTeams.length / 2; i++) {
                const team1 = modifiedTeams[i];
                const team2 = modifiedTeams[modifiedTeams.length - 1 - i];

                // Si une équipe est "empty", ne pas créer de match
                if (team1.id !== "empty" && team2.id !== "empty") {
                    const match = await this.createMatch(tournament, round, team1, team2);
                    matchRounds.push(match);
                }
            }

            roundMatches.push({
                round: round + 1,
                matches: matchRounds,
            });

            // Rotation des équipes pour le prochain round
            modifiedTeams = [modifiedTeams[0], ...modifiedTeams.slice(2), modifiedTeams[1]];
        }

        return roundMatches;
    }


    /**
     * Adjusts the teams for odd numbers by adding a fictional "empty" team if necessary.
     * 
     * @param teams - The list of teams to adjust.
     * @returns The adjusted list of teams.
     */
    private adjustTeamsForOddNumber(teams: ITeam[]): ITeam[] {
        // Si le nombre d'équipes est impair, ajouter une équipe fictive
        const isOdd = teams.length % 2 !== 0;
        if (isOdd) {
            teams.push({
                id: "empty", name: "No team", players: []
            } as unknown as ITeam);  // L'équipe fictive "empty"
        }
        return teams;
    }


    /**
     * Creates initial rankings for each team in the tournament.
     * 
     * @param tournament - The tournament for which rankings will be created.
     * @param teams - The list of teams to be ranked.
     * @returns A promise that resolves when the initial rankings have been created.
     */
    private async createInitialRankings(tournament: ITournament, teams: ITeam[]): Promise<void> {
        for (const team of teams) {
            if (team.id !== "empty") {
                const ranking = await this.rankingsService.create({
                    tournament,
                    team,
                    position: 0,
                    points: 0,
                } as unknown as Ranking);
            }
        }
    }




    /**
     * Retrieves all matches for a given tournament.
     * 
     * @param tournamentId - The ID of the tournament whose matches are to be fetched.
     * @returns A promise that resolves to an array of `IRoundMatches` containing all the matches for the tournament.
     * @throws InternalServerErrorException - If there is an error fetching the matches from the repository.
     */
    async findAll(tournamentId: string, userId: string): Promise<IRoundMatches[]> {
        try {
            // Fetch all matches for the tournament, including related matchTeams, their teams, and players
            const matches = await this.matchesRepository.find({
                where: { tournament: { id: tournamentId } },
                relations: [
                    'matchTeams',           // Charger les matchTeams
                    'matchTeams.team',      // Charger les équipes pour chaque matchTeam
                    'matchTeams.team.players', // Charger les joueurs pour chaque équipe
                ],
            });

            if (!matches || matches.length === 0) {
                throw new NotFoundException(`No matches found for tournament with ID: ${tournamentId}`);
            }

            // Organize matches by round
            const roundMatches: Record<number, IMatch[]> = {};  // Group matches by round number

            matches.forEach((match) => {
                // Initialize the round if not already present
                if (!roundMatches[match.round]) {
                    roundMatches[match.round] = [];
                }

                // Initialize scores object for the match
                const scores: Record<string, number> = {};

                // Loop through each matchTeam and directly use the score from matchTeam
                match.matchTeams.forEach((matchTeam) => {
                    // Use the score directly from the matchTeam
                    scores[matchTeam.team.id] = matchTeam.score;
                });

                // Ensure each match has two teams (matchTeams)
                const teams = match.matchTeams.map((mt) => mt.team);

                // Map the match to the required format, using the correct scores
                const mappedMatch = mapToIMatch(match, userId, scores, teams);  // Map each team with its actual score

                // Add the mapped match to the roundMatches object
                roundMatches[match.round].push(mappedMatch);
            });

            // Convert the object into an array of IRoundMatches, sorted by round number
            const result: IRoundMatches[] = Object.entries(roundMatches)
                .map(([round, matches]) => ({
                    round: parseInt(round, 10),  // Ensure round is a number
                    matches,
                }))
                .sort((a, b) => a.round - b.round);  // Sort rounds in ascending order

            return result; // Return the sorted round matches
        } catch (error) {
            throw new InternalServerErrorException('Error fetching matches');
        }
    }



    /**
     * Updates an existing match.
     * 
     * @param id - The ID of the match to update.
     * @param matchUpdate - The match object containing the updated data.
     * @returns A promise that resolves when the match is successfully updated.
     * @throws NotFoundException - If the match with the given ID is not found.
     * @throws InternalServerErrorException - If there is an error updating the match in the repository.
     */
    async update(id: string, matchUpdate: IUpdateMatch): Promise<void> {
        try {

            // Récupérer le match avec les équipes associées
            const match = await this.matchesRepository.findOne({
                where: { id },
                relations: ['matchTeams', 'matchTeams.team', 'matchResults', 'matchResults.team'], // Charger les résultats de match
            });

            if (!match) {
                throw new NotFoundException(`Match with id ${id} not found`);
            }

            // Vérifier que le match a bien deux équipes
            if (match.matchTeams.length !== 2) {
                throw new InternalServerErrorException('Match must have exactly two teams');
            }

            // Récupérer les MatchTeams associés aux équipes via les IDs des équipes
            const matchTeam1 = match.matchTeams.find(mt => mt.team.id === matchUpdate.team_1_id);
            const matchTeam2 = match.matchTeams.find(mt => mt.team.id === matchUpdate.team_2_id);

            if (!matchTeam1 || !matchTeam2) {
                throw new NotFoundException('One or both teams not found in the match');
            }

            // Mise à jour des scores pour chaque équipe
            matchTeam1.score = matchUpdate.score_team_1;
            matchTeam2.score = matchUpdate.score_team_2;

            // Sauvegarder les scores mis à jour
            await this.matchTeamsRepository.save([matchTeam1, matchTeam2]);

            // Mettre à jour l'état du match (si nécessaire)
            match.isClosed = matchUpdate.isClosed;

            // Sauvegarder le match mis à jour
            await this.matchesRepository.save(match);

            // Créer ou mettre à jour les résultats du match dans matchResults
            const matchResult1 = match.matchResults.find(result => result.team.id === matchTeam1.team.id);
            const matchResult2 = match.matchResults.find(result => result.team.id === matchTeam2.team.id);

            // Si un matchResult existe déjà, on le met à jour, sinon on le crée
            if (matchResult1) {
                matchResult1.score = matchUpdate.score_team_1;
                await this.matchResultsRepository.save(matchResult1);
            } else {
                // Créer un nouveau résultat pour la première équipe
                const newResult1 = this.matchResultsRepository.create({
                    match: match,
                    team: matchTeam1.team,
                    score: matchUpdate.score_team_1,
                    recorded_date: new Date(),
                });
                await this.matchResultsRepository.save(newResult1);
            }

            if (matchResult2) {
                matchResult2.score = matchUpdate.score_team_2;
                await this.matchResultsRepository.save(matchResult2);
            } else {
                // Créer un nouveau résultat pour la deuxième équipe
                const newResult2 = this.matchResultsRepository.create({
                    match: match,
                    team: matchTeam2.team,
                    score: matchUpdate.score_team_2,
                    recorded_date: new Date(),
                });
                await this.matchResultsRepository.save(newResult2);
            }

            // Si le match est fermé, mettre à jour les classements
            if (matchUpdate.isClosed) {

                // Mettre à jour les classements après la fermeture du match
                await this.rankingsService.update(
                    matchUpdate.tournament_id,
                    match.matchTeams[0].team.id, // Première équipe
                    match.matchTeams[1].team.id, // Deuxième équipe
                    match.matchTeams[0].score,
                    match.matchTeams[1].score
                );

            }
        } catch (error) {
            console.error('Error during match update:', error);  // Log de l'erreur
            throw new InternalServerErrorException('Error updating match', error.message);
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