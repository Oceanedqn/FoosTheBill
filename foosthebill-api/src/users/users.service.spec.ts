import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Role } from './user.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ICreateUser, IUser } from './dto/user.dto';

describe('UsersService', () => {
    let service: UsersService;
    let userRepository: Repository<User>;

    const mockUserRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        find: jest.fn(),
    };

    const mockUserData: IUser = {
        role: Role.PARTICIPANT,
        name: 'pomme',
        firstname: 'oceane',
        id: '123'
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const createUserDto: ICreateUser = {
                email: 'test@example.com',
                password: 'plainPassword',
                role: Role.PARTICIPANT,
                name: 'John',
                firstname: 'Doe',
                creation_date: new Date(),
            };

            mockUserRepository.findOne.mockResolvedValue(null);
            mockUserRepository.save.mockResolvedValue(mockUserData);

            const result = await service.create(createUserDto);

            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
            expect(mockUserRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                email: createUserDto.email,
                password: expect.any(String),
                role: Role.PARTICIPANT,
                name: createUserDto.name, // Vérifie aussi que ces champs sont bien passés
                firstname: createUserDto.firstname,
                creation_date: createUserDto.creation_date,
            }));
            expect(result).toEqual({
                id: mockUserData.id,
                role: mockUserData.role,
                firstname: mockUserData.firstname,
                name: mockUserData.name
            });
        });

        it('should throw a ConflictException if the email already exists', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUserData);  // Simulate existing user with the same email

            await expect(service.create({
                email: 'test@example.com', password: 'plainPassword', role: Role.PARTICIPANT,
                name: '',
                firstname: '',
                creation_date: new Date()
            }))
                .rejects
                .toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return an array of users without passwords and creation dates', async () => {
            mockUserRepository.find.mockResolvedValue([mockUserData]);

            const result = await service.findAll();

            expect(result).toEqual([{
                id: mockUserData.id,
                role: mockUserData.role,
                firstname: mockUserData.firstname,
                name: mockUserData.name
            }]);
        });

        it('should throw an InternalServerErrorException if there is an error fetching users', async () => {
            mockUserRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findOne', () => {
        it('should return a user by ID', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUserData);

            const result = await service.findOne('123');

            expect(result).toEqual({
                id: mockUserData.id,
                role: mockUserData.role,
                firstname: mockUserData.firstname,
                name: mockUserData.name
            });
        });

        it('should throw a NotFoundException if user is not found by ID', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update user information', async () => {
            const updateUserDto = { email: 'new-email@example.com', role: Role.ADMIN };

            mockUserRepository.findOne.mockResolvedValue(mockUserData);
            mockUserRepository.update.mockResolvedValue(null);

            await service.update('123', updateUserDto);

            expect(mockUserRepository.update).toHaveBeenCalledWith('123', updateUserDto);
        });

        it('should throw a NotFoundException if user is not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(service.update('123', { email: 'new-email@example.com', role: Role.ADMIN }))
                .rejects
                .toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should delete a user by ID', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUserData);
            mockUserRepository.delete.mockResolvedValue(undefined);

            await service.remove('123');

            expect(mockUserRepository.delete).toHaveBeenCalledWith('123');
        });

        it('should throw a NotFoundException if user is not found for deletion', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(service.remove('123')).rejects.toThrow(NotFoundException);
        });
    });
});
