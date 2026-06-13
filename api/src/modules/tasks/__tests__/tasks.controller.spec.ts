import { Test, TestingModule } from '@nestjs/testing';

import { CreateTaskDto } from '../dto/create-task.dto';
import { TasksController } from '../tasks.controller';
import { TasksService } from '../tasks.service';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: { create: jest.Mock };

  const dto: CreateTaskDto = {
    title: 'First task',
    description: 'Task description',
    userId: '550e8400-e29b-41d4-a716-446655440000',
  };

  beforeEach(async () => {
    tasksService = {
      create: jest.fn(),
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates task creation to the service', async () => {
    tasksService.create.mockResolvedValue({
      id: 'task-id',
      title: dto.title,
      description: dto.description,
      status: 'PENDING',
      userId: dto.userId,
    });

    const result = await controller.create(dto);

    expect(tasksService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      id: 'task-id',
      title: dto.title,
      description: dto.description,
      status: 'PENDING',
      userId: dto.userId,
    });
  });
});
