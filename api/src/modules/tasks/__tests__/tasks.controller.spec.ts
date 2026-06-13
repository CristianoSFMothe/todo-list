import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import {
  createTaskDtoMock,
  taskListResponseMock,
  taskResponseMock,
  taskResponseWithStatusMock,
  updatedTaskResponseMock,
  updateTaskDtoMock,
} from '../__mocks__/task.mock';
import { TasksController } from '../tasks.controller';
import { TasksService } from '../tasks.service';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    updateStatus: jest.Mock;
  };

  beforeEach(async () => {
    tasksService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
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

  it('should return a list of tasks', async () => {
    // Arrange
    jest.spyOn(tasksService, 'findAll').mockResolvedValue(taskListResponseMock);

    // Act
    const result = await controller.findAll();

    // Assert
    expect(tasksService.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(taskListResponseMock);
  });

  it('should return a task by id', async () => {
    // Arrange
    jest.spyOn(tasksService, 'findById').mockResolvedValue(taskResponseMock);

    // Act
    const result = await controller.findById(taskResponseMock.id);

    // Assert
    expect(tasksService.findById).toHaveBeenCalledWith(taskResponseMock.id);
    expect(result).toEqual(taskResponseMock);
  });

  it('should throw NotFoundException when task id does not exist', async () => {
    // Arrange
    jest
      .spyOn(tasksService, 'findById')
      .mockRejectedValue(new NotFoundException('Task not found'));

    // Act
    const promise = controller.findById('non-existing-id');

    // Assert
    await expect(promise).rejects.toThrow(
      new NotFoundException('Task not found'),
    );
    expect(tasksService.findById).toHaveBeenCalledTimes(1);
  });

  it('should update a task successfully', async () => {
    // Arrange
    jest
      .spyOn(tasksService, 'update')
      .mockResolvedValue(updatedTaskResponseMock);

    // Act
    const result = await controller.update(
      taskResponseMock.id,
      updateTaskDtoMock,
    );

    // Assert
    expect(tasksService.update).toHaveBeenCalledWith(
      taskResponseMock.id,
      updateTaskDtoMock,
    );
    expect(result).toEqual(updatedTaskResponseMock);
  });

  it('should update the task status successfully', async () => {
    // Arrange
    jest
      .spyOn(tasksService, 'updateStatus')
      .mockResolvedValue(taskResponseWithStatusMock);

    // Act
    const result = await controller.updateStatus(taskResponseMock.id);

    // Assert
    expect(tasksService.updateStatus).toHaveBeenCalledWith(taskResponseMock.id);
    expect(result).toEqual(taskResponseWithStatusMock);
  });
});
