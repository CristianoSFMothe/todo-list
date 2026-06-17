import { AuthResponseDto } from '../dto/auth-response.dto';
import { LoginDto } from '../dto/login.dto';

export const loginDtoMock: LoginDto = {
  email: 'johndoe@email.com',
  password: 'password123',
};

export const userMock = {
  id: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
  name: 'John Doe',
  email: 'johndoe@email.com',
  password: 'hashed_password',
};

export const authResponseMock: AuthResponseDto = {
  accessToken: 'jwt.access.token',
  user: {
    id: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
    name: 'John Doe',
    email: 'johndoe@email.com',
  },
};

export const usersServiceMock = {
  findByEmail: jest.fn(),
};

export const jwtServiceMock = {
  signAsync: jest.fn(),
};

export const hashingServiceMock = {
  hash: jest.fn(),
  compare: jest.fn(),
};

export const authServiceMock = {
  login: jest.fn(),
};
