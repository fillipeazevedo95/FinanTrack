// Setup global para testes
import { PrismaClient } from '@prisma/client';

// Mock do Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    monthlyGoal: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}));

// Mock do bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock do jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: 'mock-user-id' }),
}));

// Configurações globais
beforeAll(() => {
  // Configurar timezone para testes
  process.env.TZ = 'UTC';
});

afterAll(() => {
  // Cleanup após todos os testes
});

beforeEach(() => {
  // Reset de mocks antes de cada teste
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup após cada teste
});
