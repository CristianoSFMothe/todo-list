import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'John Doe Updated', description: 'New name' })
  @IsOptional()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name invalid' })
  name?: string;

  @ApiPropertyOptional({
    example: 'P@ssw0rd',
    minLength: 6,
    description: 'Current password (required together with newPassword)',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Current password cannot be empty' })
  @IsString({ message: 'Current password invalid' })
  @MinLength(6, { message: 'Current password must be at least 6 characters' })
  currentPassword?: string;

  @ApiPropertyOptional({
    example: 'N3wP@ssw0rd',
    minLength: 6,
    description: 'New password (required together with currentPassword)',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'New password cannot be empty' })
  @IsString({ message: 'New password invalid' })
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  newPassword?: string;
}
