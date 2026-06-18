import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'johndoe@email.com', description: 'Account email' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @ApiProperty({ example: 'P@ssw0rd', description: 'Account password' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password invalid' })
  password!: string;
}
