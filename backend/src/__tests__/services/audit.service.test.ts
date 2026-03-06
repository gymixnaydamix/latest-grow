import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPrismaMock, type MockPrisma } from '../setup/prisma-mock.js';

let mockPrisma: MockPrisma;
vi.mock('../../db/prisma.service.js', () => ({
  get prisma() { return mockPrisma; },
}));

import { auditService } from '../../services/audit.service.js';

describe('auditService.log', () => {
  beforeEach(() => {
    mockPrisma = createPrismaMock();
  });

  it('creates an audit entry with metadata', async () => {
    mockPrisma.auditLog.create.mockResolvedValue({});

    await auditService.log({
      userId: 'u1', action: 'CREATE', entity: 'Course', entityId: 'c1',
      metadata: { name: 'Math 101' },
    });

    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'u1',
        action: 'CREATE',
        entity: 'Course',
        entityId: 'c1',
        metadata: { name: 'Math 101' },
      }),
    });
  });

  it('defaults metadata to empty object', async () => {
    mockPrisma.auditLog.create.mockResolvedValue({});

    await auditService.log({ userId: 'u1', action: 'DELETE', entity: 'User', entityId: 'u2' });

    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ metadata: {} }),
    });
  });
});

describe('auditService.getByEntity', () => {
  beforeEach(() => {
    mockPrisma = createPrismaMock();
  });

  it('queries by entity and entityId with limit 50', async () => {
    mockPrisma.auditLog.findMany.mockResolvedValue([]);
    await auditService.getByEntity('Course', 'c1');

    expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
      where: { entity: 'Course', entityId: 'c1' },
      include: expect.any(Object),
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  });
});

describe('auditService.getByUser', () => {
  beforeEach(() => {
    mockPrisma = createPrismaMock();
  });

  it('queries by userId with custom limit', async () => {
    mockPrisma.auditLog.findMany.mockResolvedValue([]);
    await auditService.getByUser('u1', 25);

    expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      orderBy: { timestamp: 'desc' },
      take: 25,
    });
  });
});

describe('auditService.getRecent', () => {
  beforeEach(() => {
    mockPrisma = createPrismaMock();
  });

  it('returns latest entries with user includes', async () => {
    mockPrisma.auditLog.findMany.mockResolvedValue([]);
    await auditService.getRecent(10);

    expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
      include: expect.objectContaining({ user: expect.any(Object) }),
      orderBy: { timestamp: 'desc' },
      take: 10,
    });
  });
});
