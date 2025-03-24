import { Test, TestingModule } from '@nestjs/testing';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';
import { TeamsService } from '../teams/teams.service';
import { MatchesService } from 'src/matches/matches.service';
import { RankingsService } from 'src/rankings/rankings.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { HttpStatus } from '@nestjs/common';
import { Request } from '@nestjs/common';
import { Role } from 'src/users/user.entity';
import type { ITeam } from 'src/teams/dto/team.dto';

// Mock des services
const mockTournamentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOneTournamentDetails: jest.fn(),
    findOneTournamentMatches: jest.fn(),
};

const mockTeamsService = {
    createTeamByTournamentId: jest.fn(),
    createTeamsByTournamentId: jest.fn(),
};

const mockMatchesService = {
    createMatches: jest.fn(),
};

const mockRankingsService = {};

const mockRequest = {
    user: { id: '123' },
};

describe('TournamentsController', () => {
    let controller: TournamentsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TournamentsController],
            providers: [
                { provide: TournamentsService, useValue: mockTournamentsService },
                { provide: TeamsService, useValue: mockTeamsService },
                { provide: MatchesService, useValue: mockMatchesService },
                { provide: RankingsService, useValue: mockRankingsService },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<TournamentsController>(TournamentsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a tournament', async () => {
            const createTournamentDto = {
                name: 'Tournament 1',
                description: 'Description',
                start_date: new Date(),
                admin_id: '123',
            };
            const createdTournament = { ...createTournamentDto, id: '1' };
            mockTournamentsService.create.mockResolvedValue(createdTournament);

            const result = await controller.create(createTournamentDto, mockRequest);

            expect(result).toEqual({
                statusCode: HttpStatus.CREATED,
                message: 'Tournament created successfully',
                data: createdTournament,
            });
            expect(mockTournamentsService.create).toHaveBeenCalledWith(createTournamentDto);
        });
    });

    describe('findAll', () => {
        it('should return all tournaments', async () => {
            const tournaments = [{ id: '1', name: 'Tournament 1' }];
            mockTournamentsService.findAll.mockResolvedValue(tournaments);

            const result = await controller.findAll(mockRequest);

            expect(result).toEqual({
                statusCode: HttpStatus.OK,
                message: 'Tournaments retrieved successfully',
                data: tournaments,
            });
            expect(mockTournamentsService.findAll).toHaveBeenCalledWith(mockRequest.user.id);
        });
    });

    describe('findTournamentDetails', () => {
        it('should return tournament details', async () => {
            const tournament = { id: '1', name: 'Tournament 1' };
            mockTournamentsService.findOneTournamentDetails.mockResolvedValue(tournament);

            const result = await controller.findTournamentDetails('1', mockRequest);

            expect(result).toEqual({
                statusCode: HttpStatus.OK,
                message: 'Tournament with teams and users retrieved successfully',
                data: tournament,
            });
            expect(mockTournamentsService.findOneTournamentDetails).toHaveBeenCalledWith(
                '1',
                mockRequest.user.id
            );
        });
    });

    describe('findTournamentMatches', () => {
        it('should return tournament matches', async () => {
            const tournament = { id: '1', name: 'Tournament 1' };
            mockTournamentsService.findOneTournamentMatches.mockResolvedValue(tournament);

            const result = await controller.findTournamentMatches('1', mockRequest);

            expect(result).toEqual({
                statusCode: HttpStatus.OK,
                message: 'Tournament with my team and matches retrieved successfully',
                data: tournament,
            });
            expect(mockTournamentsService.findOneTournamentMatches).toHaveBeenCalledWith(
                '1',
                mockRequest.user.id
            );
        });
    });

    describe('createTeam', () => {
        it('should create a team in a tournament', async () => {
            const createTeam = {
                name: 'Team 1',
                tournamentId: '1',
                players: [
                    { id: '1', name: 'player1', firstname: 'player', role: Role.PARTICIPANT },  // Assurez-vous que chaque joueur est un objet de type IUser
                    { id: '2', name: 'player2', firstname: 'player', role: Role.PARTICIPANT },
                ],
            };
            const createdTeam = { ...createTeam, id: '1' };
            mockTeamsService.createTeamByTournamentId.mockResolvedValue(createdTeam);

            const result = await controller.createTeam('1', createTeam, mockRequest);

            expect(result).toEqual({
                statusCode: HttpStatus.CREATED,
                message: 'Team created successfully',
                data: createdTeam,
            });
            expect(mockTeamsService.createTeamByTournamentId).toHaveBeenCalledWith(
                createTeam,
                mockRequest.user.id,
                true
            );
        });
    });

    describe('createTeams', () => {
        it('should create multiple teams in a tournament', async () => {
            const createTeams = [
                {
                    name: 'Team 1',
                    tournamentId: '1',
                    players: [
                        { id: '1', name: 'player1', firstname: 'Player', role: Role.PARTICIPANT },
                        { id: '2', name: 'player2', firstname: 'Player', role: Role.PARTICIPANT },
                    ],
                },
                {
                    name: 'Team 2',
                    tournamentId: '1',
                    players: [
                        { id: '3', name: 'player3', firstname: 'Player', role: Role.PARTICIPANT },
                        { id: '4', name: 'player4', firstname: 'Player', role: Role.PARTICIPANT },
                    ],
                },
            ];
            const createdTeams = [{ ...createTeams[0], id: '1' }];
            mockTeamsService.createTeamsByTournamentId.mockResolvedValue(createdTeams);

            const result = await controller.createTeams('1', createTeams, mockRequest);

            expect(result).toEqual({
                statusCode: HttpStatus.CREATED,
                message: 'Team created successfully',
                data: createdTeams,
            });
            expect(mockTeamsService.createTeamsByTournamentId).toHaveBeenCalledWith(
                createTeams,
                mockRequest.user.id
            );
        });
    });

    describe('createAllMatches', () => {
        it('should create matches for a tournament', async () => {
            const teams: ITeam[] = [
                {
                    id: '1',
                    name: 'Team 1',
                    isMyTeam: true, // Ajout de la propriété manquante
                    players: [
                        { id: '1', name: 'player1', firstname: 'Player', role: Role.PARTICIPANT },
                        { id: '2', name: 'player2', firstname: 'Player', role: Role.PARTICIPANT },
                    ],
                },
                {
                    id: '2',
                    name: 'Team 2',
                    isMyTeam: false, // Ajout de la propriété manquante
                    players: [
                        { id: '3', name: 'player3', firstname: 'Player', role: Role.PARTICIPANT },
                        { id: '4', name: 'player4', firstname: 'Player', role: Role.PARTICIPANT },
                    ],
                },
            ];
            const matches = [{ id: '1', team1: 'Team 1', team2: 'Team 2' }];
            mockMatchesService.createMatches.mockResolvedValue(matches);

            const result = await controller.createAllMatches('1', teams, mockRequest);

            expect(result).toEqual({
                statusCode: HttpStatus.CREATED,
                message: 'Matches created successfully',
                data: matches,
            });
            expect(mockMatchesService.createMatches).toHaveBeenCalledWith(
                { tournamentId: '1', teams },
                mockRequest.user.id
            );
        });
    });
});
