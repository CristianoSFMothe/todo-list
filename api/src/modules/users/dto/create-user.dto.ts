import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name!: string;

  @ApiProperty({ example: 'johndoe@email.com', description: 'Unique email' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    minLength: 6,
    description: 'Password with at least 6 characters',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password invalid' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;
}
