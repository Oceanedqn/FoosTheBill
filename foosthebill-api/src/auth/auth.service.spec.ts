import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // Mock des services
  const mockUsersService = {
    findUserByEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authenticate', () => {
    it('should throw UnauthorizedException if user is not found', async () => {
      // Simuler que l'utilisateur n'est pas trouvé
      mockUsersService.findUserByEmail.mockResolvedValue(null);

      await expect(service.authenticate({ email: 'test@test.com', password: 'password' }))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should return accessToken and user info if authentication is successful', async () => {
      const mockUser = { id: '1', email: 'test@test.com', password: 'hashedpassword' };
      const mockToken = 'mockToken';

      // Simuler un utilisateur trouvé et la comparaison du mot de passe
      mockUsersService.findUserByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(async () => true);
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.authenticate({ email: 'test@test.com', password: 'password' });

      expect(result.accessToken).toBe(mockToken);
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });
  });

  describe('validateUser', () => {
    it('should return user data if email and password are correct', async () => {
      const mockUser = { id: '1', email: 'test@test.com', password: 'hashedpassword' };

      // Simuler un utilisateur trouvé et une correspondance du mot de passe
      mockUsersService.findUserByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(async () => true);

      const result = await service.validateUser({ email: 'test@test.com', password: 'password' });

      expect(result).toEqual({ id: '1', email: 'test@test.com' });
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockUser = { id: '1', email: 'test@test.com', password: 'hashedpassword' };

      // Simuler un utilisateur trouvé mais mot de passe incorrect
      mockUsersService.findUserByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(async () => false);  // Retourne false pour simuler un mot de passe incorrect

      await expect(service.validateUser({ email: 'test@test.com', password: 'wrongpassword' }))
        .rejects
        .toThrow(UnauthorizedException);  // Vérifie que l'exception UnauthorizedException est lancée
    });

    it('should return null if email is not found', async () => {
      // Simuler qu'aucun utilisateur n'est trouvé
      mockUsersService.findUserByEmail.mockResolvedValue(null);

      const result = await service.validateUser({ email: 'test@test.com', password: 'password' });

      expect(result).toBeNull();
    });
  });

  describe('signIn', () => {
    it('should return accessToken and user info on successful signIn', async () => {
      const mockUser = { id: '1', email: 'test@test.com' };
      const mockToken = 'mockToken';
      const tokenPayload = { email: mockUser.email, sub: mockUser.id };

      // Simuler la génération d'un token
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.signIn(mockUser);

      expect(result.accessToken).toBe(mockToken);
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });
  });
});
