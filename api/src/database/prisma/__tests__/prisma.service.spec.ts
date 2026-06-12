import { PrismaService } from '../prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;
  let connectSpy: jest.SpyInstance;
  let disconnectSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new PrismaService();
    connectSpy = jest.spyOn(service, '$connect').mockResolvedValue(undefined);
    disconnectSpy = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('conecta ao banco no onModuleInit', async () => {
    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalledTimes(1);
  });

  it('propaga o erro quando a conexão com o banco falha', async () => {
    connectSpy.mockRejectedValueOnce(new Error('connection refused'));

    await expect(service.onModuleInit()).rejects.toThrow('connection refused');
    expect(connectSpy).toHaveBeenCalledTimes(1);
  });

  it('desconecta do banco no onModuleDestroy', async () => {
    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });

  it('propaga o erro quando a desconexão com o banco falha', async () => {
    disconnectSpy.mockRejectedValueOnce(new Error('disconnect failed'));

    await expect(service.onModuleDestroy()).rejects.toThrow(
      'disconnect failed',
    );
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});
