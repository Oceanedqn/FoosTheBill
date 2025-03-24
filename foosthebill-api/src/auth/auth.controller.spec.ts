import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // Mock services
  const mockAuthService = {
    authenticate: jest.fn(),
  };

  const mockUsersService = {
    findUserByEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AllExceptionsFilter, useValue: new AllExceptionsFilter() },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authenticate and return user data and accessToken', async () => {
      const mockInput = { email: 'test@test.com', password: 'password' };
      const mockAuthResult = { accessToken: 'mockToken', id: '1', email: 'test@test.com' };

      // Simulate the call to authenticate in AuthService.
      mockAuthService.authenticate.mockResolvedValue(mockAuthResult);

      const result = await controller.login(mockInput);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Connexion réussie',
        data: mockAuthResult,
      });
      expect(mockAuthService.authenticate).toHaveBeenCalledWith(mockInput);
    });

    it('should throw UnauthorizedException if authentication fails', async () => {
      const mockInput = { email: 'test@test.com', password: 'wrongpassword' };

      // Simulate an exception in authenticate.
      mockAuthService.authenticate.mockRejectedValue(new UnauthorizedException());

      await expect(controller.login(mockInput)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getUserInfo', () => {
    it('should return user information if authenticated', async () => {
      const mockRequest = { user: { id: '1', email: 'test@test.com' } };

      // Simule la récupération de l'utilisateur authentifié
      const result = await controller.getUserInfo(mockRequest);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Utilisateur récupéré avec succès',
        data: mockRequest.user,
      });
    });

    it('should throw UnauthorizedException if not authenticated', async () => {
      // Simule une requête sans utilisateur (non authentifiée)
      const mockRequest = {}; // Pas de user ici, ce qui simule un utilisateur non authentifié.

      // S'attendre à ce que l'exception soit levée
      await expect(controller.getUserInfo(mockRequest)).rejects.toThrow(UnauthorizedException);
      await expect(controller.getUserInfo(mockRequest)).rejects.toThrow('User not authenticated');
    });
  });

});
