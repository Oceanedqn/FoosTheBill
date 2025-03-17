import { Test, TestingModule } from '@nestjs/testing';
import { TournamentsService } from './tournaments.service';
import { Repository } from 'typeorm';
import { Tournament } from './tournament.entity';
import { UsersService } from 'src/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateTournamentDto, UpdateTournamentDto } from './dto/tournament.dto';

describe('TournamentsService', () => {
    let service: TournamentsService;
    let repository: Repository<Tournament>;
    let usersService: UsersService;

    const mockTournament: Tournament = {
        id: '1',
        name: 'Test Tournament',
        description: 'Description test',
        start_date: new Date(),
        admin_id: 'admin1',
    } as Tournament;

    const mockAdmin = {
        id: 'admin1',
        name: 'Admin User',
        firstname: 'Admin',
        email: 'admin@test.com',
        role: 'admin',
    };

    const mockTournamentRepository = {
        save: jest.fn().mockResolvedValue(mockTournament),
        find: jest.fn().mockResolvedValue([mockTournament]),
        findOne: jest.fn().mockResolvedValue(mockTournament),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const mockUsersService = {
        findOne: jest.fn().mockResolvedValue(mockAdmin),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TournamentsService,
                {
                    provide: getRepositoryToken(Tournament),
                    useValue: mockTournamentRepository,
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        service = module.get<TournamentsService>(TournamentsService);
        repository = module.get<Repository<Tournament>>(getRepositoryToken(Tournament));
        usersService = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create and return a tournament', async () => {
            const dto: CreateTournamentDto = {
                name: 'New Tournament',
                description: 'A test tournament',
                start_date: new Date(),
                admin_id: 'admin1',
            };

            const result = await service.create(dto, dto.admin_id);
            expect(repository.save).toHaveBeenCalledWith(dto);
            expect(usersService.findOne).toHaveBeenCalledWith(dto.admin_id);
            expect(result).toEqual({
                id: mockTournament.id,
                name: mockTournament.name,
                description: mockTournament.description,
                start_date: mockTournament.start_date,
                admin: mockAdmin,
            });
        });

        it('should throw an error if creation fails', async () => {
            jest.spyOn(repository, 'save').mockRejectedValue(new Error('Database Error'));

            await expect(service.create({} as CreateTournamentDto, 'admin1')).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('findAll', () => {
        it('should return an array of tournaments', async () => {
            const result = await service.findAll();
            expect(repository.find).toHaveBeenCalled();
            expect(result).toEqual([
                {
                    id: mockTournament.id,
                    name: mockTournament.name,
                    description: mockTournament.description,
                    start_date: mockTournament.start_date,
                    admin: mockAdmin,
                },
            ]);
        });

        it('should throw an error if find fails', async () => {
            jest.spyOn(repository, 'find').mockRejectedValue(new Error('Database Error'));

            await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findOne', () => {
        it('should return a single tournament', async () => {
            const result = await service.findOne('1');
            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(result).toEqual({
                id: mockTournament.id,
                name: mockTournament.name,
                description: mockTournament.description,
                start_date: mockTournament.start_date,
                admin: mockAdmin,
            });
        });

        it('should throw NotFoundException if tournament not found', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(service.findOne('2')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a tournament successfully', async () => {
            const dto: UpdateTournamentDto = { name: 'Updated Tournament' };
            await service.update('1', dto);
            expect(repository.update).toHaveBeenCalledWith('1', dto);
        });

        it('should throw NotFoundException if tournament not found', async () => {
            jest.spyOn(repository, 'update').mockResolvedValue({ affected: 0 } as any);

            await expect(service.update('2', {} as UpdateTournamentDto)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw InternalServerErrorException if update fails', async () => {
            jest.spyOn(repository, 'update').mockRejectedValue(new Error('Database Error'));

            await expect(service.update('1', {} as UpdateTournamentDto)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('remove', () => {
        it('should delete a tournament successfully', async () => {
            await service.remove('1');
            expect(repository.delete).toHaveBeenCalledWith('1');
        });

        it('should throw NotFoundException if tournament not found', async () => {
            jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 0 } as any);

            await expect(service.remove('2')).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException if delete fails', async () => {
            jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Database Error'));

            await expect(service.remove('1')).rejects.toThrow(InternalServerErrorException);
        });
    });
});
