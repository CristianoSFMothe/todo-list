export function createPrismaServiceMock() {
  return {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    task: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
  };
}

export type PrismaServiceMock = ReturnType<typeof createPrismaServiceMock>;
