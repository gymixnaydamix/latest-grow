/* ──────────────────────────────────────────────────────────────────────
 * school-ops.controller — Admin School Operations endpoints
 * Covers: attendance, academics, exams, finance-ops, transport,
 * facilities, communication, settings, audit, staff leave, reports
 * ────────────────────────────────────────────────────────────────────── */
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma.service.js';
import { Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';

/** Express 5 params can be string | string[] — helper to coerce */
const p = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

// ═══════════════════════════════════════════════════════════════════════
// ATTENDANCE
// ═══════════════════════════════════════════════════════════════════════

export const schoolOpsAttendanceController = {
  /** GET /admin/schools/:schoolId/attendance/overview */
  async overview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const courses = await prisma.course.findMany({
        where: { schoolId },
        select: { id: true },
      });
      const courseIds = courses.map(c => c.id);

      const [total, present, absent, late, excused] = await Promise.all([
        prisma.attendance.count({ where: { courseId: { in: courseIds }, date: { gte: today } } }),
        prisma.attendance.count({ where: { courseId: { in: courseIds }, date: { gte: today }, status: 'PRESENT' } }),
        prisma.attendance.count({ where: { courseId: { in: courseIds }, date: { gte: today }, status: 'ABSENT' } }),
        prisma.attendance.count({ where: { courseId: { in: courseIds }, date: { gte: today }, status: 'LATE' } }),
        prisma.attendance.count({ where: { courseId: { in: courseIds }, date: { gte: today }, status: 'EXCUSED' } }),
      ]);

      res.json({
        success: true,
        data: {
          date: today.toISOString().slice(0, 10),
          total,
          present,
          absent,
          late,
          excused,
          rate: total ? Math.round((present / total) * 10000) / 100 : 0,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/attendance/daily?date=... */
  async daily(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const dateStr = (req.query as Record<string, string>).date ?? new Date().toISOString().slice(0, 10);
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const courses = await prisma.course.findMany({ where: { schoolId }, select: { id: true } });
      const courseIds = courses.map(c => c.id);

      const records = await prisma.attendance.findMany({
        where: { courseId: { in: courseIds }, date: { gte: date, lt: nextDay } },
        include: {
          student: { select: { id: true, firstName: true, lastName: true, email: true } },
          course: { select: { id: true, name: true } },
        },
        orderBy: { date: 'asc' },
      });

      res.json({ success: true, data: records });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/attendance/exceptions — absent / late students */
  async exceptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const courses = await prisma.course.findMany({ where: { schoolId }, select: { id: true } });
      const courseIds = courses.map(c => c.id);

      const records = await prisma.attendance.findMany({
        where: { courseId: { in: courseIds }, status: { in: ['ABSENT', 'LATE'] } },
        include: {
          student: { select: { id: true, firstName: true, lastName: true, email: true } },
          course: { select: { id: true, name: true } },
        },
        orderBy: { date: 'desc' },
        take: 100,
      });

      res.json({ success: true, data: records });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/attendance/corrections — placeholder (no model) */
  async corrections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // No dedicated correction model; return recent EXCUSED records as correction candidates
      const schoolId = p(req.params.schoolId);
      const courses = await prisma.course.findMany({ where: { schoolId }, select: { id: true } });
      const courseIds = courses.map(c => c.id);

      const records = await prisma.attendance.findMany({
        where: { courseId: { in: courseIds }, status: 'EXCUSED' },
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
          course: { select: { id: true, name: true } },
        },
        orderBy: { date: 'desc' },
        take: 50,
      });

      res.json({ success: true, data: records });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/attendance/mark */
  async mark(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId, courseId, date, status } = req.body;
      if (!studentId || !courseId || !status) {
        throw new BadRequestError('studentId, courseId, and status are required');
      }
      const record = await prisma.attendance.upsert({
        where: {
          studentId_courseId_date: {
            studentId,
            courseId,
            date: new Date(date ?? new Date().toISOString().slice(0, 10)),
          },
        },
        create: {
          studentId,
          courseId,
          date: new Date(date ?? new Date().toISOString().slice(0, 10)),
          status,
        },
        update: { status },
      });
      res.json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/attendance/corrections/:id */
  async approveCorrection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = p(req.params.id);
      const { status } = req.body;
      const record = await prisma.attendance.update({
        where: { id },
        data: { status: status ?? 'EXCUSED' },
      });
      res.json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════
// ACADEMICS
// ═══════════════════════════════════════════════════════════════════════

export const schoolOpsAcademicsController = {
  /** GET /admin/schools/:schoolId/academics/years — derive from school settings */
  async years(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { settings: true } });
      if (!school) throw new NotFoundError('School not found');

      const settings = school.settings as Record<string, unknown>;
      const academicYears = (settings.academicYears as unknown[]) ?? [
        { year: new Date().getFullYear(), label: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, isCurrent: true },
      ];

      res.json({ success: true, data: academicYears });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/academics/classes — uses Course model */
  async classes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const courses = await prisma.course.findMany({
        where: { schoolId },
        include: {
          teacher: { select: { id: true, firstName: true, lastName: true } },
          department: { select: { id: true, name: true } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: courses });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/academics/subjects — distinct subjects from courses */
  async subjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const courses = await prisma.course.findMany({
        where: { schoolId },
        select: { name: true, gradeLevel: true, department: { select: { name: true } } },
        distinct: ['name'],
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: courses });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/academics/timetable/:classId */
  async timetable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = p(req.params.classId);
      const sessions = await prisma.courseSession.findMany({
        where: { courseId },
        include: { course: { select: { id: true, name: true, teacherId: true } } },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      });
      res.json({ success: true, data: sessions });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/academics/assignments */
  async assignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const courses = await prisma.course.findMany({ where: { schoolId }, select: { id: true } });
      const courseIds = courses.map(c => c.id);

      const assignments = await prisma.assignment.findMany({
        where: { courseId: { in: courseIds } },
        include: {
          course: { select: { id: true, name: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { dueDate: 'desc' },
        take: 100,
      });
      res.json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/academics/classes */
  async createClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { name, description, gradeLevel, semester, teacherId, departmentId } = req.body;
      if (!name) throw new BadRequestError('name is required');

      const course = await prisma.course.create({
        data: {
          schoolId,
          name,
          description: description ?? '',
          gradeLevel: gradeLevel ?? '',
          semester: semester ?? '',
          teacherId: teacherId ?? null,
          departmentId: departmentId ?? null,
        },
      });
      res.status(201).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/academics/classes/:id */
  async updateClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = p(req.params.id);
      const { name, description, gradeLevel, semester, teacherId, departmentId } = req.body;
      const course = await prisma.course.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(gradeLevel !== undefined && { gradeLevel }),
          ...(semester !== undefined && { semester }),
          ...(teacherId !== undefined && { teacherId }),
          ...(departmentId !== undefined && { departmentId }),
        },
      });
      res.json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════
// EXAMS
// ═══════════════════════════════════════════════════════════════════════

export const schoolOpsExamsController = {
  /** GET /admin/schools/:schoolId/exams/schedule */
  async schedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const exams = await prisma.exam.findMany({
        where: { schoolId },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: exams });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/exams/gradebook/:examId */
  async gradebook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const examId = p(req.params.examId);
      const items = await prisma.examScheduleItem.findMany({
        where: { examId },
        orderBy: { date: 'asc' },
      });
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/exams/missing — exams without grades */
  async missing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const exams = await prisma.exam.findMany({
        where: { schoolId, status: 'UPCOMING' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      res.json({ success: true, data: exams });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/exams/results */
  async results(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const exams = await prisma.exam.findMany({
        where: { schoolId, publishedAt: { not: null } },
        orderBy: { publishedAt: 'desc' },
        take: 50,
      });
      res.json({ success: true, data: exams });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/exams/schedule */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { title, subject, instructions, status } = req.body;
      if (!title || !subject) throw new BadRequestError('title and subject are required');

      const exam = await prisma.exam.create({
        data: {
          schoolId,
          title,
          subject,
          instructions: instructions ?? '',
          status: status ?? 'UPCOMING',
        },
      });
      res.status(201).json({ success: true, data: exam });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/exams/gradebook/:id */
  async updateMarks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = p(req.params.id);
      const data = req.body;
      const item = await prisma.examScheduleItem.update({
        where: { id },
        data: {
          ...(data.note !== undefined && { note: data.note }),
          ...(data.room !== undefined && { room: data.room }),
          ...(data.date !== undefined && { date: new Date(data.date) }),
        },
      });
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════
// FINANCE OPS (School-level invoice / payment / fee / discount views)
// ═══════════════════════════════════════════════════════════════════════

export const schoolOpsFinanceController = {
  /** GET /admin/schools/:schoolId/finance/invoices */
  async invoices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const invoices = await prisma.invoice.findMany({
        where: { schoolId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      res.json({ success: true, data: invoices });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/finance/payments */
  async payments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const invoices = await prisma.invoice.findMany({ where: { schoolId }, select: { id: true } });
      const invoiceIds = invoices.map(i => i.id);

      const payments = await prisma.payment.findMany({
        where: { invoiceId: { in: invoiceIds } },
        include: { invoice: { select: { id: true, studentId: true, parentId: true } } },
        orderBy: { paidAt: 'desc' },
        take: 100,
      });
      res.json({ success: true, data: payments });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/finance/fees — tuition plans as fee structure */
  async fees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const plans = await prisma.tuitionPlan.findMany({
        where: { schoolId },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/finance/discounts — from school settings JSON */
  async discounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { settings: true } });
      if (!school) throw new NotFoundError('School not found');
      const settings = school.settings as Record<string, unknown>;
      const discounts = (settings.discounts as unknown[]) ?? [];
      res.json({ success: true, data: discounts });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/finance/overdue */
  async overdue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const overdue = await prisma.invoice.findMany({
        where: { schoolId, status: 'OVERDUE' },
        orderBy: { dueDate: 'asc' },
        take: 100,
      });
      res.json({ success: true, data: overdue });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/finance/invoices */
  async generateInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { parentId, studentId, items, totalAmount, dueDate, currency } = req.body;
      if (!parentId || !studentId || !totalAmount || !dueDate) {
        throw new BadRequestError('parentId, studentId, totalAmount, and dueDate required');
      }

      const invoice = await prisma.invoice.create({
        data: {
          schoolId,
          parentId,
          studentId,
          items: items ?? [],
          totalAmount,
          currency: currency ?? 'USD',
          dueDate: new Date(dueDate),
          status: 'ISSUED',
        },
      });
      res.status(201).json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/finance/payments */
  async recordPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { invoiceId, amount, method, provider, transactionRef } = req.body;
      if (!invoiceId || !amount || !method) {
        throw new BadRequestError('invoiceId, amount, and method are required');
      }

      const payment = await prisma.payment.create({
        data: {
          invoiceId,
          amount,
          method,
          provider: provider ?? 'manual',
          transactionRef: transactionRef ?? '',
          paidAt: new Date(),
        },
      });

      // Update invoice amountPaid
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { amountPaid: { increment: amount } },
      });

      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════
// TRANSPORT
// ═══════════════════════════════════════════════════════════════════════

export const schoolOpsTransportController = {
  /** GET /admin/schools/:schoolId/transport/routes */
  async routes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const routes = await prisma.transportRoute.findMany({
        where: { schoolId },
        include: { stops: { orderBy: { sequence: 'asc' } }, _count: { select: { assignments: true } } },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: routes });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/transport/vehicles */
  async vehicles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const vehicles = await prisma.vehicle.findMany({
        where: { schoolId },
        orderBy: { code: 'asc' },
      });
      res.json({ success: true, data: vehicles });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/transport/assignments */
  async assignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const assignments = await prisma.transportAssignment.findMany({
        where: { schoolId },
        include: {
          route: { select: { id: true, name: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          stop: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/transport/incidents — from tracking events */
  async incidents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const assignments = await prisma.transportAssignment.findMany({
        where: { schoolId },
        select: { id: true },
      });
      const assignmentIds = assignments.map(a => a.id);

      const events = await prisma.transportTrackingEvent.findMany({
        where: { assignmentId: { in: assignmentIds } },
        include: {
          assignment: { select: { id: true, route: { select: { name: true } } } },
          recorder: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { recordedAt: 'desc' },
        take: 100,
      });
      res.json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/transport/routes */
  async createRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { name, code, driverName, vehicleNumber, capacity } = req.body;
      if (!name) throw new BadRequestError('name is required');

      const route = await prisma.transportRoute.create({
        data: {
          schoolId,
          name,
          code: code ?? '',
          driverName: driverName ?? '',
          vehicleNumber: vehicleNumber ?? '',
          capacity: capacity ?? 0,
        },
      });
      res.status(201).json({ success: true, data: route });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/transport/incidents */
  async reportIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { assignmentId, status, note, recordedBy } = req.body;
      if (!assignmentId || !status) throw new BadRequestError('assignmentId and status are required');

      const event = await prisma.transportTrackingEvent.create({
        data: {
          assignmentId,
          status,
          note: note ?? '',
          recordedBy: recordedBy ?? (req as unknown as { userId?: string }).userId ?? '',
          recordedAt: new Date(),
        },
      });
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════
// FACILITIES
// ═══════════════════════════════════════════════════════════════════════

export const schoolOpsFacilitiesController = {
  /** GET /admin/schools/:schoolId/facilities/rooms */
  async rooms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const facilities = await prisma.facility.findMany({
        where: { schoolId },
        include: { _count: { select: { bookings: true, maintenanceRequests: true } } },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: facilities });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/facilities/maintenance */
  async maintenance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const requests = await prisma.maintenanceRequest.findMany({
        where: { schoolId },
        include: {
          facility: { select: { id: true, name: true } },
          requester: { select: { id: true, firstName: true, lastName: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      res.json({ success: true, data: requests });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/facilities/assets — from school settings JSON */
  async assets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { settings: true } });
      if (!school) throw new NotFoundError('School not found');
      const settings = school.settings as Record<string, unknown>;
      const assets = (settings.assets as unknown[]) ?? [];
      res.json({ success: true, data: assets });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/facilities/bookings */
  async bookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const facilities = await prisma.facility.findMany({ where: { schoolId }, select: { id: true } });
      const facilityIds = facilities.map(f => f.id);

      const bookings = await prisma.facilityBooking.findMany({
        where: { facilityId: { in: facilityIds } },
        include: {
          facility: { select: { id: true, name: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { startTime: 'desc' },
        take: 100,
      });
      res.json({ success: true, data: bookings });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/facilities/maintenance */
  async createMaintenanceRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { title, description, facilityId, priority, assignedTo, requestedBy } = req.body;
      if (!title || !description) throw new BadRequestError('title and description are required');

      const request = await prisma.maintenanceRequest.create({
        data: {
          schoolId,
          facilityId: facilityId ?? null,
          title,
          description,
          priority: priority ?? 'MEDIUM',
          assignedTo: assignedTo ?? null,
          requestedBy: requestedBy ?? (req as unknown as { userId?: string }).userId ?? '',
          requestedAt: new Date(),
        },
      });
      res.status(201).json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/facilities/bookings */
  async book(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId, startTime, endTime, purpose, reservedBy } = req.body;
      if (!facilityId || !startTime || !endTime) {
        throw new BadRequestError('facilityId, startTime, and endTime are required');
      }

      const booking = await prisma.facilityBooking.create({
        data: {
          facilityId,
          reservedBy: reservedBy ?? (req as unknown as { userId?: string }).userId ?? '',
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          purpose: purpose ?? '',
        },
      });
      res.status(201).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════
// COMMUNICATION
// ═══════════════════════════════════════════════════════════════════════

export const schoolOpsCommController = {
  /** GET /admin/schools/:schoolId/communication/messages */
  async messages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const threads = await prisma.messageThread.findMany({
        where: { schoolId },
        include: { messages: { take: 1, orderBy: { sentAt: 'desc' } } },
        orderBy: { lastMessageAt: 'desc' },
        take: 50,
      });
      res.json({ success: true, data: threads });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/communication/announcements */
  async announcements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const announcements = await prisma.announcement.findMany({
        where: { schoolId },
        include: { author: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      res.json({ success: true, data: announcements });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/communication/broadcasts — uses Announcements with audience */
  async broadcasts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      // Broadcasts are announcements targeted to all roles
      const broadcasts = await prisma.announcement.findMany({
        where: { schoolId, publishedAt: { not: null } },
        include: { author: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { publishedAt: 'desc' },
        take: 50,
      });
      res.json({ success: true, data: broadcasts });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/communication/templates — from school settings */
  async templates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { settings: true } });
      if (!school) throw new NotFoundError('School not found');
      const settings = school.settings as Record<string, unknown>;
      const templates = (settings.communicationTemplates as unknown[]) ?? [];
      res.json({ success: true, data: templates });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/communication/logs — from audit log */
  async logs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      // Use audit log entries with entity = 'Announcement' or 'Message'
      const logs = await prisma.auditLog.findMany({
        where: {
          entity: { in: ['Announcement', 'Message', 'MessageThread'] },
          metadata: { path: ['schoolId'], equals: schoolId },
        },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/communication/announcements */
  async createAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { title, body, audience, publish } = req.body;
      if (!title || !body) throw new BadRequestError('title and body are required');

      const announcement = await prisma.announcement.create({
        data: {
          schoolId,
          authorId: (req as unknown as { userId?: string }).userId ?? '',
          title,
          body,
          audience: audience ?? [],
          publishedAt: publish ? new Date() : null,
        },
      });
      res.status(201).json({ success: true, data: announcement });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/communication/broadcasts */
  async sendBroadcast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { title, body, audience } = req.body;
      if (!title || !body) throw new BadRequestError('title and body are required');

      const announcement = await prisma.announcement.create({
        data: {
          schoolId,
          authorId: (req as unknown as { userId?: string }).userId ?? '',
          title,
          body,
          audience: audience ?? ['STUDENT', 'TEACHER', 'PARENT', 'ADMIN'],
          publishedAt: new Date(),
        },
      });
      res.status(201).json({ success: true, data: announcement });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /admin/schools/:schoolId/communication/announcements/:id */
  async deleteAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = p(req.params.id);
      await prisma.announcement.delete({ where: { id } });
      res.json({ success: true, data: null, message: 'Announcement deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════

export const schoolOpsSettingsController = {
  /** GET /admin/schools/:schoolId/settings/profile */
  async profile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const school = await prisma.school.findUnique({ where: { id: schoolId } });
      if (!school) throw new NotFoundError('School not found');
      res.json({ success: true, data: school });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/settings/profile */
  async saveProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { name, address, phone, email, website } = req.body;
      const school = await prisma.school.update({
        where: { id: schoolId },
        data: {
          ...(name !== undefined && { name }),
          ...(address !== undefined && { address }),
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { email }),
          ...(website !== undefined && { website }),
        },
      });
      res.json({ success: true, data: school });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/settings/academic */
  async academic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { settings: true } });
      if (!school) throw new NotFoundError('School not found');
      const settings = school.settings as Record<string, unknown>;
      res.json({ success: true, data: settings.academic ?? {} });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/settings/grading */
  async grading(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { settings: true } });
      if (!school) throw new NotFoundError('School not found');
      const settings = school.settings as Record<string, unknown>;
      res.json({ success: true, data: settings.gradingScales ?? [] });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/settings/fees */
  async fees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { settings: true } });
      if (!school) throw new NotFoundError('School not found');
      const settings = school.settings as Record<string, unknown>;
      res.json({ success: true, data: settings.feeConfig ?? {} });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/settings/fees */
  async saveFees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { settings: true } });
      if (!school) throw new NotFoundError('School not found');
      const settings = school.settings as Record<string, unknown>;
      const updated = await prisma.school.update({
        where: { id: schoolId },
        data: { settings: { ...settings, feeConfig: req.body } },
      });
      res.json({ success: true, data: updated.settings });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/settings/roles */
  async roles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const members = await prisma.schoolMember.findMany({
        where: { schoolId },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } },
      });
      // Group by role
      const grouped: Record<string, unknown[]> = {};
      for (const m of members) {
        const role = m.role;
        if (!grouped[role]) grouped[role] = [];
        grouped[role].push({ ...m.user, joinedAt: m.joinedAt });
      }
      res.json({ success: true, data: grouped });
    } catch (error) {
      next(error);
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════
// AUDIT
// ═══════════════════════════════════════════════════════════════════════

export const schoolOpsAuditController = {
  /** GET /admin/schools/:schoolId/audit/log */
  async log(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      // Retrieve audit logs scoped to school via metadata.schoolId
      const logs = await prisma.auditLog.findMany({
        where: { metadata: { path: ['schoolId'], equals: schoolId } },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { timestamp: 'desc' },
        take: 200,
      });
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/audit/approvals */
  async approvals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const logs = await prisma.auditLog.findMany({
        where: {
          entity: { in: ['ApprovalRequest', 'ConsentForm'] },
          metadata: { path: ['schoolId'], equals: schoolId },
        },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/audit/compliance */
  async compliance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const reports = await prisma.complianceReport.findMany({
        where: { schoolId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      res.json({ success: true, data: reports });
    } catch (error) {
      next(error);
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════
// STAFF / LEAVE
// ═══════════════════════════════════════════════════════════════════════

export const schoolOpsStaffController = {
  /** GET /admin/schools/:schoolId/staff/leave — from school settings JSON */
  async leaveRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { settings: true } });
      if (!school) throw new NotFoundError('School not found');
      const settings = school.settings as Record<string, unknown>;
      const leaves = (settings.leaveRequests as unknown[]) ?? [];
      res.json({ success: true, data: leaves });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/staff/leave */
  async submitLeave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { settings: true } });
      if (!school) throw new NotFoundError('School not found');

      const settings = school.settings as Record<string, unknown>;
      const leaves = ((settings.leaveRequests as Array<Record<string, unknown>>) ?? []);
      const newLeave = {
        id: `leave_${Date.now()}`,
        ...req.body,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      };
      leaves.push(newLeave);

      await prisma.school.update({
        where: { id: schoolId },
        data: { settings: { ...settings, leaveRequests: leaves } as Prisma.InputJsonValue },
      });
      res.status(201).json({ success: true, data: newLeave });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/staff/leave/:id */
  async approveLeave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const leaveId = p(req.params.id);
      const { status } = req.body;

      const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { settings: true } });
      if (!school) throw new NotFoundError('School not found');

      const settings = school.settings as Record<string, unknown>;
      const leaves = ((settings.leaveRequests as Array<Record<string, unknown>>) ?? []);
      const leave = leaves.find(l => l.id === leaveId);
      if (!leave) throw new NotFoundError('Leave request not found');
      leave.status = status ?? 'APPROVED';
      leave.reviewedAt = new Date().toISOString();

      await prisma.school.update({
        where: { id: schoolId },
        data: { settings: { ...settings, leaveRequests: leaves } as Prisma.InputJsonValue },
      });
      res.json({ success: true, data: leave });
    } catch (error) {
      next(error);
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════

export const schoolOpsReportsController = {
  /** GET /admin/schools/:schoolId/reports/:type */
  async report(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const type = p(req.params.type);

      switch (type) {
        case 'enrollment': {
          const courses = await prisma.course.findMany({
            where: { schoolId },
            include: { _count: { select: { enrollments: true } } },
          });
          const totalEnrollments = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
          res.json({ success: true, data: { type, totalCourses: courses.length, totalEnrollments, courses } });
          return;
        }
        case 'attendance': {
          const courses = await prisma.course.findMany({ where: { schoolId }, select: { id: true } });
          const courseIds = courses.map(c => c.id);
          const [total, present] = await Promise.all([
            prisma.attendance.count({ where: { courseId: { in: courseIds } } }),
            prisma.attendance.count({ where: { courseId: { in: courseIds }, status: 'PRESENT' } }),
          ]);
          res.json({ success: true, data: { type, totalRecords: total, presentCount: present, rate: total ? Math.round((present / total) * 10000) / 100 : 0 } });
          return;
        }
        case 'finance': {
          const [invoiceSummary, paymentSummary] = await Promise.all([
            prisma.invoice.aggregate({ where: { schoolId }, _sum: { totalAmount: true, amountPaid: true }, _count: true }),
            prisma.invoice.count({ where: { schoolId, status: 'OVERDUE' } }),
          ]);
          res.json({
            success: true,
            data: {
              type,
              totalBilled: invoiceSummary._sum.totalAmount ?? 0,
              totalCollected: invoiceSummary._sum.amountPaid ?? 0,
              invoiceCount: invoiceSummary._count,
              overdueCount: paymentSummary,
            },
          });
          return;
        }
        case 'staff': {
          const members = await prisma.schoolMember.findMany({
            where: { schoolId, role: { in: ['TEACHER', 'ADMIN'] } },
            include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
          });
          res.json({ success: true, data: { type, totalStaff: members.length, members } });
          return;
        }
        case 'admissions': {
          const applicants = await prisma.applicant.findMany({
            where: { schoolId },
            orderBy: { appliedAt: 'desc' },
          });
          const byStage: Record<string, number> = {};
          for (const a of applicants) {
            byStage[a.stage] = (byStage[a.stage] ?? 0) + 1;
          }
          res.json({ success: true, data: { type, totalApplicants: applicants.length, byStage, applicants } });
          return;
        }
        case 'grades': {
          const courses = await prisma.course.findMany({ where: { schoolId }, select: { id: true } });
          const courseIds = courses.map((c: { id: string }) => c.id);
          const grades = await prisma.grade.findMany({
            where: { courseId: { in: courseIds } },
            include: {
              student: { select: { id: true, firstName: true, lastName: true } },
              course: { select: { id: true, name: true } },
            },
            orderBy: { gradedAt: 'desc' },
            take: 500,
          });
          const avgScore = grades.length
            ? Math.round((grades.reduce((sum: number, g: { score: number }) => sum + g.score, 0) / grades.length) * 100) / 100
            : 0;
          res.json({ success: true, data: { type, totalGrades: grades.length, averageScore: avgScore, grades } });
          return;
        }
        case 'compliance': {
          const reports = await prisma.complianceReport.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' },
          });
          const byStatus: Record<string, number> = {};
          for (const r of reports) {
            byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
          }
          res.json({ success: true, data: { type, totalReports: reports.length, byStatus, reports } });
          return;
        }
        default:
          res.status(400).json({ success: false, error: { message: `Unsupported report type: ${type}` } });
      }
    } catch (error) {
      next(error);
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════
// NOTIFICATIONS (send)
// ═══════════════════════════════════════════════════════════════════════

export const schoolOpsNotificationsController = {
  /** POST /admin/schools/:schoolId/notifications/send */
  async send(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { type, recipientId, recipientEmail, subject, body } = req.body;
      if (!subject || !body) throw new BadRequestError('subject and body are required');

      // Create a notification record for in-app delivery
      if (recipientId) {
        await prisma.notification.create({
          data: {
            userId: recipientId,
            type: (type === 'push' ? 'PUSH' : 'EMAIL').toUpperCase(),
            title: subject,
            message: body,
            metadata: { schoolId, channel: type ?? 'email', recipientEmail: recipientEmail ?? null },
          },
        });
      }

      res.json({
        success: true,
        data: {
          sent: true,
          channel: type ?? 'email',
          recipientId: recipientId ?? null,
          recipientEmail: recipientEmail ?? null,
          subject,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════
// EXAM REPORTS (generate, download, preview)
// ═══════════════════════════════════════════════════════════════════════

export const schoolOpsExamReportsController = {
  /** GET /admin/schools/:schoolId/exams/reports/generate-all */
  async generateAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const exams = await prisma.exam.findMany({
        where: { schoolId, publishedAt: { not: null } },
        orderBy: { publishedAt: 'desc' },
      });
      res.json({
        success: true,
        data: {
          totalReports: exams.length,
          generated: true,
          reports: exams.map((e) => ({
            id: e.id,
            title: e.title,
            subject: e.subject,
            status: e.status,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/exams/reports/bulk-download */
  async bulkDownload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const exams = await prisma.exam.findMany({
        where: { schoolId, publishedAt: { not: null } },
        orderBy: { publishedAt: 'desc' },
      });
      const csv = [
        'id,title,subject,status,publishedAt',
        ...exams.map((e) => `${e.id},${e.title},${e.subject},${e.status},${e.publishedAt?.toISOString() ?? ''}`),
      ].join('\n');
      res.json({ success: true, data: { csv, totalReports: exams.length } });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/exams/reports/:reportId/preview */
  async preview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const examId = p(req.params.reportId);
      const exam = await prisma.exam.findUnique({ where: { id: examId } });
      if (!exam) throw new NotFoundError('Exam report not found');
      const scheduleItems = await prisma.examScheduleItem.findMany({
        where: { examId },
        orderBy: { date: 'asc' },
      });
      res.json({ success: true, data: { exam, scheduleItems } });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/exams/reports/:reportId/download */
  async download(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const examId = p(req.params.reportId);
      const exam = await prisma.exam.findUnique({ where: { id: examId } });
      if (!exam) throw new NotFoundError('Exam report not found');
      const scheduleItems = await prisma.examScheduleItem.findMany({
        where: { examId },
        orderBy: { date: 'asc' },
      });
      res.json({ success: true, data: { exam, scheduleItems } });
    } catch (error) {
      next(error);
    }
  },
};
