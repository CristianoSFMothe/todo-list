import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import {
  createUserDtoMock,
  updateUserDtoMock,
  userFindByIdResponseMock,
  userResponseListMock,
  userResponseMock,
  usersServiceMock,
} from '../__mocks__/user.mock';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      // Arrange
      jest
        .spyOn(usersServiceMock, 'create')
        .mockResolvedValue(userResponseMock);

      // Act
      const result = await controller.create(createUserDtoMock);

      // Assert
      expect(usersServiceMock.create).toHaveBeenCalledWith(createUserDtoMock);
      expect(usersServiceMock.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(userResponseMock);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      jest
        .spyOn(usersServiceMock, 'create')
        .mockRejectedValue(new ConflictException('Email already exists'));

      // Act
      const promise = controller.create(createUserDtoMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new ConflictException('Email already exists'),
      );
      expect(usersServiceMock.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      // Arrange
      jest
        .spyOn(usersServiceMock, 'findAll')
        .mockResolvedValue(userResponseListMock);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(usersServiceMock.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(3);
      expect(result).toEqual(userResponseListMock);
    });

    it('should return an empty list when there are no users', async () => {
      // Arrange
      jest.spyOn(usersServiceMock, 'findAll').mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(usersServiceMock.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a user when id exists', async () => {
      // Arrange
      jest
        .spyOn(usersServiceMock, 'findById')
        .mockResolvedValue(userFindByIdResponseMock);

      // Act
      const result = await controller.findById(userFindByIdResponseMock.id);

      // Assert
      expect(usersServiceMock.findById).toHaveBeenCalledWith(
        userFindByIdResponseMock.id,
      );
      expect(usersServiceMock.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(userFindByIdResponseMock);
    });

    it('should throw NotFoundException when id does not exist', async () => {
      // Arrange
      jest
        .spyOn(usersServiceMock, 'findById')
        .mockRejectedValue(new NotFoundException('User not found'));

      // Act
      const promise = controller.findById('non-existing-id');

      // Assert
      await expect(promise).rejects.toThrow(
        new NotFoundException('User not found'),
      );
      expect(usersServiceMock.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      // Arrange
      jest
        .spyOn(usersServiceMock, 'update')
        .mockResolvedValue(userResponseMock);

      // Act
      const result = await controller.update(
        userResponseMock.id,
        updateUserDtoMock,
      );

      // Assert
      expect(usersServiceMock.update).toHaveBeenCalledWith(
        userResponseMock.id,
        updateUserDtoMock,
      );
      expect(usersServiceMock.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(userResponseMock);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      jest
        .spyOn(usersServiceMock, 'update')
        .mockRejectedValue(new NotFoundException('User not found'));

      // Act
      const promise = controller.update('non-existing-id', updateUserDtoMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new NotFoundException('User not found'),
      );
      expect(usersServiceMock.update).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when passwords are invalid', async () => {
      // Arrange
      jest
        .spyOn(usersServiceMock, 'update')
        .mockRejectedValue(
          new BadRequestException(
            'Both currentPassword and newPassword are required to update password',
          ),
        );

      // Act
      const promise = controller.update(userResponseMock.id, {
        currentPassword: 'password123',
      });

      // Assert
      await expect(promise).rejects.toThrow(
        new BadRequestException(
          'Both currentPassword and newPassword are required to update password',
        ),
      );
      expect(usersServiceMock.update).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when current password is incorrect', async () => {
      // Arrange
      jest
        .spyOn(usersServiceMock, 'update')
        .mockRejectedValue(
          new BadRequestException('Current password is incorrect'),
        );

      // Act
      const promise = controller.update(userResponseMock.id, updateUserDtoMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new BadRequestException('Current password is incorrect'),
      );
      expect(usersServiceMock.update).toHaveBeenCalledTimes(1);
    });
  });
});
