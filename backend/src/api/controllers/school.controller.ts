import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma.service.js';
import { NotFoundError } from '../../utils/errors.js';
import { auditService } from '../../services/audit.service.js';

/** Express 5 params can be string | string[] — helper to coerce */
const param = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

export const schoolController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const school = await prisma.school.create({
        data: {
          name: req.body.name,
          address: req.body.address,
          phone: req.body.phone,
          email: req.body.email,
          website: req.body.website,
        },
      });

      // Add creator as a member
      await prisma.schoolMember.create({
        data: {
          userId: req.user!.userId,
          schoolId: school.id,
          role: req.user!.role,
        },
      });

      await auditService.log({
        userId: req.user!.userId,
        action: 'CREATE',
        entity: 'School',
        entityId: school.id,
      });

      res.status(201).json({ success: true, data: school });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const school = await prisma.school.findUnique({
        where: { id: param(req.params.id) },
        include: { members: { include: { user: true } } },
      });
      if (!school) throw new NotFoundError('School not found');
      res.json({ success: true, data: school });
    } catch (error) {
      next(error);
    }
  },

  async updateBranding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const school = await prisma.school.update({
        where: { id: param(req.params.id) },
        data: { branding: req.body },
      });

      await auditService.log({
        userId: req.user!.userId,
        action: 'UPDATE_BRANDING',
        entity: 'School',
        entityId: school.id,
      });

      res.json({ success: true, data: school });
    } catch (error) {
      next(error);
    }
  },

  async getMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const members = await prisma.schoolMember.findMany({
        where: { schoolId: param(req.params.id) },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true, isActive: true },
          },
        },
      });
      res.json({ success: true, data: members });
    } catch (error) {
      next(error);
    }
  },

  async getDashboardKPIs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.id);

      const [studentCount, staffCount, courseCount, eventCount] = await Promise.all([
        prisma.schoolMember.count({ where: { schoolId, role: 'STUDENT' } }),
        prisma.schoolMember.count({ where: { schoolId, role: { in: ['TEACHER', 'ADMIN', 'FINANCE', 'MARKETING'] } } }),
        prisma.course.count({ where: { schoolId } }),
        prisma.schoolEvent.count({ where: { schoolId, startDate: { gte: new Date() } } }),
      ]);

      const kpis = [
        { label: 'Total Students', value: studentCount, change: 0, changeLabel: '', trend: 'neutral' as const },
        { label: 'Staff Members', value: staffCount, change: 0, changeLabel: '', trend: 'neutral' as const },
        { label: 'Active Courses', value: courseCount, change: 0, changeLabel: '', trend: 'neutral' as const },
        { label: 'Upcoming Events', value: eventCount, change: 0, changeLabel: '', trend: 'neutral' as const },
      ];

      res.json({ success: true, data: kpis });
    } catch (error) {
      next(error);
    }
  },
};
