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

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(todayStart.getTime() + 86_400_000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 86_400_000);

      // ── Current-period + previous-period queries ──
      const [
        studentCount,
        staffCount,
        courseCount,
        eventCount,
        attendanceToday,
        attendancePresentToday,
        invoiceTotal,
        invoicePaid,
        pendingApprovals,
        applicantsByStage,
        // Previous-period comparison
        prevStudentCount,
        prevCourseCount,
        prevInvoiceTotal,
        prevInvoicePaid,
        prevApplicantCount,
      ] = await Promise.all([
        prisma.schoolMember.count({ where: { schoolId, role: 'STUDENT' } }),
        prisma.schoolMember.count({ where: { schoolId, role: { in: ['TEACHER', 'ADMIN', 'FINANCE', 'MARKETING'] } } }),
        prisma.course.count({ where: { schoolId } }),
        prisma.schoolEvent.count({ where: { schoolId, startDate: { gte: now } } }),
        prisma.attendance.count({
          where: { course: { schoolId }, date: { gte: todayStart, lt: todayEnd } },
        }),
        prisma.attendance.count({
          where: { course: { schoolId }, date: { gte: todayStart, lt: todayEnd }, status: 'PRESENT' },
        }),
        prisma.invoice.aggregate({
          where: { schoolId, createdAt: { gte: thirtyDaysAgo } },
          _sum: { totalAmount: true },
        }),
        prisma.invoice.aggregate({
          where: { schoolId, createdAt: { gte: thirtyDaysAgo }, status: { in: ['PAID', 'PARTIALLY_PAID'] } },
          _sum: { amountPaid: true },
        }),
        prisma.approvalRequest.count({ where: { schoolId, status: 'PENDING' } }),
        prisma.applicant.groupBy({
          by: ['stage'],
          where: { schoolId },
          _count: { _all: true },
        }),
        // Previous 30-day period comparisons
        prisma.schoolMember.count({
          where: { schoolId, role: 'STUDENT', createdAt: { lt: thirtyDaysAgo } },
        }),
        prisma.course.count({
          where: { schoolId, createdAt: { lt: thirtyDaysAgo } },
        }),
        prisma.invoice.aggregate({
          where: { schoolId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
          _sum: { totalAmount: true },
        }),
        prisma.invoice.aggregate({
          where: { schoolId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, status: { in: ['PAID', 'PARTIALLY_PAID'] } },
          _sum: { amountPaid: true },
        }),
        prisma.applicant.count({
          where: { schoolId, createdAt: { lt: thirtyDaysAgo } },
        }),
      ]);

      // ── 7-day attendance sparkline ──
      const sparklineDays = 7;
      const sparklineData: number[] = [];
      for (let d = sparklineDays - 1; d >= 0; d--) {
        const dayStart = new Date(todayStart.getTime() - d * 86_400_000);
        const dayEnd = new Date(dayStart.getTime() + 86_400_000);
        const [total, present] = await Promise.all([
          prisma.attendance.count({ where: { course: { schoolId }, date: { gte: dayStart, lt: dayEnd } } }),
          prisma.attendance.count({ where: { course: { schoolId }, date: { gte: dayStart, lt: dayEnd }, status: 'PRESENT' } }),
        ]);
        sparklineData.push(total > 0 ? Math.round((present / total) * 100) : 0);
      }

      // ── Helpers ──
      function pctChange(current: number, previous: number): { change: number; label: string; trend: 'up' | 'down' | 'neutral' } {
        if (previous === 0) return { change: 0, label: current > 0 ? 'New' : '', trend: current > 0 ? 'up' : 'neutral' };
        const delta = ((current - previous) / previous) * 100;
        const rounded = Math.round(delta * 10) / 10;
        return {
          change: rounded,
          label: `${rounded >= 0 ? '+' : ''}${rounded}%`,
          trend: rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'neutral',
        };
      }

      // ── Compute derived metrics ──
      const attendanceRate = attendanceToday > 0
        ? Math.round((attendancePresentToday / attendanceToday) * 100)
        : 0;

      const totalInvoiced = invoiceTotal._sum.totalAmount ?? 0;
      const totalCollected = invoicePaid._sum.amountPaid ?? 0;
      const collectionRate = totalInvoiced > 0
        ? Math.round((totalCollected / totalInvoiced) * 100)
        : 0;

      const prevTotalInvoiced = prevInvoiceTotal._sum.totalAmount ?? 0;
      const prevTotalCollected = prevInvoicePaid._sum.amountPaid ?? 0;
      const prevCollectionRate = prevTotalInvoiced > 0
        ? Math.round((prevTotalCollected / prevTotalInvoiced) * 100)
        : 0;

      const applicantTotal = applicantsByStage.reduce((s, g) => s + g._count._all, 0);

      const studentDelta = pctChange(studentCount, prevStudentCount);
      const courseDelta = pctChange(courseCount, prevCourseCount);
      const feeDelta = pctChange(collectionRate, prevCollectionRate);
      const applicantDelta = pctChange(applicantTotal, prevApplicantCount);

      const kpis = [
        {
          label: 'Total Students', value: studentCount,
          change: studentDelta.change, changeLabel: studentDelta.label, trend: studentDelta.trend,
          sparklineData: null,
        },
        {
          label: 'Staff Members', value: staffCount,
          change: 0, changeLabel: `${staffCount} active`, trend: 'neutral' as const,
          sparklineData: null,
        },
        {
          label: 'Active Courses', value: courseCount,
          change: courseDelta.change, changeLabel: courseDelta.label, trend: courseDelta.trend,
          sparklineData: null,
        },
        {
          label: 'Attendance Today', value: attendanceRate,
          change: 0,
          changeLabel: attendanceToday > 0 ? `${attendancePresentToday}/${attendanceToday}` : 'No records',
          trend: (attendanceRate >= 90 ? 'up' : attendanceRate >= 70 ? 'neutral' : 'down') as 'up' | 'down' | 'neutral',
          sparklineData,
        },
        {
          label: 'Fee Collection', value: collectionRate,
          change: feeDelta.change,
          changeLabel: totalInvoiced > 0 ? `$${Math.round(totalCollected)} / $${Math.round(totalInvoiced)}` : 'No invoices',
          trend: (collectionRate >= 80 ? 'up' : collectionRate >= 50 ? 'neutral' : 'down') as 'up' | 'down' | 'neutral',
          sparklineData: null,
        },
        {
          label: 'Pending Approvals', value: pendingApprovals,
          change: 0,
          changeLabel: pendingApprovals > 0 ? 'Action needed' : 'All clear',
          trend: (pendingApprovals === 0 ? 'up' : pendingApprovals <= 5 ? 'neutral' : 'down') as 'up' | 'down' | 'neutral',
          sparklineData: null,
        },
        {
          label: 'Applicants', value: applicantTotal,
          change: applicantDelta.change, changeLabel: applicantDelta.label, trend: applicantDelta.trend,
          sparklineData: null,
        },
        {
          label: 'Upcoming Events', value: eventCount,
          change: 0, changeLabel: eventCount > 0 ? `Next ${eventCount}` : 'None planned',
          trend: (eventCount > 0 ? 'neutral' : 'down') as 'up' | 'down' | 'neutral',
          sparklineData: null,
        },
      ];

      res.json({ success: true, data: kpis });
    } catch (error) {
      next(error);
    }
  },
};
