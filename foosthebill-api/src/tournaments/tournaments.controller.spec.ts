import { Test, TestingModule } from '@nestjs/testing';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto, UpdateTournamentDto } from './dto/tournament.dto';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';


describe('TournamentsController', () => {
    let controller: TournamentsController;
    let service: TournamentsService;
    let jwtService: JwtService;


    const mockTournamentsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockJwtService = {
        signAsync: jest.fn(),
    };

    const mockUsersService = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TournamentsController],
            providers: [
                { provide: TournamentsService, useValue: mockTournamentsService },
                { provide: AllExceptionsFilter, useValue: new AllExceptionsFilter() },
                { provide: JwtService, useValue: mockJwtService },
                { provide: UsersService, useValue: mockUsersService }, // Ajout de UsersService mocké


            ],
        }).compile();

        controller = module.get<TournamentsController>(TournamentsController);
        service = module.get<TournamentsService>(TournamentsService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a tournament', async () => {
            const dto: CreateTournamentDto = {
                name: 'Tournament 1',
                description: '',
                start_date: new Date(),
                admin_id: ''
            };
            const mockUser = { id: '123' };
            const mockRequest = { user: mockUser };
            const createdTournament = { id: '1', ...dto };

            mockTournamentsService.create.mockResolvedValue(createdTournament);

            const result = await controller.create(dto, mockRequest);

            expect(result).toEqual({
                statusCode: HttpStatus.CREATED,
                message: 'Tournament created successfully',
                data: createdTournament,
            });
            expect(mockTournamentsService.create).toHaveBeenCalledWith(dto, mockUser.id);
        });
    });

    describe('findAll', () => {
        it('should return all tournaments', async () => {
            const tournaments = [{ id: '1', name: 'Tournament 1' }];
            mockTournamentsService.findAll.mockResolvedValue(tournaments);

            const result = await controller.findAll();

            expect(result).toEqual({
                statusCode: HttpStatus.OK,
                message: 'Tournaments retrieved successfully',
                data: tournaments,
            });
        });
    });

    describe('findOne', () => {
        it('should return one tournament', async () => {
            const tournament = { id: '1', name: 'Tournament 1' };
            mockTournamentsService.findOne.mockResolvedValue(tournament);

            const result = await controller.findOne('1', { user: { id: '123' } });

            expect(result).toEqual({
                statusCode: HttpStatus.OK,
                message: 'Tournament retrieved successfully',
                data: tournament,
            });
        });
    });

    describe('update', () => {
        it('should update a tournament', async () => {
            const dto: UpdateTournamentDto = { name: 'Updated Tournament' };

            mockTournamentsService.update.mockResolvedValue(true);

            const result = await controller.update('1', dto, { user: { id: '123' } });

            expect(result).toEqual({
                statusCode: HttpStatus.OK,
                message: 'Tournament updated successfully',
            });
            expect(mockTournamentsService.update).toHaveBeenCalledWith('1', dto);
        });
    });

    describe('remove', () => {
        it('should delete a tournament', async () => {
            mockTournamentsService.remove.mockResolvedValue(true);

            const result = await controller.remove('1', { user: { id: '123' } });

            expect(result).toEqual({
                statusCode: HttpStatus.OK,
                message: 'Tournament deleted successfully',
            });
            expect(mockTournamentsService.remove).toHaveBeenCalledWith('1');
        });
    });
});
