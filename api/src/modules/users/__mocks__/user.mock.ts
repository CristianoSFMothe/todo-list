import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

export const createUserDtoMock: CreateUserDto = {
  name: 'John Doe',
  email: 'johndoe@email.com',
  password: 'password123',
};

export const updateUserDtoMock: UpdateUserDto = {
  name: 'John Doe Updated',
  currentPassword: 'password123',
  newPassword: 'newpassword123',
};

export const userMock = {
  id: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
  name: 'John Doe',
  email: 'johndoe@email.com',
  password: 'hashed_password',
};

export const userResponseMock: UserResponseDto = {
  id: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
  name: 'John Doe',
  email: 'johndoe@email.com',
};

export const userFindByIdResponseMock = {
  id: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
  name: 'John Doe',
  email: 'johndoe@email.com',
  tasks: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'First task',
      description: 'Task description',
      status: 'PENDING',
    },
  ],
};

export const userResponseListMock: UserResponseDto[] = [
  userResponseMock,
  {
    id: 'b4cc290f-9cg0-4999-0023-bdf5f7654113',
    name: 'Jane Doe',
    email: 'janedoe@email.com',
  },
  {
    id: '90e42090-8400-4fb8-85df-cfa59e015bd4',
    name: 'Eveline',
    email: 'Ole.Wiegand@gmail.com',
  },
];

export const prismaUserMock = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

export const usersServiceMock = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
};
