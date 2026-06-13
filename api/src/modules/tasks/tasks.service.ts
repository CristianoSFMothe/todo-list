import { ConflictException, Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { UsersService } from '@/modules/users/users.service';

import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
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
      },
    });
  }
}
