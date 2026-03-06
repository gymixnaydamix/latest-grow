import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma.service.js';
import { NotFoundError } from '../../utils/errors.js';

const param = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

export const transportController = {
  async listRoutes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const routes = await prisma.transportRoute.findMany({
        where: { schoolId: param(req.params.schoolId) },
        include: {
          stops: { orderBy: { sequence: 'asc' } },
          _count: { select: { stops: true, assignments: true } },
        },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: routes });
    } catch (error) {
      next(error);
    }
  },

  async createRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const route = await prisma.transportRoute.create({
        data: {
          schoolId: param(req.params.schoolId),
          name: req.body.name,
          code: req.body.code ?? '',
          driverName: req.body.driverName ?? '',
          vehicleNumber: req.body.vehicleNumber ?? '',
          capacity: req.body.capacity ?? 0,
          isActive: req.body.isActive ?? true,
        },
      });
      res.status(201).json({ success: true, data: route });
    } catch (error) {
      next(error);
    }
  },

  async updateRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const route = await prisma.transportRoute.update({
        where: { id: param(req.params.id) },
        data: {
          name: req.body.name,
          code: req.body.code,
          driverName: req.body.driverName,
          vehicleNumber: req.body.vehicleNumber,
          capacity: req.body.capacity,
          isActive: req.body.isActive,
        },
      });
      res.json({ success: true, data: route });
    } catch (error) {
      next(error);
    }
  },

  async deleteRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.transportRoute.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Route deleted' });
    } catch (error) {
      next(error);
    }
  },

  async createStop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stop = await prisma.transportStop.create({
        data: {
          routeId: param(req.params.id),
          name: req.body.name,
          address: req.body.address ?? '',
          sequence: req.body.sequence,
          scheduledTime: req.body.scheduledTime ?? '',
        },
      });
      res.status(201).json({ success: true, data: stop });
    } catch (error) {
      next(error);
    }
  },

  async updateStop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stop = await prisma.transportStop.update({
        where: { id: param(req.params.id) },
        data: {
          name: req.body.name,
          address: req.body.address,
          sequence: req.body.sequence,
          scheduledTime: req.body.scheduledTime,
        },
      });
      res.json({ success: true, data: stop });
    } catch (error) {
      next(error);
    }
  },

  async deleteStop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.transportStop.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Stop deleted' });
    } catch (error) {
      next(error);
    }
  },

  async listAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignments = await prisma.transportAssignment.findMany({
        where: { schoolId: param(req.params.schoolId) },
        include: {
          route: true,
          stop: true,
          user: { select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true } },
          _count: { select: { events: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  },

  async createAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignment = await prisma.transportAssignment.create({
        data: {
          schoolId: param(req.params.schoolId),
          routeId: req.body.routeId,
          userId: req.body.userId,
          stopId: req.body.stopId ?? null,
          status: req.body.status ?? 'ACTIVE',
          notes: req.body.notes ?? '',
        },
        include: {
          route: true,
          stop: true,
          user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        },
      });
      res.status(201).json({ success: true, data: assignment });
    } catch (error) {
      next(error);
    }
  },

  async updateAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignment = await prisma.transportAssignment.update({
        where: { id: param(req.params.id) },
        data: {
          routeId: req.body.routeId,
          userId: req.body.userId,
          stopId: req.body.stopId,
          status: req.body.status,
          notes: req.body.notes,
        },
        include: {
          route: true,
          stop: true,
          user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        },
      });
      res.json({ success: true, data: assignment });
    } catch (error) {
      next(error);
    }
  },

  async deleteAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.transportAssignment.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Assignment deleted' });
    } catch (error) {
      next(error);
    }
  },

  async listTracking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const { assignmentId, status } = req.query as Record<string, string>;

      const events = await prisma.transportTrackingEvent.findMany({
        where: {
          assignment: { schoolId },
          ...(assignmentId ? { assignmentId } : {}),
          ...(status ? { status } : {}),
        },
        include: {
          assignment: {
            include: {
              route: true,
              stop: true,
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
          recorder: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { recordedAt: 'desc' },
      });

      res.json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  },

  async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignmentId = param(req.params.id);
      const assignment = await prisma.transportAssignment.findUnique({ where: { id: assignmentId } });
      if (!assignment) throw new NotFoundError('Transport assignment not found');

      const event = await prisma.transportTrackingEvent.create({
        data: {
          assignmentId,
          status: req.body.status,
          note: req.body.note ?? '',
          recordedBy: req.user!.userId,
        },
        include: {
          assignment: {
            include: {
              route: true,
              stop: true,
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
          recorder: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      res.status(201).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  },
};
