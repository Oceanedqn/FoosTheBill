import { Test, TestingModule } from '@nestjs/testing';
import { TournamentsService } from './tournaments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tournament } from './tournament.entity';
import { UsersService } from 'src/users/users.service';
import { TeamsService } from 'src/teams/teams.service';
import { MatchesService } from 'src/matches/matches.service';
import { RankingsService } from 'src/rankings/rankings.service';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { ICreateTournament, IUpdateTournament, ITournament, ITournamentDetails, ITournamentMatches } from './dto/tournament.dto';
import * as Utils from 'src/utils/map-dto.utils';
import { Role } from 'src/users/user.entity';

describe('TournamentsService', () => {
    let service: TournamentsService;
    let tournamentRepository: Repository<Tournament>;
    let usersService: UsersService;
    let teamsService: TeamsService;
    let matchesService: MatchesService;
    let rankingsService: RankingsService;

    const mockTournamentRepository = {
        create: jest.fn().mockReturnThis(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const mockUsersService = {
        findOne: jest.fn(),
        findAll: jest.fn(),
    };

    const mockTeamsService = {
        isUserInTeam: jest.fn(),
    };

    const mockMatchesService = {
        isMatchesCreated: jest.fn(),
        findAll: jest.fn(),
    };

    const mockRankingsService = {
        findAllByTournamentId: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TournamentsService,
                { provide: getRepositoryToken(Tournament), useValue: mockTournamentRepository },
                { provide: UsersService, useValue: mockUsersService },
                { provide: TeamsService, useValue: mockTeamsService },
                { provide: MatchesService, useValue: mockMatchesService },
                { provide: RankingsService, useValue: mockRankingsService },
            ],
        }).compile();

        service = module.get<TournamentsService>(TournamentsService);
        tournamentRepository = module.get<Repository<Tournament>>(getRepositoryToken(Tournament));
        usersService = module.get<UsersService>(UsersService);
        teamsService = module.get<TeamsService>(TeamsService);
        matchesService = module.get<MatchesService>(MatchesService);
        rankingsService = module.get<RankingsService>(RankingsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should throw an error if the start date is in the past', async () => {
            const createTournament: ICreateTournament = {
                name: 'Test Tournament',
                description: 'A test tournament',
                start_date: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // Past date
                admin_id: 'admin-id',
            };

            await expect(service.create(createTournament)).rejects.toThrow(BadRequestException);
        });

        it('should create a tournament successfully', async () => {
            const createTournament: ICreateTournament = {
                name: 'Test Tournament',
                description: 'A test tournament',
                start_date: new Date(),
                admin_id: 'admin-id',
            };

            // Mock de l'utilisateur
            const mockUser = { id: 'admin-id', name: 'Admin', firstname: 'ali', role: Role.PARTICIPANT };

            // Mock du tournoi à créer
            const mockTournament: Tournament = {
                id: 'unique-id',
                name: 'Test Tournament',
                description: 'A test tournament',
                start_date: new Date('2025-03-25T05:00:24.999Z'),
                admin: {
                    id: 'admin-id', name: 'Admin', firstname: "alai", role: Role.PARTICIPANT,
                    email: '',
                    password: '',
                    teams: [],
                    creation_date: new Date()
                },
                creation_date: new Date(),
                teams: [],
                rankings: [],
            };

            // Mock de la méthode `save` du repository
            jest.spyOn(tournamentRepository, 'save').mockResolvedValue(mockTournament);

            // Appel à la méthode `create`
            const result = await service.create(createTournament);

            // Vérification que le résultat retourné est correctement formé
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('name', 'Test Tournament');
            expect(result).toHaveProperty('description', 'A test tournament');
            expect(result).toHaveProperty('start_date');
            expect(result.startDate).toEqual(new Date('2025-03-25T05:00:24.999Z'));
            expect(result.adminId).toEqual('admin-id');
        });
    });

    describe('findOneTournamentDetails', () => {
        it('should return tournament details successfully', async () => {
            const tournament = {
                id: '1',
                name: 'Test Tournament',
                description: 'A test tournament',
                start_date: new Date().toISOString(),
                admin: { id: 'admin-id', name: 'Admin' },
                teams: [],
            };

            const userId = 'user-id';
            mockTournamentRepository.findOne.mockResolvedValue(tournament);
            mockRankingsService.findAllByTournamentId.mockResolvedValue([]);
            mockTeamsService.isUserInTeam.mockResolvedValue(false);
            mockMatchesService.isMatchesCreated.mockResolvedValue(false);
            mockUsersService.findAll.mockResolvedValue([]);

            const result = await service.findOneTournamentDetails('1', userId);

            expect(result).toHaveProperty('tournament');
            expect(result.tournament.id).toEqual('1');
        });

        it('should throw NotFoundException if tournament not found', async () => {
            mockTournamentRepository.findOne.mockResolvedValue(null);

            await expect(service.findOneTournamentDetails('1', 'user-id')).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException on error', async () => {
            mockTournamentRepository.findOne.mockRejectedValue(new Error('Database error'));

            await expect(service.findOneTournamentDetails('1', 'user-id')).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findAll', () => {
        it('should return all tournaments', async () => {
            const tournaments = [
                { id: '1', name: 'Tournament 1', teams: [], start_date: new Date().toISOString(), admin: { id: 'admin-id', name: 'Admin' } },
                { id: '2', name: 'Tournament 2', teams: [], start_date: new Date().toISOString(), admin: { id: 'admin-id', name: 'Admin' } },
            ];
            mockTournamentRepository.find.mockResolvedValue(tournaments);
            mockTeamsService.isUserInTeam.mockResolvedValue(false);
            mockMatchesService.isMatchesCreated.mockResolvedValue(false);

            const result = await service.findAll('user-id');

            expect(result).toHaveLength(2);
            expect(result[0].id).toEqual('1');
        });

        it('should throw InternalServerErrorException if error occurs', async () => {
            mockTournamentRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(service.findAll('user-id')).rejects.toThrow(InternalServerErrorException);
        });
    });
});
