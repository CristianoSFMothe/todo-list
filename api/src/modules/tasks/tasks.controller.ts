import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { BadRequestSwagger } from '@/helps/swagger/bad-request.swagger';
import { ConflictSwagger } from '@/helps/swagger/conflict.swagger';
import { NotFoundSwagger } from '@/helps/swagger/not-found.swagger';
import { UnauthorizedSwagger } from '@/helps/swagger/unauthorized.swagger';

import {
  type AuthenticatedUser,
  CurrentUser,
} from '../auth/decorators/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiCreatedResponse({
    type: TaskResponseDto,
    description: 'Task successfully created',
  })
  @UnauthorizedSwagger('Unauthorized', 'Missing or invalid token', '/tasks')
  @ConflictSwagger(
    'Task title already exists',
    'Duplicate task title',
    '/tasks',
  )
  @BadRequestSwagger(
    ['property teste should not exist'],
    'Request validation failed',
    '/tasks',
  )
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.tasksService.create(user.id, createTaskDto);
  }

  @Get()
  @ApiOkResponse({
    type: [TaskResponseDto],
    description: 'List of the authenticated user tasks',
  })
  @UnauthorizedSwagger('Unauthorized', 'Missing or invalid token', '/tasks')
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<TaskResponseDto[]> {
    return this.tasksService.findAll(user.id);
  }

  @Get(':id')
  @ApiOkResponse({ type: TaskResponseDto, description: 'Task found' })
  @UnauthorizedSwagger('Unauthorized', 'Missing or invalid token', '/tasks/:id')
  @NotFoundSwagger('Task not found', 'Task not found', '/tasks/:id')
  findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TaskResponseDto> {
    return this.tasksService.findById(id, user.id);
  }

  @Patch(':id')
  @ApiOkResponse({
    type: TaskResponseDto,
    description: 'Task successfully updated',
  })
  @UnauthorizedSwagger('Unauthorized', 'Missing or invalid token', '/tasks/:id')
  @NotFoundSwagger('Task not found', 'Task not found', '/tasks/:id')
  @ConflictSwagger(
    'Task title already exists',
    'Duplicate task title',
    '/tasks/:id',
  )
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.tasksService.update(id, user.id, updateTaskDto);
  }

  @Patch(':id/status')
  @ApiOkResponse({
    type: TaskResponseDto,
    description: 'Task status advanced to the next stage',
  })
  @UnauthorizedSwagger(
    'Unauthorized',
    'Missing or invalid token',
    '/tasks/:id/status',
  )
  @NotFoundSwagger('Task not found', 'Task not found', '/tasks/:id/status')
  @BadRequestSwagger(
    'Task is already completed',
    'Task cannot advance further',
    '/tasks/:id/status',
  )
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TaskResponseDto> {
    return this.tasksService.updateStatus(id, user.id);
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Task successfully deleted',
    schema: { example: { message: 'Task successfully deleted' } },
  })
  @UnauthorizedSwagger('Unauthorized', 'Missing or invalid token', '/tasks/:id')
  @NotFoundSwagger('Task not found', 'Task not found', '/tasks/:id')
  @BadRequestSwagger(
    'Completed tasks cannot be deleted',
    'Completed tasks cannot be deleted',
    '/tasks/:id',
  )
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.tasksService.remove(id, user.id);
  }
}
