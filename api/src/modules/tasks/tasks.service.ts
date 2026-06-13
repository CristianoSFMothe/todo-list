import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskStatus } from 'generated/prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';
import { UsersService } from '@/modules/users/users.service';

import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<TaskResponseDto> {
    await this.usersService.findById(createTaskDto.userId);

    const taskAlreadyExists = await this.prisma.task.findUnique({
      where: {
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
        userId: createTaskDto.userId,
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
  }

  async findAll(): Promise<TaskResponseDto[]> {
    return this.prisma.task.findMany({
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
  }

  async findById(id: string): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findUnique({
      where: { id },
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

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.findById(id);

    if (updateTaskDto.title && updateTaskDto.title !== task.title) {
      const taskAlreadyExists = await this.prisma.task.findUnique({
        where: {
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
  }

  async updateStatus(id: string): Promise<TaskResponseDto> {
    const task = await this.findById(id);

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
  }
}
