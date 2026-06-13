import { Test, TestingModule } from '@nestjs/testing';

import { createPrismaServiceMock } from '@/database/prisma/__mocks__/prisma.service.mock';
import { PrismaService } from '@/database/prisma/prisma.service';
import { UsersService } from '@/modules/users/users.service';

import { CreateTaskDto } from '../dto/create-task.dto';
import { TasksService } from '../tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let prismaServiceMock: ReturnType<typeof createPrismaServiceMock>;
  let usersServiceMock: { findById: jest.Mock };

  const dto: CreateTaskDto = {
    title: 'First task',
    description: 'Task description',
    userId: '550e8400-e29b-41d4-a716-446655440000',
  };

  beforeEach(async () => {
    prismaServiceMock = createPrismaServiceMock();
    usersServiceMock = {
      findById: jest.fn(),
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
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a task when user exists and title is unique', async () => {
    usersServiceMock.findById.mockResolvedValue({
      id: dto.userId,
      name: 'John Doe',
      email: 'john@example.com',
    });
    prismaServiceMock.task.findUnique.mockResolvedValue(null);
    prismaServiceMock.task.create.mockResolvedValue({
      id: 'task-id',
      title: dto.title,
      description: dto.description,
      status: 'PENDING',
      userId: dto.userId,
    });

    const result = await service.create(dto);

    expect(usersServiceMock.findById).toHaveBeenCalledWith(dto.userId);
    expect(prismaServiceMock.task.findUnique).toHaveBeenCalledWith({
      where: {
        title: dto.title,
      },
    });
    expect(prismaServiceMock.task.create).toHaveBeenCalledWith({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        userId: dto.userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        userId: true,
      },
    });
    expect(result).toEqual({
      id: 'task-id',
      title: dto.title,
      description: dto.description,
      status: 'PENDING',
      userId: dto.userId,
    });
  });

  it('throws conflict when task title already exists', async () => {
    usersServiceMock.findById.mockResolvedValue({
      id: dto.userId,
      name: 'John Doe',
      email: 'john@example.com',
    });
    prismaServiceMock.task.findUnique.mockResolvedValue({
      id: 'task-id',
      title: dto.title,
      description: dto.description,
      status: 'PENDING',
      userId: dto.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(service.create(dto)).rejects.toThrow(
      'Task title already exists',
    );
    expect(prismaServiceMock.task.create).not.toHaveBeenCalled();
  });
});
