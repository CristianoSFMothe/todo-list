import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskStatus } from 'generated/prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';

import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

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
} as const;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createTaskDto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    const taskAlreadyExists = await this.prisma.task.findFirst({
      where: {
        userId,
        title: createTaskDto.title,
      },
    });

    if (taskAlreadyExists) {
      throw new ConflictException('Task title already exists');
    }

    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status,
        userId,
      },
      select: taskSelect,
    });
  }

  async findAll(userId: string): Promise<TaskResponseDto[]> {
    return this.prisma.task.findMany({
      where: { userId },
      select: taskSelect,
    });
  }

  async findById(id: string, userId: string): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
      select: taskSelect,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(
    id: string,
    userId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.findById(id, userId);

    if (updateTaskDto.title && updateTaskDto.title !== task.title) {
      const taskAlreadyExists = await this.prisma.task.findFirst({
        where: {
          userId,
          title: updateTaskDto.title,
        },
      });

      if (taskAlreadyExists) {
        throw new ConflictException('Task title already exists');
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        title: updateTaskDto.title,
        description: updateTaskDto.description,
        status: updateTaskDto.status,
      },
      select: taskSelect,
    });
  }

  async updateStatus(id: string, userId: string): Promise<TaskResponseDto> {
    const task = await this.findById(id, userId);

    const nextStatus: Record<TaskStatus, TaskStatus | null> = {
      [TaskStatus.PENDING]: TaskStatus.IN_PROGRESS,
      [TaskStatus.IN_PROGRESS]: TaskStatus.COMPLETED,
      [TaskStatus.COMPLETED]: null,
    };

    const next = nextStatus[task.status as TaskStatus];

    if (!next) {
      throw new BadRequestException('Task is already completed');
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        status: next,
      },
      select: taskSelect,
    });
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const task = await this.findById(id, userId);

    if (task.status === TaskStatus.COMPLETED) {
      throw new BadRequestException('Completed tasks cannot be deleted');
    }

    await this.prisma.task.delete({
      where: { id },
    });

    return { message: 'Task successfully deleted' };
  }
}
