import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './user.entity';
import { JwtService } from '@nestjs/jwt';

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;
    let jwtService: JwtService;

    const mockUserService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        updatePassword: jest.fn(),
        remove: jest.fn(),
    };

    const mockJwtService = {
        verifyAsync: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUserService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
    });

    describe('create', () => {
        it('devrait créer un utilisateur avec succès', async () => {
            const createUserDto: CreateUserDto = {
                name: 'Doe',
                firstname: 'John',
                email: 'john.doe@example.com',
                password: 'password123',
                role: Role.PARTICIPANT,
                creation_date: new Date(),
            };
            const result = {
                id: '1',
                ...createUserDto,
            };
            mockUserService.create.mockResolvedValue(result);

            const response = await controller.create(createUserDto);
            expect(response.statusCode).toBe(201);
            expect(response.message).toBe('Utilisateur créé avec succès');
            expect(response.data).toEqual(result);
        });

        it('devrait renvoyer une erreur si l’utilisateur existe déjà', async () => {
            const createUserDto: CreateUserDto = {
                name: 'Doe',
                firstname: 'John',
                email: 'john.doe@example.com',
                password: 'password123',
                role: Role.PARTICIPANT,
                creation_date: new Date(),
            };

            mockUserService.create.mockRejectedValue(new ConflictException('User with this email already exists'));

            try {
                await controller.create(createUserDto);
            } catch (error) {
                expect(error.response.statusCode).toBe(409);
                expect(error.response.message).toBe('User with this email already exists');
            }
        });
    });

    describe('findAll', () => {
        it('devrait retourner tous les utilisateurs', async () => {
            const result = [
                {
                    id: '1',
                    name: 'Doe',
                    firstname: 'John',
                    email: 'john.doe@example.com',
                    role: Role.PARTICIPANT,
                    creation_date: new Date(),
                },
            ];
            mockUserService.findAll.mockResolvedValue(result);

            mockJwtService.verifyAsync.mockResolvedValue({ sub: 'id' });

            const response = await controller.findAll();
            expect(response.statusCode).toBe(200);
            expect(response.message).toBe('Users retrieved successfully');
            expect(response.data).toEqual(result);
        });

        it('devrait échouer si le token est invalide', async () => {
            const result = [
                {
                    id: '1',
                    name: 'Doe',
                    firstname: 'John',
                    email: 'john.doe@example.com',
                    role: Role.PARTICIPANT,
                    creation_date: new Date(),
                },
            ];

            // Simulation d'un token invalide
            mockJwtService.verifyAsync.mockRejectedValue(new UnauthorizedException('Invalid token'));

            try {
                await controller.findAll();
            } catch (error) {
                expect(error.response.statusCode).toBe(401);
                expect(error.response.message).toBe('Unauthorized');
            }
        });
    });

    describe('findOne', () => {
        it('devrait renvoyer un utilisateur trouvé', async () => {
            const result = {
                id: '1',
                name: 'Doe',
                firstname: 'John',
                email: 'john.doe@example.com',
                role: Role.PARTICIPANT,
                creation_date: new Date(),
            };
            mockUserService.findOne.mockResolvedValue(result);

            mockJwtService.verifyAsync.mockResolvedValue({ sub: 'id' });

            const response = await controller.findOne('1');
            expect(response.statusCode).toBe(200);
            expect(response.message).toBe('User retrieved successfully');
            expect(response.data).toEqual(result);
        });

        it('devrait renvoyer une erreur si l’utilisateur n’est pas trouvé', async () => {
            mockUserService.findOne.mockResolvedValue(null);
            try {
                await controller.findOne('2');
            } catch (error) {
                expect(error.response.statusCode).toBe(404);
                expect(error.response.message).toBe("Erreur lors de la récupération de l'utilisateur");
            }
        });
    });

    describe('update', () => {
        it('devrait échouer si le token est invalide', async () => {
            const updateUserDto: UpdateUserDto = {
                name: 'Updated Doe',
                firstname: 'Updated John',
                email: 'updated.john.doe@example.com',
                role: Role.PARTICIPANT,
            };

            mockUserService.findOne.mockResolvedValue({ id: '1', name: 'Doe' });

            // Simulation d'un token invalide
            mockJwtService.verifyAsync.mockRejectedValue(new UnauthorizedException('Invalid token'));

            try {
                await controller.update('1', updateUserDto);
            } catch (error) {
                expect(error.response.statusCode).toBe(401);
                expect(error.response.message).toBe('Unauthorized');
            }
        });

        it('devrait mettre à jour un utilisateur avec succès', async () => {
            const updateUserDto: UpdateUserDto = {
                name: 'Updated Doe',
                firstname: 'Updated John',
                email: 'updated.john.doe@example.com',
                role: Role.PARTICIPANT,
            };

            const user = { id: '1', name: 'Doe', firstname: 'John', email: 'john.doe@example.com', role: Role.PARTICIPANT };
            mockUserService.findOne.mockResolvedValue(user);
            mockUserService.update.mockResolvedValue(undefined);

            mockJwtService.verifyAsync.mockResolvedValue({ sub: 'id' });

            const response = await controller.update('1', updateUserDto);
            expect(response.statusCode).toBe(200);
            expect(response.message).toBe('User updated successfully');
        });

        it('devrait renvoyer une erreur si l’utilisateur n’est pas trouvé', async () => {
            const updateUserDto: UpdateUserDto = {
                name: 'Updated Doe',
                firstname: 'Updated John',
                email: 'updated.john.doe@example.com',
                role: Role.PARTICIPANT,
            };

            mockUserService.findOne.mockResolvedValue(null);
            mockUserService.update.mockRejectedValue(new NotFoundException('User not found'));

            mockJwtService.verifyAsync.mockResolvedValue({ sub: 'id' });

            try {
                await controller.update('1', updateUserDto);
            } catch (error) {
                expect(error.response.statusCode).toBe(404);
                expect(error.response.message).toBe('Erreur lors de la mise à jour de l\'utilisateur');
            }
        });
    });

    describe('updatePassword', () => {
        it('devrait échouer si le token est invalide', async () => {
            mockUserService.findOne.mockResolvedValue({ id: '1', name: 'Doe' });

            // Simulation d'un token invalide
            mockJwtService.verifyAsync.mockRejectedValue(new UnauthorizedException('Invalid token'));

            try {
                await controller.updatePassword('1', 'newpassword');
            } catch (error) {
                expect(error.response.statusCode).toBe(401);
                expect(error.response.message).toBe('Unauthorized');
            }
        });

        it('devrait mettre à jour le mot de passe avec succès', async () => {

            const user = { id: '1', name: 'Doe', email: 'john.doe@example.com' };
            mockUserService.findOne.mockResolvedValue(user);
            mockUserService.updatePassword.mockResolvedValue(undefined);

            mockJwtService.verifyAsync.mockResolvedValue({ sub: 'id' });

            const response = await controller.updatePassword('1', 'newpassword');
            expect(response.statusCode).toBe(200);
            expect(response.message).toBe('Password updated successfully');
        });

        it('devrait renvoyer une erreur si l’utilisateur n’est pas trouvé', async () => {

            mockUserService.findOne.mockResolvedValue(null);
            mockUserService.updatePassword.mockRejectedValue(new NotFoundException('User not found'));

            mockJwtService.verifyAsync.mockResolvedValue({ sub: 'id' });

            try {
                await controller.updatePassword('1', 'newpassword');
            } catch (error) {
                expect(error.response.statusCode).toBe(404);
                expect(error.response.message).toBe('Erreur lors de la mise à jour du mot de passe');
            }
        });
    });

    describe('remove', () => {
        it('devrait échouer si le token est invalide', async () => {
            // Simulate an invalid token
            mockJwtService.verifyAsync.mockRejectedValue(new UnauthorizedException('Invalid token'));

            try {
                await controller.remove('1');
            } catch (error) {
                expect(error.response.statusCode).toBe(401);
                expect(error.response.message).toBe('Unauthorized');
            }
        });

        it('devrait supprimer un utilisateur avec succès', async () => {
            mockUserService.remove.mockResolvedValue(undefined);

            mockJwtService.verifyAsync.mockResolvedValue({ sub: 'id' });

            const response = await controller.remove('1');

            expect(response.statusCode).toBe(200);
            expect(response.message).toBe('User deleted successfully');
        });

        it('devrait renvoyer une erreur si l’utilisateur n’est pas trouvé', async () => {
            mockUserService.remove.mockRejectedValue(new NotFoundException('User not found'));

            mockJwtService.verifyAsync.mockResolvedValue({ sub: 'id' });

            try {
                await controller.remove('1');
            } catch (error) {
                expect(error.response.statusCode).toBe(404);
                expect(error.response.message).toBe('Erreur lors de la suppression de l\'utilisateur');
            }
        });


    });
});
