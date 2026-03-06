import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPrismaMock, type MockPrisma } from '../setup/prisma-mock.js';

// Mock prisma
let mockPrisma: MockPrisma;
vi.mock('../../db/prisma.service.js', () => ({
  get prisma() { return mockPrisma; },
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn((password: string) => Promise.resolve(`hashed_${password}`)),
    compare: vi.fn((plain: string, hashed: string) => Promise.resolve(hashed === `hashed_${plain}`)),
  },
}));

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mock-jwt-token'),
    verify: vi.fn((token: string) => {
      if (token === 'valid-token') return { userId: 'u1', email: 'a@b.com', role: 'TEACHER' };
      throw new Error('invalid');
    }),
  },
}));

// Mock config
vi.mock('../../config/index.js', () => ({
  config: { jwtSecret: 'test-secret', jwtExpiresIn: '7d', aiProvider: 'mock', aiApiKey: '' },
  isDevelopment: vi.fn(() => true),
  isProduction: vi.fn(() => false),
}));

// Mock logger
vi.mock('../../utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { authService } from '../../services/auth.service.js';
import { isDevelopment } from '../../config/index.js';

const mockUser = {
  id: 'u1',
  email: 'test@test.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'TEACHER' as const,
  avatar: null,
  isActive: true,
  passwordHash: 'hashed_password123',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('authService.register', () => {
  beforeEach(() => {
    mockPrisma = createPrismaMock();
  });

  it('creates user with hashed password and returns profile + token', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue(mockUser);

    const result = await authService.register({
      email: 'test@test.com', password: 'password123',
      firstName: 'John', lastName: 'Doe', role: 'TEACHER',
    });

    expect(result.user.id).toBe('u1');
    expect(result.user.email).toBe('test@test.com');
    expect(result.token).toBe('mock-jwt-token');
    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'test@test.com',
          passwordHash: 'hashed_password123',
        }),
      }),
    );
  });

  it('throws ConflictError if email already exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    await expect(
      authService.register({
        email: 'test@test.com', password: 'password123',
        firstName: 'John', lastName: 'Doe', role: 'TEACHER',
      }),
    ).rejects.toThrow('A user with this email already exists');
  });
});

describe('authService.login', () => {
  beforeEach(() => {
    mockPrisma = createPrismaMock();
  });

  it('returns profile + token for valid credentials', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, passwordHash: 'hashed_password123' });

    const result = await authService.login('test@test.com', 'password123');
    expect(result.user.email).toBe('test@test.com');
    expect(result.token).toBe('mock-jwt-token');
  });

  it('throws UnauthorizedError for unknown email', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(authService.login('unknown@test.com', 'pass')).rejects.toThrow('Invalid email or password');
  });

  it('throws UnauthorizedError for wrong password', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, passwordHash: 'hashed_wrongpass' });
    await expect(authService.login('test@test.com', 'password123')).rejects.toThrow('Invalid email or password');
  });

  it('throws UnauthorizedError for deactivated account', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });
    await expect(authService.login('test@test.com', 'password123')).rejects.toThrow('Account is deactivated');
  });
});

describe('authService.me', () => {
  beforeEach(() => {
    mockPrisma = createPrismaMock();
  });

  it('returns profile for valid userId', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    const profile = await authService.me('u1');
    expect(profile.id).toBe('u1');
    expect(profile.firstName).toBe('John');
  });

  it('throws NotFoundError for unknown userId', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(authService.me('unknown')).rejects.toThrow('User not found');
  });
});

describe('authService.verifyToken', () => {
  it('returns payload for valid token', () => {
    const payload = authService.verifyToken('valid-token');
    expect(payload.userId).toBe('u1');
    expect(payload.email).toBe('a@b.com');
  });

  it('throws UnauthorizedError for invalid token', () => {
    expect(() => authService.verifyToken('bad-token')).toThrow('Invalid or expired token');
  });
});

describe('authService.ensureDevUsers', () => {
  beforeEach(() => {
    mockPrisma = createPrismaMock();
  });

  it('creates provider in development mode', async () => {
    vi.mocked(isDevelopment).mockReturnValue(true);
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue(mockUser);

    await authService.ensureDevUsers();
    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: 'PROVIDER' }) }),
    );
  });

  it('skips if provider already exists', async () => {
    vi.mocked(isDevelopment).mockReturnValue(true);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    await authService.ensureDevUsers();
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it('no-op in production', async () => {
    vi.mocked(isDevelopment).mockReturnValue(false);
    await authService.ensureDevUsers();
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });
});
