import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma.service.js';
import { NotFoundError } from '../../utils/errors.js';
import { wsService } from '../../services/websocket.service.js';
import crypto from 'node:crypto';

/** Express 5 params can be string | string[] — helper to coerce */
const param = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

export const announcementController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const announcement = await prisma.announcement.create({
        data: {
          schoolId: param(req.params.schoolId),
          authorId: req.user!.userId,
          title: req.body.title,
          body: req.body.body,
          audience: req.body.audience,
          publishedAt: req.body.publishedAt ? new Date(req.body.publishedAt) : new Date(),
        },
        include: { author: { select: { id: true, firstName: true, lastName: true } } },
      });
      res.status(201).json({ success: true, data: announcement });

      // ── Broadcast announcement to entire school ──
      wsService.broadcastToSchool(param(req.params.schoolId), 'notification', {
        id: crypto.randomUUID(),
        type: 'ANNOUNCEMENT',
        title: 'New Announcement',
        message: announcement.title,
        read: false,
        link: `/announcements/${announcement.id}`,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, pageSize = 20 } = req.query as { page?: number; pageSize?: number };
      const schoolId = param(req.params.schoolId);

      const [items, total] = await Promise.all([
        prisma.announcement.findMany({
          where: { schoolId },
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          skip: (Number(page) - 1) * Number(pageSize),
          take: Number(pageSize),
        }),
        prisma.announcement.count({ where: { schoolId } }),
      ]);

      res.json({
        success: true,
        data: { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / Number(pageSize)) },
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const announcement = await prisma.announcement.findUnique({
        where: { id: param(req.params.id) },
        include: { author: { select: { id: true, firstName: true, lastName: true } } },
      });
      if (!announcement) throw new NotFoundError('Announcement not found');
      res.json({ success: true, data: announcement });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const announcement = await prisma.announcement.update({
        where: { id: param(req.params.id) },
        data: {
          title: req.body.title,
          body: req.body.body,
          audience: req.body.audience,
          publishedAt: req.body.publishedAt ? new Date(req.body.publishedAt) : undefined,
        },
      });
      res.json({ success: true, data: announcement });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.announcement.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Announcement deleted' });
    } catch (error) {
      next(error);
    }
  },
};
