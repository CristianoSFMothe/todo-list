import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskStatus } from 'generated/prisma/client';

import { createPrismaServiceMock } from '@/database/prisma/__mocks__/prisma.service.mock';
import { PrismaService } from '@/database/prisma/prisma.service';

import {
  completedTaskResponseMock,
  createTaskDtoMock,
  createTaskWithStatusDtoMock,
  prismaTaskMock,
  removeTaskResponseMock,
  taskListResponseMock,
  taskMock,
  taskResponseMock,
  taskResponseWithStatusMock,
  updatedTaskResponseMock,
  updateTaskDtoMock,
  userIdMock,
} from '../__mocks__/task.mock';
import { TasksService } from '../tasks.service';

const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  userId: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

describe('TasksService', () => {
  let service: TasksService;
  let prismaServiceMock: ReturnType<typeof createPrismaServiceMock>;

  beforeEach(async () => {
    prismaServiceMock = {
      ...createPrismaServiceMock(),
      task: prismaTaskMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  describe('service', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      // Arrange
      jest.spyOn(prismaTaskMock, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prismaTaskMock, 'create').mockResolvedValue(taskResponseMock);

      // Act
      const result = await service.create(userIdMock, createTaskDtoMock);

      // Assert
      expect(prismaTaskMock.findFirst).toHaveBeenCalledWith({
        where: { userId: userIdMock, title: createTaskDtoMock.title },
      });
      expect(prismaTaskMock.create).toHaveBeenCalledWith({
        data: {
          title: createTaskDtoMock.title,
          description: createTaskDtoMock.description,
          status: createTaskDtoMock.status,
          userId: userIdMock,
        },
        select: taskSelect,
      });
      expect(result).toEqual(taskResponseMock);
    });

    it('should create a task with status successfully', async () => {
      // Arrange
      jest.spyOn(prismaTaskMock, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prismaTaskMock, 'create')
        .mockResolvedValue(taskResponseWithStatusMock);

      // Act
      const result = await service.create(
        userIdMock,
        createTaskWithStatusDtoMock,
      );

      // Assert
      expect(prismaTaskMock.create).toHaveBeenCalledWith({
        data: {
          title: createTaskWithStatusDtoMock.title,
          description: createTaskWithStatusDtoMock.description,
          status: createTaskWithStatusDtoMock.status,
          userId: userIdMock,
        },
        select: taskSelect,
      });
      expect(result).toEqual(taskResponseWithStatusMock);
    });

    it('should throw ConflictException when task title already exists', async () => {
      // Arrange
      jest.spyOn(prismaTaskMock, 'findFirst').mockResolvedValue(taskMock);

      // Act
      const promise = service.create(userIdMock, createTaskDtoMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new ConflictException('Task title already exists'),
      );
      expect(prismaTaskMock.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaTaskMock.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return a list of tasks scoped to the user', async () => {
      // Arrange
      jest
        .spyOn(prismaTaskMock, 'findMany')
        .mockResolvedValue(taskListResponseMock);

      // Act
      const result = await service.findAll(userIdMock);

      // Assert
      expect(prismaTaskMock.findMany).toHaveBeenCalledWith({
        where: { userId: userIdMock },
        select: taskSelect,
      });
      expect(result).toEqual(taskListResponseMock);
    });
  });

  describe('findById', () => {
    it('should return a task when it belongs to the user', async () => {
      // Arrange
      jest
        .spyOn(prismaTaskMock, 'findFirst')
        .mockResolvedValue(taskResponseMock);

      // Act
      const result = await service.findById(taskResponseMock.id, userIdMock);

      // Assert
      expect(prismaTaskMock.findFirst).toHaveBeenCalledWith({
        where: { id: taskResponseMock.id, userId: userIdMock },
        select: taskSelect,
      });
      expect(result).toEqual(taskResponseMock);
    });

    it('should throw NotFoundException when task does not exist or is not owned', async () => {
      // Arrange
      jest.spyOn(prismaTaskMock, 'findFirst').mockResolvedValue(null);

      // Act
      const promise = service.findById('non-existing-id', userIdMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new NotFoundException('Task not found'),
      );
      expect(prismaTaskMock.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a task successfully', async () => {
      // Arrange
      jest
        .spyOn(prismaTaskMock, 'findFirst')
        .mockResolvedValueOnce(taskResponseMock)
        .mockResolvedValueOnce(null);
      jest
        .spyOn(prismaTaskMock, 'update')
        .mockResolvedValue(updatedTaskResponseMock);

      // Act
      const result = await service.update(
        taskResponseMock.id,
        userIdMock,
        updateTaskDtoMock,
      );

      // Assert
      expect(prismaTaskMock.update).toHaveBeenCalledWith({
        where: { id: taskResponseMock.id },
        data: {
          title: updateTaskDtoMock.title,
          description: updateTaskDtoMock.description,
          status: updateTaskDtoMock.status,
        },
        select: taskSelect,
      });
      expect(result).toEqual(updatedTaskResponseMock);
    });

    it('should throw NotFoundException when task does not exist or is not owned', async () => {
      // Arrange
      jest.spyOn(prismaTaskMock, 'findFirst').mockResolvedValue(null);

      // Act
      const promise = service.update(
        'non-existing-id',
        userIdMock,
        updateTaskDtoMock,
      );

      // Assert
      await expect(promise).rejects.toThrow(
        new NotFoundException('Task not found'),
      );
      expect(prismaTaskMock.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new title already exists', async () => {
      // Arrange
      jest
        .spyOn(prismaTaskMock, 'findFirst')
        .mockResolvedValueOnce(taskResponseMock)
        .mockResolvedValueOnce(taskMock);

      // Act
      const promise = service.update(
        taskResponseMock.id,
        userIdMock,
        updateTaskDtoMock,
      );

      // Assert
      await expect(promise).rejects.toThrow(
        new ConflictException('Task title already exists'),
      );
      expect(prismaTaskMock.update).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should advance status from PENDING to IN_PROGRESS', async () => {
      // Arrange
      jest
        .spyOn(prismaTaskMock, 'findFirst')
        .mockResolvedValue(taskResponseMock);
      jest
        .spyOn(prismaTaskMock, 'update')
        .mockResolvedValue(taskResponseWithStatusMock);

      // Act
      const result = await service.updateStatus(
        taskResponseMock.id,
        userIdMock,
      );

      // Assert
      expect(prismaTaskMock.update).toHaveBeenCalledWith({
        where: { id: taskResponseMock.id },
        data: {
          status: TaskStatus.IN_PROGRESS,
        },
        select: taskSelect,
      });
      expect(result).toEqual(taskResponseWithStatusMock);
    });

    it('should advance status from IN_PROGRESS to COMPLETED', async () => {
      // Arrange
      jest
        .spyOn(prismaTaskMock, 'findFirst')
        .mockResolvedValue(taskResponseWithStatusMock);
      jest
        .spyOn(prismaTaskMock, 'update')
        .mockResolvedValue(completedTaskResponseMock);

      // Act
      const result = await service.updateStatus(
        taskResponseMock.id,
        userIdMock,
      );

      // Assert
      expect(prismaTaskMock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: TaskStatus.COMPLETED },
        }),
      );
      expect(result).toEqual(completedTaskResponseMock);
    });

    it('should throw BadRequestException when task is already completed', async () => {
      // Arrange
      jest
        .spyOn(prismaTaskMock, 'findFirst')
        .mockResolvedValue(completedTaskResponseMock);

      // Act
      const promise = service.updateStatus(taskResponseMock.id, userIdMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new BadRequestException('Task is already completed'),
      );
      expect(prismaTaskMock.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when task does not exist or is not owned', async () => {
      // Arrange
      jest.spyOn(prismaTaskMock, 'findFirst').mockResolvedValue(null);

      // Act
      const promise = service.updateStatus('non-existing-id', userIdMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new NotFoundException('Task not found'),
      );
      expect(prismaTaskMock.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a task successfully and return a message', async () => {
      // Arrange
      jest
        .spyOn(prismaTaskMock, 'findFirst')
        .mockResolvedValue(taskResponseMock);
      jest.spyOn(prismaTaskMock, 'delete').mockResolvedValue(taskMock);

      // Act
      const result = await service.remove(taskResponseMock.id, userIdMock);

      // Assert
      expect(prismaTaskMock.findFirst).toHaveBeenCalledWith({
        where: { id: taskResponseMock.id, userId: userIdMock },
        select: taskSelect,
      });
      expect(prismaTaskMock.delete).toHaveBeenCalledWith({
        where: { id: taskResponseMock.id },
      });
      expect(result).toEqual(removeTaskResponseMock);
    });

    it('should throw BadRequestException when task status is COMPLETED', async () => {
      // Arrange
      jest
        .spyOn(prismaTaskMock, 'findFirst')
        .mockResolvedValue(completedTaskResponseMock);

      // Act
      const promise = service.remove(completedTaskResponseMock.id, userIdMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new BadRequestException('Completed tasks cannot be deleted'),
      );
      expect(prismaTaskMock.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when task does not exist or is not owned', async () => {
      // Arrange
      jest.spyOn(prismaTaskMock, 'findFirst').mockResolvedValue(null);

      // Act
      const promise = service.remove('non-existing-id', userIdMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new NotFoundException('Task not found'),
      );
      expect(prismaTaskMock.delete).not.toHaveBeenCalled();
    });
  });
});
