import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import {
  authResponseMock,
  authServiceMock,
  loginDtoMock,
} from '../__mocks__/auth.mock';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('login', () => {
    it('should authenticate a user successfully', async () => {
      // Arrange
      jest.spyOn(authServiceMock, 'login').mockResolvedValue(authResponseMock);

      // Act
      const result = await controller.login(loginDtoMock);

      // Assert
      expect(authServiceMock.login).toHaveBeenCalledWith(loginDtoMock);
      expect(authServiceMock.login).toHaveBeenCalledTimes(1);
      expect(result).toEqual(authResponseMock);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      // Arrange
      jest
        .spyOn(authServiceMock, 'login')
        .mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      // Act
      const promise = controller.login(loginDtoMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(authServiceMock.login).toHaveBeenCalledTimes(1);
    });
  });
});
