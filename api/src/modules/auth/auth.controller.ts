import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { BadRequestSwagger } from '@/helps/swagger/bad-request.swagger';
import { TooManyRequestsSwagger } from '@/helps/swagger/too-many-requests.swagger';
import { UnauthorizedSwagger } from '@/helps/swagger/unauthorized.swagger';

import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate a user',
    description: 'Validates credentials and returns a JWT access token.',
  })
  @ApiOkResponse({
    type: AuthResponseDto,
    description: 'Authenticated successfully',
  })
  @UnauthorizedSwagger(
    'Invalid credentials',
    'Invalid credentials',
    '/auth/login',
  )
  @BadRequestSwagger(
    ['email must be an email'],
    'Request validation failed',
    '/auth/login',
  )
  @TooManyRequestsSwagger(
    'ThrottlerException: Too Many Requests',
    'Too many login attempts',
    '/auth/login',
  )
  login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }
}
