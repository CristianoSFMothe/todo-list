import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskStatus } from 'generated/prisma/client';

import { createPrismaServiceMock } from '@/database/prisma/__mocks__/prisma.service.mock';
import { PrismaService } from '@/database/prisma/prisma.service';
import { UsersService } from '@/modules/users/users.service';

import {
  completedTaskResponseMock,
  createTaskDtoMock,
  createTaskWithStatusDtoMock,
  prismaTaskMock,
  taskListResponseMock,
  taskMock,
  taskResponseMock,
  taskResponseWithStatusMock,
  taskUserMock,
  updatedTaskResponseMock,
  updateTaskDtoMock,
  usersServiceTaskMock,
} from '../__mocks__/task.mock';
import { TasksService } from '../tasks.service';

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
        {
          provide: UsersService,
          useValue: usersServiceTaskMock,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      // Arrange
      jest
        .spyOn(usersServiceTaskMock, 'findById')
        .mockResolvedValue(taskUserMock);
      jest.spyOn(prismaTaskMock, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaTaskMock, 'create').mockResolvedValue(taskResponseMock);

      // Act
      const result = await service.create(createTaskDtoMock);

      // Assert
      expect(usersServiceTaskMock.findById).toHaveBeenCalledWith(
        createTaskDtoMock.userId,
      );
      expect(prismaTaskMock.findUnique).toHaveBeenCalledWith({
        where: { title: createTaskDtoMock.title },
      });
      expect(prismaTaskMock.create).toHaveBeenCalledWith({
        data: {
          title: createTaskDtoMock.title,
          description: createTaskDtoMock.description,
          status: createTaskDtoMock.status,
          userId: createTaskDtoMock.userId,
        },
        select: {
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
        },
      });
      expect(result).toEqual(taskResponseMock);
    });

    it('should create a task with status successfully', async () => {
      // Arrange
      jest
        .spyOn(usersServiceTaskMock, 'findById')
        .mockResolvedValue(taskUserMock);
      jest.spyOn(prismaTaskMock, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prismaTaskMock, 'create')
        .mockResolvedValue(taskResponseWithStatusMock);

      // Act
      const result = await service.create(createTaskWithStatusDtoMock);

      // Assert
      expect(prismaTaskMock.create).toHaveBeenCalledWith({
        data: {
          title: createTaskWithStatusDtoMock.title,
          description: createTaskWithStatusDtoMock.description,
          status: createTaskWithStatusDtoMock.status,
          userId: createTaskWithStatusDtoMock.userId,
        },
        select: {
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
        },
      });
      expect(result).toEqual(taskResponseWithStatusMock);
    });

    it('should throw ConflictException when task title already exists', async () => {
      // Arrange
      jest
        .spyOn(usersServiceTaskMock, 'findById')
        .mockResolvedValue(taskUserMock);
      jest.spyOn(prismaTaskMock, 'findUnique').mockResolvedValue(taskMock);

      // Act
      const promise = service.create(createTaskDtoMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new ConflictException('Task title already exists'),
      );
      expect(prismaTaskMock.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaTaskMock.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return a list of tasks with user', async () => {
      // Arrange
      jest
        .spyOn(prismaTaskMock, 'findMany')
        .mockResolvedValue(taskListResponseMock);

      // Act
      const result = await service.findAll();

      // Assert
      expect(prismaTaskMock.findMany).toHaveBeenCalledWith({
        select: {
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
        },
      });
      expect(result).toEqual(taskListResponseMock);
    });
  });

  describe('findById', () => {
    it('should return a task when id exists', async () => {
      // Arrange
      jest
        .spyOn(prismaTaskMock, 'findUnique')
        .mockResolvedValue(taskResponseMock);

      // Act
      const result = await service.findById(taskResponseMock.id);

      // Assert
      expect(prismaTaskMock.findUnique).toHaveBeenCalledWith({
        where: { id: taskResponseMock.id },
        select: {
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
        },
      });
      expect(result).toEqual(taskResponseMock);
    });

    it('should throw NotFoundException when id does not exist', async () => {
      // Arrange
      jest.spyOn(prismaTaskMock, 'findUnique').mockResolvedValue(null);

      // Act
      const promise = service.findById('non-existing-id');

      // Assert
      await expect(promise).rejects.toThrow(
        new NotFoundException('Task not found'),
      );
      expect(prismaTaskMock.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a task successfully', async () => {
      // Arrange
      jest
        .spyOn(prismaTaskMock, 'findUnique')
        .mockResolvedValueOnce(taskResponseMock)
        .mockResolvedValueOnce(null);
      jest
        .spyOn(prismaTaskMock, 'update')
        .mockResolvedValue(updatedTaskResponseMock);

      // Act
      const result = await service.update(
        taskResponseMock.id,
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
        select: {
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
        },
      });
      expect(result).toEqual(updatedTaskResponseMock);
    });

    it('should throw NotFoundException when task does not exist', async () => {
      // Arrange
      jest.spyOn(prismaTaskMock, 'findUnique').mockResolvedValue(null);

      // Act
      const promise = service.update('non-existing-id', updateTaskDtoMock);

      // Assert
      await expect(promise).rejects.toThrow(
        new NotFoundException('Task not found'),
      );
      expect(prismaTaskMock.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new title already exists', async () => {
      // Arrange
      jest
        .spyOn(prismaTaskMock, 'findUnique')
        .mockResolvedValueOnce(taskResponseMock)
        .mockResolvedValueOnce(taskMock);

      // Act
      const promise = service.update(taskResponseMock.id, updateTaskDtoMock);

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
        .spyOn(prismaTaskMock, 'findUnique')
        .mockResolvedValue(taskResponseMock);
      jest
        .spyOn(prismaTaskMock, 'update')
        .mockResolvedValue(taskResponseWithStatusMock);

      // Act
      const result = await service.updateStatus(taskResponseMock.id);

      // Assert
      expect(prismaTaskMock.update).toHaveBeenCalledWith({
        where: { id: taskResponseMock.id },
        data: {
          status: TaskStatus.IN_PROGRESS,
        },
        select: {
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
        },
      });
      expect(result).toEqual(taskResponseWithStatusMock);
    });

    it('should advance status from IN_PROGRESS to COMPLETED', async () => {
      // Arrange
      jest
        .spyOn(prismaTaskMock, 'findUnique')
        .mockResolvedValue(taskResponseWithStatusMock);
      jest
        .spyOn(prismaTaskMock, 'update')
        .mockResolvedValue(completedTaskResponseMock);

      // Act
      const result = await service.updateStatus(taskResponseMock.id);

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
        .spyOn(prismaTaskMock, 'findUnique')
        .mockResolvedValue(completedTaskResponseMock);

      // Act
      const promise = service.updateStatus(taskResponseMock.id);

      // Assert
      await expect(promise).rejects.toThrow(
        new BadRequestException('Task is already completed'),
      );
      expect(prismaTaskMock.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when task does not exist', async () => {
      // Arrange
      jest.spyOn(prismaTaskMock, 'findUnique').mockResolvedValue(null);

      // Act
      const promise = service.updateStatus('non-existing-id');

      // Assert
      await expect(promise).rejects.toThrow(
        new NotFoundException('Task not found'),
      );
      expect(prismaTaskMock.update).not.toHaveBeenCalled();
    });
  });
});
