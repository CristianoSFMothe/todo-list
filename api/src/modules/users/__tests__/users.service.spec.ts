import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/database/prisma/prisma.service';

import {
  createUserDtoMock,
  prismaUserMock,
  userResponseListMock,
  userResponseMock,
} from '../__mocks__/user.mock';
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

  describe('Service', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
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

  describe('findAll', () => {
    it('should return a list of users', async () => {
      // Arrange
      jest
        .spyOn(prismaUserMock, 'findMany')
        .mockResolvedValue(userResponseListMock);

      // Act
      const result = await service.findAll();

      // Assert
      expect(prismaUserMock.findMany).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(3);
      expect(result).toEqual(userResponseListMock);
    });

    it('should return an empty list when there are no users', async () => {
      // Arrange
      jest.spyOn(prismaUserMock, 'findMany').mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(prismaUserMock.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a user when id exists', async () => {
      // Arrange
      jest
        .spyOn(prismaUserMock, 'findUnique')
        .mockResolvedValue(userResponseMock);

      // Act
      const result = await service.findById(userResponseMock.id);

      // Assert
      expect(prismaUserMock.findUnique).toHaveBeenCalledWith({
        where: { id: userResponseMock.id },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
      expect(result).toEqual(userResponseMock);
    });

    it('should throw NotFoundException when id does not exist', async () => {
      // Arrange
      jest.spyOn(prismaUserMock, 'findUnique').mockResolvedValue(null);

      // Act
      const promise = service.findById('non-existing-id');

      // Assert
      await expect(promise).rejects.toThrow(
        new NotFoundException('User not found'),
      );
      expect(prismaUserMock.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should not return password in the response', async () => {
      // Arrange
      jest
        .spyOn(prismaUserMock, 'findUnique')
        .mockResolvedValue(userResponseMock);

      // Act
      const result = await service.findById(userResponseMock.id);

      // Assert
      expect(result).not.toHaveProperty('password');
    });
  });
});
