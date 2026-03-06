import type { Request, Response, NextFunction } from 'express';
import type { ParentChild, Attendance } from '@prisma/client';
import { prisma } from '../../db/prisma.service.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';

/** Express 5 params can be string | string[] — helper to coerce */
const param = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

// ---------------------------------------------------------------------------
// Parent Dashboard
// ---------------------------------------------------------------------------

export const parentController = {
  async dashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;

      // Get children
      const children = await prisma.parentChild.findMany({
        where: { parentId },
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      });

      const childIds = children.map((c: ParentChild) => c.studentId);

      // Get recent grades, upcoming assignments, invoices
      const [recentGrades, upcomingAssignments, pendingInvoices] = await Promise.all([
        prisma.grade.findMany({
          where: { studentId: { in: childIds } },
          include: {
            course: { select: { name: true } },
            student: { select: { firstName: true, lastName: true } },
            assignment: { select: { title: true, maxScore: true } },
          },
          orderBy: { gradedAt: 'desc' },
          take: 10,
        }),
        prisma.assignment.findMany({
          where: {
            course: { enrollments: { some: { studentId: { in: childIds } } } },
            dueDate: { gte: new Date() },
          },
          orderBy: { dueDate: 'asc' },
          take: 10,
        }),
        prisma.invoice.findMany({
          where: { parentId, status: { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] } },
          orderBy: { dueDate: 'asc' },
          take: 5,
        }),
      ]);

      res.json({
        success: true,
        data: { children, recentGrades, upcomingAssignments, pendingInvoices },
      });
    } catch (error) {
      next(error);
    }
  },

  async getChildProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = param(req.params.studentId);
      const parentId = req.user!.userId;

      // Verify parent-child relationship
      const relation = await prisma.parentChild.findUnique({
        where: { parentId_studentId: { parentId, studentId } },
      });
      if (!relation) throw new NotFoundError('Child not found');

      const [grades, attendance, submissions] = await Promise.all([
        prisma.grade.findMany({
          where: { studentId },
          include: {
            course: { select: { name: true } },
            assignment: { select: { title: true, maxScore: true } },
          },
          orderBy: { gradedAt: 'desc' },
        }),
        prisma.attendance.findMany({
          where: { studentId },
          include: { course: { select: { name: true } } },
          orderBy: { date: 'desc' },
          take: 60,
        }),
        prisma.submission.findMany({
          where: { studentId, score: null },
          include: {
            assignment: { select: { title: true, dueDate: true, course: { select: { name: true } } } },
          },
          orderBy: { submittedAt: 'desc' },
        }),
      ]);

      // Compute attendance rate
      const totalAttendance = attendance.length;
      const presentCount = attendance.filter((a: Attendance) => a.status === 'PRESENT' || a.status === 'LATE').length;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

      res.json({
        success: true,
        data: { grades, attendance, pendingSubmissions: submissions, attendanceRate },
      });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Digest Config
// ---------------------------------------------------------------------------

export const digestController = {
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const config = await prisma.dailyDigestConfig.findUnique({
        where: { parentId: req.user!.userId },
      });
      res.json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  },

  async upsert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const config = await prisma.dailyDigestConfig.upsert({
        where: { parentId: req.user!.userId },
        create: {
          parentId: req.user!.userId,
          frequency: req.body.frequency,
          preferences: req.body.preferences,
        },
        update: {
          frequency: req.body.frequency,
          preferences: req.body.preferences,
        },
      });
      res.json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export const feedbackController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, body } = req.body;
      if (!category || !body) {
        throw new BadRequestError('category and body are required');
      }
      const feedback = await prisma.feedbackSubmission.create({
        data: {
          parentId: req.user!.userId,
          schoolId: param(req.params.schoolId),
          category,
          body,
        },
      });
      res.status(201).json({ success: true, data: feedback });
    } catch (error) {
      next(error);
    }
  },

  async listBySchool(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const feedback = await prisma.feedbackSubmission.findMany({
        where: { schoolId: param(req.params.schoolId) },
        include: { parent: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { submittedAt: 'desc' },
      });
      res.json({ success: true, data: feedback });
    } catch (error) {
      next(error);
    }
  },

  async listByParent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const feedback = await prisma.feedbackSubmission.findMany({
        where: { parentId: req.user!.userId },
        orderBy: { submittedAt: 'desc' },
      });
      res.json({ success: true, data: feedback });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Volunteer
// ---------------------------------------------------------------------------

export const volunteerController = {
  async listOpportunities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const opportunities = await prisma.volunteerOpportunity.findMany({
        where: { schoolId: param(req.params.schoolId) },
        include: { _count: { select: { signUps: true } } },
        orderBy: { date: 'asc' },
      });
      res.json({ success: true, data: opportunities });
    } catch (error) {
      next(error);
    }
  },

  async signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signup = await prisma.volunteerSignUp.create({
        data: {
          opportunityId: param(req.params.id),
          parentId: req.user!.userId,
        },
      });
      res.status(201).json({ success: true, data: signup });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Cafeteria
// ---------------------------------------------------------------------------

export const cafeteriaController = {
  async getMenu(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const menus = await prisma.cafeteriaMenu.findMany({
        where: {
          schoolId: param(req.params.schoolId),
          date: { gte: new Date() },
        },
        orderBy: { date: 'asc' },
        take: 7,
      });
      res.json({ success: true, data: menus });
    } catch (error) {
      next(error);
    }
  },

  async getAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const account = await prisma.cafeteriaAccount.findUnique({
        where: { studentId: param(req.params.studentId) },
      });
      res.json({ success: true, data: account });
    } catch (error) {
      next(error);
    }
  },
};
