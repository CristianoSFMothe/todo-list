import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

export const createUserDtoMock: CreateUserDto = {
  name: 'John Doe',
  email: 'johndoe@email.com',
  password: 'password123',
};

export const userResponseMock: UserResponseDto = {
  id: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
  name: 'John Doe',
  email: 'johndoe@email.com',
};

export const prismaUserMock = {
  findUnique: jest.fn(),
  create: jest.fn(),
};
