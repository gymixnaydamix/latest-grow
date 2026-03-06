import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma.service.js';
import { NotFoundError } from '../../utils/errors.js';
import { wsService } from '../../services/websocket.service.js';
import crypto from 'node:crypto';

/** Express 5 params can be string | string[] — helper to coerce */
const param = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

export const messageController = {
  /** Create a new thread */
  async createThread(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const thread = await prisma.messageThread.create({
        data: {
          schoolId: param(req.params.schoolId),
          subject: req.body.subject,
          participantIds: req.body.participantIds,
        },
      });
      res.status(201).json({ success: true, data: thread });
    } catch (error) {
      next(error);
    }
  },

  /** List threads the current user is a participant of */
  async listThreads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const threads = await prisma.messageThread.findMany({
        where: {
          schoolId: param(req.params.schoolId),
          participantIds: { has: userId },
        },
        include: {
          messages: { orderBy: { sentAt: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
      });
      res.json({ success: true, data: threads });
    } catch (error) {
      next(error);
    }
  },

  /** Get a single thread with messages */
  async getThread(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const thread = await prisma.messageThread.findUnique({
        where: { id: param(req.params.id) },
        include: {
          messages: {
            include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
            orderBy: { sentAt: 'asc' },
          },
        },
      });
      if (!thread) throw new NotFoundError('Thread not found');
      res.json({ success: true, data: thread });
    } catch (error) {
      next(error);
    }
  },

  /** Send a message in a thread */
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [message] = await Promise.all([
        prisma.message.create({
          data: {
            threadId: param(req.params.threadId),
            senderId: req.user!.userId,
            body: req.body.body,
          },
          include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
        }),
        prisma.messageThread.update({
          where: { id: param(req.params.threadId) },
          data: { updatedAt: new Date() },
        }),
      ]);
      res.status(201).json({ success: true, data: message });

      // ── Notify other participants about new message ──
      const thread = await prisma.messageThread.findUnique({ where: { id: param(req.params.threadId) } });
      if (thread?.participantIds) {
        const senderId = req.user!.userId;
        const senderName = message.sender
          ? `${message.sender.firstName} ${message.sender.lastName}`
          : 'Someone';
        for (const pid of thread.participantIds) {
          if (pid !== senderId) {
            wsService.notifyUser(pid, {
              id: crypto.randomUUID(),
              type: 'MESSAGE',
              title: 'New Message',
              message: `${senderName}: ${req.body.body.slice(0, 100)}`,
              link: `/messages/${thread.id}`,
            });
          }
        }
      }
    } catch (error) {
      next(error);
    }
  },
};
