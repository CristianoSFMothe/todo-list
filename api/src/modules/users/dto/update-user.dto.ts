import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name invalid' })
  name?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Current password cannot be empty' })
  @IsString({ message: 'Current password invalid' })
  @MinLength(6, { message: 'Current password must be at least 6 characters' })
  currentPassword?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'New password cannot be empty' })
  @IsString({ message: 'New password invalid' })
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  newPassword?: string;
}
