import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { USER_MESSAGES } from '@/helps/messages';
import { HashingService } from '@/shared/hashing/hashing.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const emailAlreadyExists = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (emailAlreadyExists) {
      throw new ConflictException(USER_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await this.hashingService.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }

    let hashedPassword: string | undefined;

    if (dto.currentPassword || dto.newPassword) {
      if (!dto.currentPassword || !dto.newPassword) {
        throw new BadRequestException(USER_MESSAGES.PASSWORD_BOTH_REQUIRED);
      }

      const passwordMatch = await this.hashingService.compare(
        dto.currentPassword,
        user.password,
      );

      if (!passwordMatch) {
        throw new BadRequestException(USER_MESSAGES.CURRENT_PASSWORD_INCORRECT);
      }

      hashedPassword = await this.hashingService.hash(dto.newPassword);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
}
