import { describe, it, expect, vi, beforeEach } from 'vitest';

const { FakePrismaPg, mockConnect, mockDisconnect } = vi.hoisted(() => ({
  FakePrismaPg: class { constructor(_opts: unknown) {} },
  mockConnect: vi.fn().mockResolvedValue(undefined),
  mockDisconnect: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@prisma/adapter-pg', () => ({ PrismaPg: FakePrismaPg }));

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    $connect = mockConnect;
    $disconnect = mockDisconnect;
  },
}));

vi.mock('../../utils/logger.js', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { prisma, connectDatabase, disconnectDatabase } from '../../db/prisma.service.js';

describe('prisma.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports a prisma instance', () => {
    expect(prisma).toBeDefined();
    expect(prisma.$connect).toBeDefined();
  });

  it('connectDatabase calls $connect', async () => {
    await connectDatabase();
    expect(mockConnect).toHaveBeenCalled();
  });

  it('disconnectDatabase calls $disconnect', async () => {
    await disconnectDatabase();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('connectDatabase throws on connection failure', async () => {
    mockConnect.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    await expect(connectDatabase()).rejects.toThrow('ECONNREFUSED');
  });
});
