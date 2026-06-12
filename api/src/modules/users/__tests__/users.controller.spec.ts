// src/modules/users/tests/users.controller.spec.ts
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import {
  createUserDtoMock,
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
        .mockResolvedValue(userResponseMock);

      // Act
      const result = await controller.findById(userResponseMock.id);

      // Assert
      expect(usersServiceMock.findById).toHaveBeenCalledWith(
        userResponseMock.id,
      );
      expect(usersServiceMock.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(userResponseMock);
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
});
