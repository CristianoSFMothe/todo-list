import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { createTaskDtoMock, taskResponseMock } from '../__mocks__/task.mock';
import { TasksController } from '../tasks.controller';
import { TasksService } from '../tasks.service';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: { create: jest.Mock };

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a task successfully', async () => {
    // Arrange
    jest.spyOn(tasksService, 'create').mockResolvedValue(taskResponseMock);

    // Act
    const result = await controller.create(createTaskDtoMock);

    // Assert
    expect(tasksService.create).toHaveBeenCalledWith(createTaskDtoMock);
    expect(tasksService.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(taskResponseMock);
  });

  it('should throw ConflictException when task title already exists', async () => {
    // Arrange
    jest
      .spyOn(tasksService, 'create')
      .mockRejectedValue(new ConflictException('Task title already exists'));

    // Act
    const promise = controller.create(createTaskDtoMock);

    // Assert
    await expect(promise).rejects.toThrow(
      new ConflictException('Task title already exists'),
    );
    expect(tasksService.create).toHaveBeenCalledTimes(1);
  });
});
