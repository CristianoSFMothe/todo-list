import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/database/prisma/prisma.service';

import {
  createUserDtoMock,
  prismaUserMock,
  userResponseMock,
} from '../__mocks__/create-user.service.mock';
import { UsersService } from '../users.service';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  const prismaServiceMock = {
    user: prismaUserMock,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      // Arrange
      jest.spyOn(prismaUserMock, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaUserMock, 'create').mockResolvedValue(userResponseMock);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      // Act
      const result = await service.create(createUserDtoMock);

      // Assert
      expect(prismaUserMock.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDtoMock.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDtoMock.password, 10);
      expect(prismaUserMock.create).toHaveBeenCalledWith({
        data: {
          name: createUserDtoMock.name,
          email: createUserDtoMock.email,
          password: 'hashed_password',
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
      expect(result).toEqual(userResponseMock);
    });

    it('should throw ConflictException when email already exist', async () => {
      // Arrange
      jest
        .spyOn(prismaUserMock, 'findUnique')
        .mockResolvedValue(userResponseMock);

      // Act
      const promise = service.create(createUserDtoMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new ConflictException('Email already exists'),
      );
      expect(prismaUserMock.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaUserMock.create).not.toHaveBeenCalled();
    });

    it('should not return password in the response', async () => {
      // Arrange
      jest.spyOn(prismaUserMock, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaUserMock, 'create').mockResolvedValue(userResponseMock);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password' as never);

      // Act
      const result = await service.create(createUserDtoMock);

      // Assert
      expect(result).not.toHaveProperty('password');
    });
  });
});
