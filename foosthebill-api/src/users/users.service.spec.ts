import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
    let service: UsersService;
    let userRepository: Repository<User>;

    const mockUser: User = {
        id: '1',
        name: 'Doe',
        firstname: 'John',
        email: 'john.doe@example.com',
        password: 'hashedpassword',
        role: Role.PARTICIPANT,
        creation_date: new Date(),
    };

    const mockUserRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
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

    describe('create', () => {
        it('devrait créer un nouvel utilisateur', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            // Using mockReturnValueOnce for synchronous bcrypt.hash
            jest.spyOn(bcrypt, 'hash').mockImplementationOnce(async () => 'hashedpassword');


            jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

            const createUserDto: CreateUserDto = {
                name: 'Doe',
                firstname: 'John',
                email: 'john.doe@example.com',
                password: 'password123',
                role: Role.PARTICIPANT,
                creation_date: new Date(),
            };

            const result = await service.create(createUserDto);

            expect(result).toEqual({
                id: mockUser.id,
                name: mockUser.name,
                firstname: mockUser.firstname,
                email: mockUser.email,
                role: mockUser.role,
                creation_date: mockUser.creation_date,
            });
        });

        it('devrait renvoyer une erreur si l’utilisateur existe déjà', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

            const createUserDto: CreateUserDto = {
                name: 'Doe',
                firstname: 'John',
                email: 'john.doe@example.com',
                password: 'password123',
                role: Role.PARTICIPANT,
                creation_date: new Date(),
            };

            await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('devrait retourner tous les utilisateurs', async () => {
            jest.spyOn(userRepository, 'find').mockResolvedValue([mockUser]);

            const result = await service.findAll();
            expect(result).toEqual([
                {
                    id: mockUser.id,
                    name: mockUser.name,
                    firstname: mockUser.firstname,
                    email: mockUser.email,
                    role: mockUser.role,
                    creation_date: mockUser.creation_date,
                },
            ]);
        });
    });

    describe('findOne', () => {
        it('devrait retourner un utilisateur par ID', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

            const result = await service.findOne('1');
            expect(result).toEqual({
                id: mockUser.id,
                name: mockUser.name,
                firstname: mockUser.firstname,
                email: mockUser.email,
                role: mockUser.role,
                creation_date: mockUser.creation_date,
            });
        });

        it('devrait renvoyer une erreur si l’utilisateur n’existe pas', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            await expect(service.findOne('2')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('devrait mettre à jour un utilisateur', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 1 } as any);  // UpdateResult

            const updateUserDto: UpdateUserDto = {
                name: 'Updated Doe',
                firstname: 'Updated John',
                email: 'updated.john.doe@example.com',
                role: Role.PARTICIPANT,
            };

            await expect(service.update('1', updateUserDto)).resolves.toBeUndefined();
        });

        it('devrait renvoyer une erreur si l’utilisateur n’existe pas', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            const updateUserDto: UpdateUserDto = {
                name: 'Updated Doe',
                firstname: 'Updated John',
                email: 'updated.john.doe@example.com',
                role: Role.PARTICIPANT,
            };

            await expect(service.update('1', updateUserDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updatePassword', () => {
        it('devrait mettre à jour le mot de passe', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'hash').mockImplementationOnce(async () => 'newhashedpassword');
            jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 1 } as any);  // UpdateResult

            await expect(service.updatePassword('1', 'newpassword')).resolves.toBeUndefined();
        });

        it('devrait renvoyer une erreur si l’utilisateur n’existe pas', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            await expect(service.updatePassword('1', 'newpassword')).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('devrait supprimer un utilisateur', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(userRepository, 'delete').mockResolvedValue({ affected: 1 } as any);  // DeleteResult

            await expect(service.remove('1')).resolves.toBeUndefined();
        });

        it('devrait renvoyer une erreur si l’utilisateur n’existe pas', async () => {
            jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

            await expect(service.remove('1')).rejects.toThrow(NotFoundException);
        });
    });
});
