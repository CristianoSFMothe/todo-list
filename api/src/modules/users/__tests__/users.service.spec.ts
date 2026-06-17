import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/database/prisma/prisma.service';

import {
  createUserDtoMock,
  prismaUserMock,
  updateUserDtoMock,
  userFindByIdResponseMock,
  userMock,
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

  describe('findById', () => {
    it('should return a user when id exists', async () => {
      // Arrange
      jest
        .spyOn(prismaUserMock, 'findUnique')
        .mockResolvedValue(userFindByIdResponseMock);

      // Act
      const result = await service.findById(userFindByIdResponseMock.id);

      // Assert
      expect(prismaUserMock.findUnique).toHaveBeenCalledWith({
        where: { id: userFindByIdResponseMock.id },
        select: {
          id: true,
          name: true,
          email: true,
          tasks: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
            },
          },
        },
      });
      expect(result).toEqual(userFindByIdResponseMock);
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
        .mockResolvedValue(userFindByIdResponseMock);

      // Act
      const result = await service.findById(userFindByIdResponseMock.id);

      // Assert
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('tasks');
      expect(result.tasks).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update name only successfully', async () => {
      // Arrange
      jest.spyOn(prismaUserMock, 'findUnique').mockResolvedValue(userMock);
      jest.spyOn(prismaUserMock, 'update').mockResolvedValue({
        ...userResponseMock,
        name: 'John Doe Updated',
      });

      // Act
      const result = await service.update(userMock.id, {
        name: 'John Doe Updated',
      });

      // Assert
      expect(prismaUserMock.findUnique).toHaveBeenCalledWith({
        where: { id: userMock.id },
      });
      expect(prismaUserMock.update).toHaveBeenCalledWith({
        where: { id: userMock.id },
        data: {
          name: 'John Doe Updated',
          password: undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
      expect(result.name).toBe('John Doe Updated');
    });

    it('should update password successfully', async () => {
      // Arrange
      jest.spyOn(prismaUserMock, 'findUnique').mockResolvedValue(userMock);
      jest.spyOn(prismaUserMock, 'update').mockResolvedValue(userResponseMock);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');

      // Act
      const result = await service.update(userMock.id, updateUserDtoMock);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(
        updateUserDtoMock.currentPassword,
        userMock.password,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(
        updateUserDtoMock.newPassword,
        10,
      );
      expect(prismaUserMock.update).toHaveBeenCalledWith({
        where: { id: userMock.id },
        data: {
          name: updateUserDtoMock.name,
          password: 'new_hashed_password',
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
      expect(result).toEqual(userResponseMock);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      jest.spyOn(prismaUserMock, 'findUnique').mockResolvedValue(null);

      // Act
      const promise = service.update('non-existing-id', updateUserDtoMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new NotFoundException('User not found'),
      );
      expect(prismaUserMock.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when only currentPassword is provided', async () => {
      // Arrange
      jest.spyOn(prismaUserMock, 'findUnique').mockResolvedValue(userMock);

      // Act
      const promise = service.update(userMock.id, {
        currentPassword: 'password123',
      });

      // Assert
      await expect(promise).rejects.toThrow(
        new BadRequestException(
          'Both currentPassword and newPassword are required to update password',
        ),
      );
      expect(prismaUserMock.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when only newPassword is provided', async () => {
      // Arrange
      jest.spyOn(prismaUserMock, 'findUnique').mockResolvedValue(userMock);

      // Act
      const promise = service.update(userMock.id, {
        newPassword: 'newpassword123',
      });

      // Assert
      await expect(promise).rejects.toThrow(
        new BadRequestException(
          'Both currentPassword and newPassword are required to update password',
        ),
      );
      expect(prismaUserMock.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when current password is incorrect', async () => {
      // Arrange
      jest.spyOn(prismaUserMock, 'findUnique').mockResolvedValue(userMock);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const promise = service.update(userMock.id, updateUserDtoMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new BadRequestException('Current password is incorrect'),
      );
      expect(prismaUserMock.update).not.toHaveBeenCalled();
    });

    it('should not return password in the response', async () => {
      // Arrange
      jest.spyOn(prismaUserMock, 'findUnique').mockResolvedValue(userMock);
      jest.spyOn(prismaUserMock, 'update').mockResolvedValue(userResponseMock);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');

      // Act
      const result = await service.update(userMock.id, updateUserDtoMock);

      // Assert
      expect(result).not.toHaveProperty('password');
    });
  });
});
