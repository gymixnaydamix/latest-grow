import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma.service.js';
import { NotFoundError } from '../../utils/errors.js';
import { auditService } from '../../services/audit.service.js';

/** Express 5 params can be string | string[] — helper to coerce */
const param = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

// ---------------------------------------------------------------------------
// Facility Management
// ---------------------------------------------------------------------------

export const facilityController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const facility = await prisma.facility.create({
        data: { schoolId: param(req.params.schoolId), ...req.body },
      });
      res.status(201).json({ success: true, data: facility });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const facilities = await prisma.facility.findMany({
        where: { schoolId: param(req.params.schoolId) },
        include: { _count: { select: { bookings: true } } },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: facilities });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const facility = await prisma.facility.update({
        where: { id: param(req.params.id) },
        data: req.body,
      });
      res.json({ success: true, data: facility });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.facility.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Facility deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Facility Bookings
// ---------------------------------------------------------------------------

export const bookingController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await prisma.facilityBooking.create({
        data: {
          facilityId: req.body.facilityId,
          reservedBy: req.user!.userId,
          startTime: new Date(req.body.startTime),
          endTime: new Date(req.body.endTime),
          purpose: req.body.purpose,
        },
      });
      res.status(201).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  },

  async listByFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookings = await prisma.facilityBooking.findMany({
        where: { facilityId: param(req.params.facilityId) },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { startTime: 'asc' },
      });
      res.json({ success: true, data: bookings });
    } catch (error) {
      next(error);
    }
  },

  async listBySchool(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const { facilityId, from, to } = req.query as Record<string, string>;

      const bookings = await prisma.facilityBooking.findMany({
        where: {
          facility: { schoolId },
          ...(facilityId ? { facilityId } : {}),
          ...(from || to
            ? {
                startTime: {
                  ...(from ? { gte: new Date(from) } : {}),
                  ...(to ? { lte: new Date(to) } : {}),
                },
              }
            : {}),
        },
        include: {
          facility: { select: { id: true, name: true, type: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { startTime: 'asc' },
      });
      res.json({ success: true, data: bookings });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Policy Management
// ---------------------------------------------------------------------------

export const policyController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const policy = await prisma.policy.create({
        data: {
          schoolId: param(req.params.schoolId),
          title: req.body.title,
          body: req.body.body,
          status: req.body.status,
          publishedAt: req.body.status === 'PUBLISHED' ? new Date() : null,
        },
      });
      await auditService.log({
        userId: req.user!.userId,
        action: 'CREATE',
        entity: 'Policy',
        entityId: policy.id,
      });
      res.status(201).json({ success: true, data: policy });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const policies = await prisma.policy.findMany({
        where: { schoolId: param(req.params.schoolId) },
        orderBy: { updatedAt: 'desc' },
      });
      res.json({ success: true, data: policies });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const policy = await prisma.policy.findUnique({ where: { id: param(req.params.id) } });
      if (!policy) throw new NotFoundError('Policy not found');
      res.json({ success: true, data: policy });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await prisma.policy.findUnique({ where: { id: param(req.params.id) } });
      if (!existing) throw new NotFoundError('Policy not found');

      const policy = await prisma.policy.update({
        where: { id: param(req.params.id) },
        data: {
          title: req.body.title,
          body: req.body.body,
          status: req.body.status,
          version: req.body.status === 'PUBLISHED' ? existing.version + 1 : existing.version,
          publishedAt: req.body.status === 'PUBLISHED' ? new Date() : existing.publishedAt,
        },
      });

      await auditService.log({
        userId: req.user!.userId,
        action: 'UPDATE',
        entity: 'Policy',
        entityId: policy.id,
        metadata: { version: policy.version },
      });

      res.json({ success: true, data: policy });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export const eventController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await prisma.schoolEvent.create({
        data: {
          schoolId: param(req.params.schoolId),
          title: req.body.title,
          description: req.body.description,
          startDate: new Date(req.body.startDate),
          endDate: new Date(req.body.endDate),
          type: req.body.type,
          audience: req.body.audience,
        },
      });
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const events = await prisma.schoolEvent.findMany({
        where: { schoolId: param(req.params.schoolId) },
        orderBy: { startDate: 'asc' },
      });
      res.json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await prisma.schoolEvent.findUnique({ where: { id: param(req.params.id) } });
      if (!event) throw new NotFoundError('Event not found');
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await prisma.schoolEvent.update({
        where: { id: param(req.params.id) },
        data: {
          title: req.body.title,
          description: req.body.description,
          startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
          endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
          type: req.body.type,
          audience: req.body.audience,
        },
      });
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.schoolEvent.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Event deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Strategic Goals
// ---------------------------------------------------------------------------

export const goalController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const goal = await prisma.strategicGoal.create({
        data: {
          schoolId: param(req.params.schoolId),
          title: req.body.title,
          description: req.body.description,
          targetDate: new Date(req.body.targetDate),
        },
      });
      res.status(201).json({ success: true, data: goal });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const goals = await prisma.strategicGoal.findMany({
        where: { schoolId: param(req.params.schoolId) },
        orderBy: { targetDate: 'asc' },
      });
      res.json({ success: true, data: goals });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const goal = await prisma.strategicGoal.update({
        where: { id: param(req.params.id) },
        data: {
          title: req.body.title,
          description: req.body.description,
          progress: req.body.progress,
          targetDate: req.body.targetDate ? new Date(req.body.targetDate) : undefined,
          status: req.body.status,
        },
      });
      res.json({ success: true, data: goal });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Compliance Reports
// ---------------------------------------------------------------------------

export const complianceController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await prisma.complianceReport.create({
        data: {
          schoolId: param(req.params.schoolId),
          title: req.body.title,
          type: req.body.type,
          content: req.body.content,
        },
      });
      res.status(201).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reports = await prisma.complianceReport.findMany({
        where: { schoolId: param(req.params.schoolId) },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: reports });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// System Prompts
// ---------------------------------------------------------------------------

export const systemPromptController = {
  async upsert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const prompt = await prisma.systemPrompt.upsert({
        where: {
          schoolId_toolName: {
            schoolId: param(req.params.schoolId),
            toolName: req.body.toolName,
          },
        },
        create: {
          schoolId: param(req.params.schoolId),
          toolName: req.body.toolName,
          persona: req.body.persona,
          instructions: req.body.instructions,
        },
        update: {
          persona: req.body.persona,
          instructions: req.body.instructions,
        },
      });
      res.json({ success: true, data: prompt });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const prompts = await prisma.systemPrompt.findMany({
        where: { schoolId: param(req.params.schoolId) },
        orderBy: { toolName: 'asc' },
      });
      res.json({ success: true, data: prompts });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Maintenance requests
// ---------------------------------------------------------------------------

export const maintenanceController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await prisma.maintenanceRequest.create({
        data: {
          schoolId: param(req.params.schoolId),
          facilityId: req.body.facilityId ?? null,
          title: req.body.title,
          description: req.body.description,
          priority: req.body.priority ?? 'MEDIUM',
          status: req.body.status ?? 'OPEN',
          assignedTo: req.body.assignedTo ?? null,
          requestedBy: req.user!.userId,
          notes: req.body.notes ?? '',
        },
        include: {
          facility: { select: { id: true, name: true, type: true } },
          requester: { select: { id: true, firstName: true, lastName: true, email: true } },
          assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });
      res.status(201).json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const { status, priority, page = '1', pageSize = '20' } = req.query as Record<string, string>;
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
      const skip = (pageNum - 1) * size;

      const where = {
        schoolId,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
      };

      const [items, total] = await Promise.all([
        prisma.maintenanceRequest.findMany({
          where,
          include: {
            facility: { select: { id: true, name: true, type: true } },
            requester: { select: { id: true, firstName: true, lastName: true, email: true } },
            assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
          orderBy: [{ status: 'asc' }, { requestedAt: 'desc' }],
          skip,
          take: size,
        }),
        prisma.maintenanceRequest.count({ where }),
      ]);

      res.json({
        success: true,
        data: items,
        meta: { page: pageNum, pageSize: size, total, totalPages: Math.ceil(total / size) },
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await prisma.maintenanceRequest.update({
        where: { id: param(req.params.id) },
        data: {
          facilityId: req.body.facilityId,
          title: req.body.title,
          description: req.body.description,
          priority: req.body.priority,
          status: req.body.status,
          assignedTo: req.body.assignedTo,
          notes: req.body.notes,
          resolvedAt:
            req.body.resolvedAt !== undefined
              ? (req.body.resolvedAt ? new Date(req.body.resolvedAt) : null)
              : undefined,
        },
        include: {
          facility: { select: { id: true, name: true, type: true } },
          requester: { select: { id: true, firstName: true, lastName: true, email: true } },
          assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });
      res.json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.maintenanceRequest.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Maintenance request deleted' });
    } catch (error) {
      next(error);
    }
  },
};
