import { TaskStatus } from 'generated/prisma/client';

import { CreateTaskDto } from '../dto/create-task.dto';

export const createTaskDtoMock: CreateTaskDto = {
  title: 'First task',
  description: 'Task description',
  userId: '550e8400-e29b-41d4-a716-446655440000',
};

export const createTaskWithStatusDtoMock: CreateTaskDto = {
  ...createTaskDtoMock,
  status: TaskStatus.IN_PROGRESS,
};

export const taskResponseMock = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  title: 'First task',
  description: 'Task description',
  status: TaskStatus.PENDING,
  userId: '550e8400-e29b-41d4-a716-446655440000',
  user: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'John Doe',
    email: 'john@example.com',
  },
};

export const taskResponseWithStatusMock = {
  ...taskResponseMock,
  title: 'Task in progress',
  status: TaskStatus.IN_PROGRESS,
};

export const taskMock = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  title: 'First task',
  description: 'Task description',
  status: TaskStatus.PENDING,
  userId: '550e8400-e29b-41d4-a716-446655440000',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const taskListResponseMock = [
  taskResponseMock,
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Second task',
    description: null,
    status: TaskStatus.IN_PROGRESS,
    userId: '550e8400-e29b-41d4-a716-446655440000',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'John Doe',
      email: 'john@example.com',
    },
  },
];

export const taskUserMock = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'John Doe',
  email: 'john@example.com',
  tasks: [],
};

export const prismaTaskMock = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
};

export const usersServiceTaskMock = {
  findById: jest.fn(),
};
