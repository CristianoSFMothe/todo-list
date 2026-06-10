import {
  createPrismaServiceMock,
  PrismaServiceMock,
} from '../__mocks__/prisma.service.mock';
import { PrismaService } from '../prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;
  let prismaMock: PrismaServiceMock;

  beforeEach(() => {
    service = new PrismaService();
    prismaMock = createPrismaServiceMock();

    service.$connect = prismaMock.$connect;
    service.$disconnect = prismaMock.$disconnect;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('conecta ao banco no onModuleInit', async () => {
    await service.onModuleInit();

    expect(prismaMock.$connect).toHaveBeenCalledTimes(1);
  });

  it('propaga o erro quando a conexão com o banco falha', async () => {
    prismaMock.$connect.mockRejectedValueOnce(new Error('connection refused'));

    await expect(service.onModuleInit()).rejects.toThrow('connection refused');
    expect(prismaMock.$connect).toHaveBeenCalledTimes(1);
  });

  it('desconecta do banco no onModuleDestroy', async () => {
    await service.onModuleDestroy();

    expect(prismaMock.$disconnect).toHaveBeenCalledTimes(1);
  });
});
