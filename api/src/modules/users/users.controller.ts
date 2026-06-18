import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { USER_MESSAGES } from '@/helps/messages';
import { BadRequestSwagger } from '@/helps/swagger/bad-request.swagger';
import { ConflictSwagger } from '@/helps/swagger/conflict.swagger';
import { NotFoundSwagger } from '@/helps/swagger/not-found.swagger';
import { UnauthorizedSwagger } from '@/helps/swagger/unauthorized.swagger';

import {
  type AuthenticatedUser,
  CurrentUser,
} from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @ApiCreatedResponse({
    type: UserResponseDto,
    description: 'User successfully created',
  })
  @ConflictSwagger(
    USER_MESSAGES.EMAIL_ALREADY_EXISTS,
    'Email already in use',
    '/users',
  )
  @BadRequestSwagger(
    ['property teste should not exist'],
    'Request validation failed',
    '/users',
  )
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Authenticated user profile',
  })
  @UnauthorizedSwagger('Unauthorized', 'Missing or invalid token', '/users/me')
  @NotFoundSwagger(
    USER_MESSAGES.NOT_FOUND,
    USER_MESSAGES.NOT_FOUND,
    '/users/me',
  )
  getProfile(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'User successfully updated',
  })
  @UnauthorizedSwagger('Unauthorized', 'Missing or invalid token', '/users/me')
  @NotFoundSwagger(
    USER_MESSAGES.NOT_FOUND,
    USER_MESSAGES.NOT_FOUND,
    '/users/me',
  )
  @BadRequestSwagger(
    USER_MESSAGES.PASSWORD_BOTH_REQUIRED,
    'Password update validation failed',
    '/users/me',
  )
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(user.id, updateUserDto);
  }
}
