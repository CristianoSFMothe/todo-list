import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from '@/modules/users/users.service';
import { HashingService } from '@/shared/hashing/hashing.service';

import {
  authResponseMock,
  hashingServiceMock,
  jwtServiceMock,
  loginDtoMock,
  userMock,
  usersServiceMock,
} from '../__mocks__/auth.mock';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: HashingService,
          useValue: hashingServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('login', () => {
    it('should authenticate and return an access token with user data', async () => {
      // Arrange
      jest.spyOn(usersServiceMock, 'findByEmail').mockResolvedValue(userMock);
      hashingServiceMock.compare.mockResolvedValue(true);
      jest
        .spyOn(jwtServiceMock, 'signAsync')
        .mockResolvedValue(authResponseMock.accessToken);

      // Act
      const result = await service.login(loginDtoMock);

      // Assert
      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(
        loginDtoMock.email,
      );
      expect(hashingServiceMock.compare).toHaveBeenCalledWith(
        loginDtoMock.password,
        userMock.password,
      );
      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: userMock.id,
        email: userMock.email,
      });
      expect(result).toEqual(authResponseMock);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      // Arrange
      jest.spyOn(usersServiceMock, 'findByEmail').mockResolvedValue(null);

      // Act
      const promise = service.login(loginDtoMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(hashingServiceMock.compare).not.toHaveBeenCalled();
      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      // Arrange
      jest.spyOn(usersServiceMock, 'findByEmail').mockResolvedValue(userMock);
      hashingServiceMock.compare.mockResolvedValue(false);

      // Act
      const promise = service.login(loginDtoMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });

    it('should not return the password in the response', async () => {
      // Arrange
      jest.spyOn(usersServiceMock, 'findByEmail').mockResolvedValue(userMock);
      hashingServiceMock.compare.mockResolvedValue(true);
      jest
        .spyOn(jwtServiceMock, 'signAsync')
        .mockResolvedValue(authResponseMock.accessToken);

      // Act
      const result = await service.login(loginDtoMock);

      // Assert
      expect(result.user).not.toHaveProperty('password');
    });
  });
});
