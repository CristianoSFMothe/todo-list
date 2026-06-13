import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { createPrismaServiceMock } from '@/database/prisma/__mocks__/prisma.service.mock';
import { PrismaService } from '@/database/prisma/prisma.service';
import { UsersService } from '@/modules/users/users.service';

import {
  createTaskDtoMock,
  createTaskWithStatusDtoMock,
  prismaTaskMock,
  taskMock,
  taskResponseMock,
  taskResponseWithStatusMock,
  taskUserMock,
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
});
