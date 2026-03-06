import { prisma } from '../db/prisma.service.js';
import type { Prisma } from '@prisma/client';

export const auditService = {
  async log(data: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        metadata: (data.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  },

  async getByEntity(entity: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: { entity, entityId },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  },

  async getByUser(userId: string, limit: number = 50) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  },

  async getRecent(limit: number = 100) {
    return prisma.auditLog.findMany({
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  },
};
