import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import type { AuthenticatedUser } from '../../auth/decorators/current-user.decorator';
import {
  completedTaskResponseMock,
  createTaskDtoMock,
  removeTaskResponseMock,
  taskListResponseMock,
  taskResponseMock,
  taskResponseWithStatusMock,
  updatedTaskResponseMock,
  updateTaskDtoMock,
  userIdMock,
} from '../__mocks__/task.mock';
import { TasksController } from '../tasks.controller';
import { TasksService } from '../tasks.service';

const currentUserMock: AuthenticatedUser = {
  id: userIdMock,
  email: 'john@example.com',
};

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    updateStatus: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    tasksService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: tasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('controller', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      // Arrange
      jest.spyOn(tasksService, 'create').mockResolvedValue(taskResponseMock);

      // Act
      const result = await controller.create(
        currentUserMock,
        createTaskDtoMock,
      );

      // Assert
      expect(tasksService.create).toHaveBeenCalledWith(
        currentUserMock.id,
        createTaskDtoMock,
      );
      expect(tasksService.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(taskResponseMock);
    });

    it('should throw ConflictException when task title already exists', async () => {
      // Arrange
      jest
        .spyOn(tasksService, 'create')
        .mockRejectedValue(new ConflictException('Task title already exists'));

      // Act
      const promise = controller.create(currentUserMock, createTaskDtoMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new ConflictException('Task title already exists'),
      );
      expect(tasksService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return a list of tasks', async () => {
      // Arrange
      jest
        .spyOn(tasksService, 'findAll')
        .mockResolvedValue(taskListResponseMock);

      // Act
      const result = await controller.findAll(currentUserMock);

      // Assert
      expect(tasksService.findAll).toHaveBeenCalledWith(currentUserMock.id);
      expect(tasksService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(taskListResponseMock);
    });
  });

  describe('findById', () => {
    it('should return a task by id', async () => {
      // Arrange
      jest.spyOn(tasksService, 'findById').mockResolvedValue(taskResponseMock);

      // Act
      const result = await controller.findById(
        currentUserMock,
        taskResponseMock.id,
      );

      // Assert
      expect(tasksService.findById).toHaveBeenCalledWith(
        taskResponseMock.id,
        currentUserMock.id,
      );
      expect(result).toEqual(taskResponseMock);
    });

    it('should throw NotFoundException when task id does not exist', async () => {
      // Arrange
      jest
        .spyOn(tasksService, 'findById')
        .mockRejectedValue(new NotFoundException('Task not found'));

      // Act
      const promise = controller.findById(currentUserMock, 'non-existing-id');

      // Assert
      await expect(promise).rejects.toThrow(
        new NotFoundException('Task not found'),
      );
      expect(tasksService.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a task successfully', async () => {
      // Arrange
      jest
        .spyOn(tasksService, 'update')
        .mockResolvedValue(updatedTaskResponseMock);

      // Act
      const result = await controller.update(
        currentUserMock,
        taskResponseMock.id,
        updateTaskDtoMock,
      );

      // Assert
      expect(tasksService.update).toHaveBeenCalledWith(
        taskResponseMock.id,
        currentUserMock.id,
        updateTaskDtoMock,
      );
      expect(result).toEqual(updatedTaskResponseMock);
    });
  });

  describe('update status', () => {
    it('should update the task status successfully', async () => {
      // Arrange
      jest
        .spyOn(tasksService, 'updateStatus')
        .mockResolvedValue(taskResponseWithStatusMock);

      // Act
      const result = await controller.updateStatus(
        currentUserMock,
        taskResponseMock.id,
      );

      // Assert
      expect(tasksService.updateStatus).toHaveBeenCalledWith(
        taskResponseMock.id,
        currentUserMock.id,
      );
      expect(result).toEqual(taskResponseWithStatusMock);
    });
  });

  describe('remove', () => {
    it('should delete a task successfully and return a message', async () => {
      // Arrange
      jest
        .spyOn(tasksService, 'remove')
        .mockResolvedValue(removeTaskResponseMock);

      // Act
      const result = await controller.remove(
        currentUserMock,
        taskResponseMock.id,
      );

      // Assert
      expect(tasksService.remove).toHaveBeenCalledWith(
        taskResponseMock.id,
        currentUserMock.id,
      );
      expect(tasksService.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual(removeTaskResponseMock);
    });

    it('should throw BadRequestException when task status is COMPLETED', async () => {
      // Arrange
      jest
        .spyOn(tasksService, 'remove')
        .mockRejectedValue(
          new BadRequestException('Completed tasks cannot be deleted'),
        );

      // Act
      const promise = controller.remove(
        currentUserMock,
        completedTaskResponseMock.id,
      );

      // Assert
      await expect(promise).rejects.toThrow(
        new BadRequestException('Completed tasks cannot be deleted'),
      );
      expect(tasksService.remove).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when task does not exist', async () => {
      // Arrange
      jest
        .spyOn(tasksService, 'remove')
        .mockRejectedValue(new NotFoundException('Task not found'));

      // Act
      const promise = controller.remove(currentUserMock, 'non-existing-id');

      // Assert
      await expect(promise).rejects.toThrow(
        new NotFoundException('Task not found'),
      );
      expect(tasksService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
