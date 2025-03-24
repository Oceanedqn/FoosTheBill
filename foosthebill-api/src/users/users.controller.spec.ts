import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ICreateUser, IUpdateUser } from './dto/user.dto';
import { Role } from './user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;

    // Mocking du service UsersService et JwtService
    const mockUsersService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        updatePassword: jest.fn(),
        remove: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn().mockReturnValue('fake-token'),
        verify: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                JwtModule.register({
                    secret: 'secretKey',  // ou ta clé secrète
                    signOptions: { expiresIn: '1d' },
                }),
            ],
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);
    });

    describe('create', () => {
        it('should create a new user successfully', async () => {
            const createUserDto: ICreateUser = {
                email: 'test@test.com', name: 'John Doe', password: 'password123',
                firstname: '',
                role: Role.ADMIN,
                creation_date: new Date()
            };
            const createdUser = { id: '1', ...createUserDto };

            mockUsersService.create.mockResolvedValue(createdUser);

            const result = await controller.create(createUserDto);

            expect(result.statusCode).toBe(201);
            expect(result.message).toBe('User created successfully');
            expect(result.data).toEqual(createdUser);
        });

        it('should throw ConflictException if email already exists', async () => {
            const createUserDto: ICreateUser = {
                email: 'test@test.com', name: 'John Doe', password: 'password123',
                firstname: '',
                role: Role.ADMIN,
                creation_date: new Date()
            };

            mockUsersService.create.mockRejectedValue(new ConflictException('User with this email already exists'));

            try {
                await controller.create(createUserDto);
            } catch (e) {
                expect(e.response.statusCode).toBe(409);
                expect(e.response.message).toBe('User with this email already exists');
            }
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            const users = [
                { id: '1', email: 'test@test.com', name: 'John Doe' },
                { id: '2', email: 'test2@test.com', name: 'Jane Doe' },
            ];

            mockUsersService.findAll.mockResolvedValue(users);

            const result = await controller.findAll();

            expect(result.statusCode).toBe(200);
            expect(result.message).toBe('Users retrieved successfully');
            expect(result.data).toEqual(users);
        });
    });

    describe('findOne', () => {
        it('should return a single user', async () => {
            const user = { id: '1', email: 'test@test.com', name: 'John Doe' };

            mockUsersService.findOne.mockResolvedValue(user);

            const result = await controller.findOne('1');

            expect(result.statusCode).toBe(200);
            expect(result.message).toBe('User retrieved successfully');
            expect(result.data).toEqual(user);
        });

        it('should throw NotFoundException if user does not exist', async () => {
            mockUsersService.findOne.mockResolvedValue(null);

            try {
                await controller.findOne('999');
            } catch (e) {
                expect(e.response.statusCode).toBe(404);
                expect(e.response.message).toBe('Error retrieving user');
            }
        });
    });

    describe('update', () => {
        it('should update user information', async () => {
            const updateUserDto: IUpdateUser = { name: 'John Updated' };
            const updatedUser = { id: '1', email: 'test@test.com', name: 'John Updated' };

            mockUsersService.findOne.mockResolvedValue(updatedUser);
            mockUsersService.update.mockResolvedValue(updatedUser);

            const result = await controller.update('1', updateUserDto);

            expect(result.statusCode).toBe(200);
            expect(result.message).toBe('User updated successfully');
        });

        it('should throw NotFoundException if user does not exist', async () => {
            const updateUserDto: IUpdateUser = { name: 'John Updated' };

            mockUsersService.findOne.mockResolvedValue(null);

            try {
                await controller.update('999', updateUserDto);
            } catch (e) {
                expect(e.response.statusCode).toBe(404);
                expect(e.response.message).toBe('Error updating user');
            }
        });
    });

    describe('updatePassword', () => {
        it('should update user password', async () => {
            const newPassword = 'newPassword123';

            mockUsersService.findOne.mockResolvedValue({ id: '1', email: 'test@test.com' });
            mockUsersService.updatePassword.mockResolvedValue(null);

            const result = await controller.updatePassword('1', newPassword);

            expect(result.statusCode).toBe(200);
            expect(result.message).toBe('Password updated successfully');
        });

        it('should throw NotFoundException if user does not exist', async () => {
            const newPassword = 'newPassword123';

            mockUsersService.findOne.mockResolvedValue(null);

            try {
                await controller.updatePassword('999', newPassword);
            } catch (e) {
                expect(e.response.statusCode).toBe(404);
                expect(e.response.message).toBe('Error updating password');
            }
        });
    });

    describe('remove', () => {
        it('should delete a user', async () => {
            mockUsersService.remove.mockResolvedValue(null);

            const result = await controller.remove('1');

            expect(result.statusCode).toBe(200);
            expect(result.message).toBe('User deleted successfully');
        });

        it('should throw NotFoundException if user does not exist', async () => {
            mockUsersService.remove.mockRejectedValue(new NotFoundException('Error deleting user'));

            try {
                await controller.remove('999');
            } catch (e) {
                expect(e.response.statusCode).toBe(404);
                expect(e.response.message).toBe('Error deleting user');
            }
        });
    });
});
