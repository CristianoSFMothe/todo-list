import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from 'generated/prisma/client';

export class CreateTaskDto {
  @ApiProperty({ example: 'Buy groceries', description: 'Task title' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title!: string;

  @ApiPropertyOptional({
    example: 'Milk, eggs and bread',
    description: 'Optional task description',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.PENDING,
    description: 'Initial status (defaults to PENDING)',
  })
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status is invalid' })
  status?: TaskStatus;
}
