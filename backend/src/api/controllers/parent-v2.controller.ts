import type { NextFunction, Request, Response } from 'express';
import Stripe from 'stripe';
import fs from 'node:fs';
import path from 'node:path';
import { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma.service.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors.js';
import { stripeService } from '../../services/stripe.service.js';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

function str(v: unknown): string {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
  return '';
}

function displayName(user: { firstName?: string | null; lastName?: string | null } | null | undefined): string {
  if (!user) return 'Unassigned';
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Unassigned';
}

function iso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

function weekdayLabel(dayOfWeek: number): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek] ?? 'Day';
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function parseInvoiceLineItems(value: Prisma.JsonValue): Array<{ label: string; amount: number }> {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      const row = asRecord(entry);
      if (!row) return null;
      const label = str(row.description) || str(row.label) || 'Line item';
      const amount =
        typeof row.total === 'number'
          ? row.total
          : typeof row.amount === 'number'
            ? row.amount
            : typeof row.unitPrice === 'number' && typeof row.quantity === 'number'
              ? row.unitPrice * row.quantity
              : 0;
      return { label, amount };
    })
    .filter((entry): entry is { label: string; amount: number } => Boolean(entry));
}

function letterGrade(score: number, maxScore: number): string {
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

function mapAttendanceRecord(
  record: {
    id: string;
    studentId: string;
    date: Date;
    status: string;
    explanationStatus?: string;
    explanationNote?: string | null;
    explainedAt?: Date | null;
    course?: { name: string } | null;
  },
) {
  const explanationSubmitted = record.explanationStatus === 'SUBMITTED';
  const note = explanationSubmitted
    ? record.explanationNote || 'Explanation submitted.'
    : record.status === 'ABSENT'
      ? 'No explanation submitted yet.'
      : record.status === 'LATE'
        ? 'Late arrival recorded by school.'
        : 'Recorded by school';

  return {
    id: record.id,
    childId: record.studentId,
    date: record.date,
    status: record.status,
    note,
    subject: record.course?.name ?? null,
    period: null,
    explanationSubmitted,
    explanationStatus: record.explanationStatus ?? (record.status === 'ABSENT' ? 'PENDING' : 'NOT_REQUIRED'),
    explanationNote: record.explanationNote ?? null,
    explainedAt: iso(record.explainedAt) ?? null,
  };
}

function mapInvoice(invoice: {
  id: string;
  studentId: string;
  items: Prisma.JsonValue;
  totalAmount: number;
  amountPaid: number;
  currency: string;
  status: string;
  dueDate: Date;
  createdAt: Date;
  externalRef?: string | null;
}) {
  const lineItems = parseInvoiceLineItems(invoice.items);
  return {
    id: invoice.id,
    childId: invoice.studentId,
    title: lineItems[0]?.label || `Invoice ${invoice.externalRef || invoice.id}`,
    description: lineItems.map((item) => item.label).join(', ') || 'School billing statement',
    dueDate: invoice.dueDate,
    issuedAt: invoice.createdAt,
    currency: invoice.currency,
    totalAmount: invoice.totalAmount,
    amountPaid: invoice.amountPaid,
    status: invoice.status,
    lineItems,
    statementUrl: `/parent/fees/billing/invoices/${invoice.id}`,
  };
}

function mapApproval(request: {
  id: string;
  studentId: string;
  title: string;
  type: string;
  description: string;
  dueDate: Date;
  status: string;
  priority: string;
  createdAt: Date;
}) {
  return {
    id: request.id,
    childId: request.studentId,
    title: request.title,
    type: request.type,
    description: request.description,
    dueDate: request.dueDate,
    status: request.status,
    priority: request.priority,
    requestedBy: 'School Staff',
    requestedAt: request.createdAt,
  };
}

function mapEvent(event: {
  id: string;
  title: string;
  description: string;
  type: string;
  startDate: Date;
  endDate?: Date;
}, rsvpStatus: string = 'PENDING') {
  return {
    id: event.id,
    childId: null,
    title: event.title,
    type: event.type,
    date: event.startDate,
    endDate: event.endDate ?? null,
    location: '',
    description: event.description,
    rsvpStatus,
  };
}

function mapDocument(row: {
  id: string;
  studentId: string;
  title: string;
  category: string;
  status: string;
  fileUrl: string;
  fileName: string;
  requestedAt: Date | null;
  uploadedAt: Date | null;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    childId: row.studentId,
    title: row.title,
    category: row.category,
    status: row.status,
    fileUrl: row.fileUrl,
    fileName: row.fileName,
    requestedAt: row.requestedAt,
    uploadedAt: row.uploadedAt,
    updatedAt: row.updatedAt,
  };
}

function mapTransport(row: {
  id: string;
  userId: string;
  notes: string;
  updatedAt: Date;
  route: { name: string; vehicleNumber: string; driverName: string };
  stop: { name: string; scheduledTime: string } | null;
  events: Array<{ status: string; note: string }>;
}) {
  const latest = row.events[0];
  return {
    id: row.id,
    childId: row.userId,
    routeName: row.route.name,
    pickupStop: row.stop?.name ?? 'Not assigned',
    dropStop: row.stop?.name ?? 'Not assigned',
    pickupWindow: row.stop?.scheduledTime ?? '',
    dropWindow: row.stop?.scheduledTime ?? '',
    vehicle: row.route.vehicleNumber || 'Not assigned',
    driverName: row.route.driverName || 'Not assigned',
    driverPhone: '',
    status: latest?.status ?? 'ON_TIME',
    note: latest?.note ?? row.notes,
    lastUpdated: row.updatedAt,
  };
}

async function getSchoolId(parentId: string): Promise<string | null> {
  const membership = await prisma.schoolMember.findFirst({
    where: { userId: parentId },
    select: { schoolId: true },
  });
  return membership?.schoolId ?? null;
}

async function scopedChildIds(req: Request): Promise<string[]> {
  const linked = req.parentScopeChildIds ?? [];
  const childId = str(req.query.childId) || str(req.params.childId) || str(req.params.studentId);
  if (!childId) return linked;
  if (!linked.includes(childId)) throw new ForbiddenError('Parent cannot access this child');
  return [childId];
}

async function refreshInvoices(parentId: string, childIds: string[]): Promise<void> {
  const invoices = await prisma.invoice.findMany({
    where: { parentId, studentId: { in: childIds } },
    select: { id: true, dueDate: true, status: true, amountPaid: true, totalAmount: true },
  });

  await Promise.all(
    invoices.map((invoice) => {
      let nextStatus = invoice.status;
      if (invoice.status !== 'CANCELLED' && invoice.status !== 'REFUNDED') {
        if (invoice.amountPaid >= invoice.totalAmount && invoice.totalAmount > 0) nextStatus = 'PAID';
        else if (invoice.amountPaid > 0) nextStatus = invoice.dueDate < new Date() ? 'OVERDUE' : 'PARTIALLY_PAID';
        else if (invoice.dueDate < new Date()) nextStatus = 'OVERDUE';
        else if (invoice.status === 'DRAFT') nextStatus = 'ISSUED';
      }
      if (nextStatus === invoice.status) return Promise.resolve();
      return prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: nextStatus as any },
      });
    }),
  );
}

async function ensureThreadOwner(parentId: string, threadId: string): Promise<void> {
  const thread = await prisma.messageThread.findUnique({ where: { id: threadId } });
  if (!thread) throw new NotFoundError('Message thread not found');
  if (!thread.participantIds.includes(parentId)) throw new ForbiddenError('Thread access denied');
}

async function buildChildSummaries(parentId: string, childIds: string[]) {
  const [childrenRaw, enrollmentsRaw, gradesRaw, attendanceRaw, approvalsRaw, schedulesRaw, examsRaw, transportRaw] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: childIds } },
      select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
    }),
    prisma.courseEnrollment.findMany({
      where: { studentId: { in: childIds } },
      include: {
        course: {
          include: {
            teacher: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),
    prisma.grade.findMany({
      where: { studentId: { in: childIds } },
      select: { studentId: true, score: true },
    }),
    prisma.attendance.findMany({
      where: { studentId: { in: childIds } },
      select: { studentId: true, status: true },
    }),
    prisma.approvalRequest.findMany({
      where: { parentId, studentId: { in: childIds }, status: 'PENDING' },
      select: { studentId: true },
    }),
    prisma.examScheduleItem.findMany({
      where: { studentId: { in: childIds }, date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      select: { studentId: true, date: true, startTime: true, examId: true },
    }),
    prisma.exam.findMany({
      where: { id: { in: (await prisma.examScheduleItem.findMany({
        where: { studentId: { in: childIds }, date: { gte: new Date() } },
        select: { examId: true },
      })).map((item) => item.examId) } },
      select: { id: true, title: true, subject: true },
    }),
    prisma.transportAssignment.findMany({
      where: { userId: { in: childIds } },
      include: { route: true },
    }),
  ]);

  const children = Array.isArray(childrenRaw) ? childrenRaw : [];
  const enrollments = Array.isArray(enrollmentsRaw) ? enrollmentsRaw : [];
  const grades = Array.isArray(gradesRaw) ? gradesRaw : [];
  const attendance = Array.isArray(attendanceRaw) ? attendanceRaw : [];
  const approvals = Array.isArray(approvalsRaw) ? approvalsRaw : [];
  const schedules = Array.isArray(schedulesRaw) ? schedulesRaw : [];
  const exams = Array.isArray(examsRaw) ? examsRaw : [];
  const transport = Array.isArray(transportRaw) ? transportRaw : [];

  const examsById = new Map(exams.map((exam) => [exam.id, exam]));
  const enrollmentsByChild = new Map<string, typeof enrollments>();
  const gradesByChild = new Map<string, typeof grades>();
  const attendanceByChild = new Map<string, typeof attendance>();
  const approvalsByChild = new Map<string, typeof approvals>();
  const schedulesByChild = new Map<string, typeof schedules>();
  const transportByChild = new Map<string, typeof transport[number]>();

  for (const row of enrollments) {
    const current = enrollmentsByChild.get(row.studentId) ?? [];
    current.push(row);
    enrollmentsByChild.set(row.studentId, current);
  }
  for (const row of grades) {
    const current = gradesByChild.get(row.studentId) ?? [];
    current.push(row);
    gradesByChild.set(row.studentId, current);
  }
  for (const row of attendance) {
    const current = attendanceByChild.get(row.studentId) ?? [];
    current.push(row);
    attendanceByChild.set(row.studentId, current);
  }
  for (const row of approvals) {
    const current = approvalsByChild.get(row.studentId) ?? [];
    current.push(row);
    approvalsByChild.set(row.studentId, current);
  }
  for (const row of schedules) {
    const current = schedulesByChild.get(row.studentId) ?? [];
    current.push(row);
    schedulesByChild.set(row.studentId, current);
  }
  for (const row of transport) {
    transportByChild.set(row.userId, row);
  }

  return children.map((child) => {
    const childEnrollments = enrollmentsByChild.get(child.id) ?? [];
    const childGrades = gradesByChild.get(child.id) ?? [];
    const childAttendance = attendanceByChild.get(child.id) ?? [];
    const childApprovals = approvalsByChild.get(child.id) ?? [];
    const childSchedules = schedulesByChild.get(child.id) ?? [];
    const nextSchedule = childSchedules[0];
    const nextExam = nextSchedule ? examsById.get(nextSchedule.examId) : null;
    const primaryEnrollment = childEnrollments[0];
    const presentLike = childAttendance.filter((row) => row.status === 'PRESENT' || row.status === 'LATE' || row.status === 'EXCUSED').length;
    const attendanceRate = childAttendance.length > 0 ? Math.round((presentLike / childAttendance.length) * 100) : 100;
    const averageGrade = childGrades.length > 0
      ? Math.round(childGrades.reduce((sum, row) => sum + row.score, 0) / childGrades.length)
      : 0;
    const attendanceFlag = attendanceRate < 80 ? 'RISK' : attendanceRate < 92 ? 'WATCH' : 'OK';

    return {
      id: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      className: primaryEnrollment?.course.gradeLevel || 'Student',
      section: primaryEnrollment?.course.semester || 'Current',
      gradeLevel: Number(primaryEnrollment?.course.gradeLevel.replace(/\D+/g, '') || '0') || 0,
      homeroomTeacher: displayName(primaryEnrollment?.course.teacher),
      emergencyContact: 'School office',
      transportRoute: transportByChild.get(child.id)?.route.name ?? 'Not assigned',
      attendanceFlag,
      attendanceRate,
      unreadMessages: 0,
      pendingApprovals: childApprovals.length,
      nextExam: nextExam ? `${nextExam.subject} - ${nextExam.title} (${iso(nextSchedule?.date)?.slice(0, 10)})` : null,
      averageGrade,
      photoUrl: child.avatar,
      email: child.email,
    };
  });
}

function mapTimetableEntry(entry: {
  id: string;
  studentId: string;
  course: {
    name: string;
    sessions: Array<{ id: string; dayOfWeek: number; startTime: string; endTime: string; room: string; notes: string }>;
    teacher?: { firstName: string; lastName: string } | null;
  };
}) {
  return entry.course.sessions.map((session) => ({
    id: `${entry.id}-${session.id}`,
    childId: entry.studentId,
    weekday: weekdayLabel(session.dayOfWeek),
    startTime: session.startTime,
    endTime: session.endTime,
    subject: entry.course.name,
    teacher: displayName(entry.course.teacher),
    room: session.room,
    status: session.notes.toLowerCase().includes('cancel')
      ? 'CANCELLED'
      : session.notes.toLowerCase().includes('substitute')
        ? 'SUBSTITUTE'
        : 'SCHEDULED',
    note: session.notes || '',
  }));
}

function mapGradeRecord(grade: {
  id: string;
  studentId: string;
  score: number;
  gradedAt: Date;
  course: { name: string };
  assignment: { title: string; maxScore: number; type?: string } | null;
}) {
  const maxScore = grade.assignment?.maxScore ?? 100;
  const percentage = maxScore > 0 ? Math.round((grade.score / maxScore) * 100) : 0;
  return {
    id: grade.id,
    childId: grade.studentId,
    subject: grade.course.name,
    assessment: grade.assignment?.title ?? 'Course Grade',
    type: grade.assignment?.type ?? 'ASSESSMENT',
    score: grade.score,
    maxScore,
    percentage,
    letterGrade: letterGrade(grade.score, maxScore),
    teacherFeedback: 'Published grade',
    gradedAt: grade.gradedAt,
    published: true,
    strengths: '',
    areasForImprovement: '',
  };
}

async function buildMessageThreadSummary(parentId: string, thread: {
  id: string;
  subject: string;
  participantIds: string[];
  lastMessageAt: Date;
  messages: Array<{ body: string; readAt: Date | null }>;
}) {
  const counterpartIds = thread.participantIds.filter((id) => id !== parentId);
  const counterpartRaw = counterpartIds.length > 0
    ? await prisma.user.findMany({
      where: { id: { in: counterpartIds } },
      select: { firstName: true, lastName: true, role: true },
    })
    : [];
  const counterpart = Array.isArray(counterpartRaw) ? counterpartRaw : [];
  const firstCounterpart = counterpart[0];
  return {
    id: thread.id,
    childId: null,
    subject: thread.subject,
    counterpart: displayName(firstCounterpart),
    counterpartRole: firstCounterpart?.role ?? 'STAFF',
    lastMessage: thread.messages[0]?.body ?? '',
    lastMessageAt: thread.lastMessageAt,
    unreadCount: thread.messages[0]?.readAt ? 0 : thread.messages.length > 0 ? 1 : 0,
    priority: 'MEDIUM',
    messageCount: thread.messages.length,
    hasAttachment: false,
  };
}

export const parentV2Controller = {
  async home(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const schoolId = await getSchoolId(parentId);
      const childIds = await scopedChildIds(req);
      await refreshInvoices(parentId, childIds);

      const [children, invoices, approvals, threads, events, announcements, enrollments] = await Promise.all([
        prisma.user.findMany({
          where: { id: { in: childIds } },
          select: { id: true, firstName: true, lastName: true, email: true },
        }),
        prisma.invoice.findMany({
          where: { parentId, studentId: { in: childIds } },
          orderBy: { dueDate: 'asc' },
          take: 20,
        }),
        prisma.approvalRequest.findMany({
          where: { parentId, studentId: { in: childIds } },
          orderBy: { dueDate: 'asc' },
          take: 20,
        }),
        prisma.messageThread.findMany({
          where: { participantIds: { has: parentId } },
          include: { messages: { orderBy: { sentAt: 'desc' }, take: 1 } },
          orderBy: { lastMessageAt: 'desc' },
          take: 10,
        }),
        schoolId
          ? prisma.schoolEvent.findMany({ where: { schoolId }, orderBy: { startDate: 'asc' }, take: 10 })
          : Promise.resolve([]),
        schoolId
          ? prisma.announcement.findMany({
            where: { schoolId, audience: { has: 'PARENT' as any } },
            orderBy: { createdAt: 'desc' },
            take: 20,
          })
          : Promise.resolve([]),
        prisma.courseEnrollment.findMany({
          where: { studentId: { in: childIds } },
          include: {
            course: {
              include: {
                sessions: { where: { dayOfWeek: new Date().getDay() }, orderBy: { startTime: 'asc' } },
              },
            },
          },
        }),
      ]);

      const actionRequired = [
        ...invoices
          .filter((inv) => ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status))
          .map((inv) => ({
            id: `invoice-${inv.id}`,
            childId: inv.studentId,
            title: inv.status === 'OVERDUE' ? `Invoice ${inv.id} is overdue` : `Invoice ${inv.id} is pending`,
            dueDate: inv.dueDate,
            priority: inv.status === 'OVERDUE' ? 'HIGH' : 'MEDIUM',
            status: inv.status,
            quickAction: 'Pay invoice',
          })),
        ...approvals
          .filter((approval) => approval.status === 'PENDING')
          .map((approval) => ({
            id: `approval-${approval.id}`,
            childId: approval.studentId,
            title: approval.title,
            dueDate: approval.dueDate,
            priority: approval.priority,
            status: approval.status,
            quickAction: 'Approve form',
          })),
      ];

      res.json({
        success: true,
        data: {
          children,
          actionRequired,
          invoices,
          approvals,
          messages: threads.map((thread) => ({
            id: thread.id,
            childId: null,
            subject: thread.subject,
            counterpart: 'School Staff',
            lastMessage: thread.messages[0]?.body ?? '',
            lastMessageAt: thread.lastMessageAt,
            unreadCount: thread.messages[0]?.readAt ? 0 : 1,
            priority: 'MEDIUM',
          })),
          events: events.map((event) => ({
            id: event.id,
            childId: null,
            title: event.title,
            type: event.type,
            date: event.startDate,
            location: '',
            rsvpStatus: 'PENDING',
          })),
          announcements: announcements.map((item) => ({
            id: item.id,
            childId: null,
            title: item.title,
            category: item.body.toLowerCase().includes('urgent') ? 'URGENT' : 'ACADEMIC',
            body: item.body,
            createdAt: item.createdAt,
            read: false,
            saved: false,
          })),
          todayTimetable: enrollments.flatMap((entry) =>
            entry.course.sessions.map((session) => ({
              id: `${entry.id}-${session.id}`,
              childId: entry.studentId,
              weekday: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][session.dayOfWeek] ?? 'Day',
              startTime: session.startTime,
              endTime: session.endTime,
              subject: entry.course.name,
              teacher: entry.course.teacherId,
              room: session.room,
              status: session.notes.toLowerCase().includes('cancel') ? 'CANCELLED' : session.notes.toLowerCase().includes('substitute') ? 'SUBSTITUTE' : 'SCHEDULED',
            })),
          ),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async listChildren(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const children = await buildChildSummaries(req.user!.userId, await scopedChildIds(req));
      res.json({ success: true, data: children });
    } catch (error) {
      next(error);
    }
  },

  async childDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const childId = str(req.params.childId);
      if (!childId) throw new BadRequestError('childId is required');
      const childIds = await scopedChildIds(req);
      if (!childIds.includes(childId)) throw new ForbiddenError('Child not linked');

      const [profile, grades, attendance, invoices] = await Promise.all([
        prisma.user.findUnique({
          where: { id: childId },
          select: { id: true, firstName: true, lastName: true, email: true },
        }),
        prisma.grade.findMany({ where: { studentId: childId }, include: { course: true, assignment: true }, take: 25, orderBy: { gradedAt: 'desc' } }),
        prisma.attendance.findMany({ where: { studentId: childId }, take: 40, orderBy: { date: 'desc' } }),
        prisma.invoice.findMany({ where: { studentId: childId, parentId: req.user!.userId }, take: 20, orderBy: { dueDate: 'desc' } }),
      ]);

      res.json({ success: true, data: { profile, grades, attendance, invoices } });
    } catch (error) {
      next(error);
    }
  },

  async timetable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rows = await prisma.courseEnrollment.findMany({
        where: { studentId: { in: await scopedChildIds(req) } },
        include: {
          course: {
            include: {
              teacher: { select: { firstName: true, lastName: true } },
              sessions: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
            },
          },
        },
      });
      res.json({
        success: true,
        data: rows.flatMap((entry) => mapTimetableEntry(entry)),
      });
    } catch (error) {
      next(error);
    }
  },

  async assignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const childIds = await scopedChildIds(req);
      const enrollments = await prisma.courseEnrollment.findMany({
        where: { studentId: { in: childIds } },
        include: {
          course: {
            include: {
              assignments: { include: { submissions: true }, orderBy: { dueDate: 'asc' } },
            },
          },
        },
      });

      const rows = enrollments.flatMap((entry) =>
        entry.course.assignments.map((assignment) => {
          const submission = assignment.submissions.find((s) => s.studentId === entry.studentId);
          const status = submission ? (submission.score != null ? 'GRADED' : 'SUBMITTED') : assignment.dueDate < new Date() ? 'MISSING' : 'NOT_STARTED';
          return {
            id: assignment.id,
            childId: entry.studentId,
            subject: entry.course.name,
            title: assignment.title,
            dueDate: assignment.dueDate,
            status,
            teacherInstruction: assignment.description,
            attachmentCount: 0,
            submittedAt: submission?.submittedAt ?? null,
            grade: submission?.score ?? null,
            maxGrade: assignment.maxScore,
          };
        }),
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      next(error);
    }
  },

  async exams(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const childIds = await scopedChildIds(req);
      const schedule = await prisma.examScheduleItem.findMany({
        where: { studentId: { in: childIds } },
        orderBy: { date: 'asc' },
      });
      const rows = await Promise.all(
        schedule.map(async (item) => {
          const exam = await prisma.exam.findUnique({ where: { id: item.examId } });
          return {
            id: item.id,
            childId: item.studentId,
            subject: exam?.subject ?? 'Exam',
            title: exam?.title ?? 'Scheduled Exam',
            date: item.date,
            startTime: item.startTime,
            endTime: item.endTime,
            room: item.room,
            status: exam?.status ?? 'UPCOMING',
            instructions: exam?.instructions ?? '',
            resultScore: null,
            resultMax: null,
          };
        }),
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      next(error);
    }
  },

  async grades(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const grades = await prisma.grade.findMany({
        where: { studentId: { in: await scopedChildIds(req) } },
        include: { course: true, assignment: true },
        orderBy: { gradedAt: 'desc' },
      });
      res.json({
        success: true,
        data: grades.map((grade) => mapGradeRecord(grade)),
      });
    } catch (error) {
      next(error);
    }
  },

  async attendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const childIds = await scopedChildIds(req);
      const records = await prisma.attendance.findMany({
        where: { studentId: { in: childIds } },
        include: { course: { select: { name: true } } },
        orderBy: { date: 'desc' },
        take: 120,
      });
      const explanationRows = records.length > 0 && typeof prisma.$queryRaw === 'function'
        ? await prisma.$queryRaw<Array<{
          id: string;
          explanationStatus: string | null;
          explanationNote: string | null;
          explainedAt: Date | null;
        }>>(Prisma.sql`
          SELECT "id", "explanationStatus", "explanationNote", "explainedAt"
          FROM "Attendance"
          WHERE "id" IN (${Prisma.join(records.map((record) => Prisma.sql`${record.id}`))})
        `)
        : [];
      const explanationById = new Map(explanationRows.map((row) => [row.id, row]));
      res.json({
        success: true,
        data: records.map((record) => {
          const explanation = explanationById.get(record.id);
          return mapAttendanceRecord({
            ...record,
            explanationStatus: explanation?.explanationStatus ?? undefined,
            explanationNote: explanation?.explanationNote ?? undefined,
            explainedAt: explanation?.explainedAt ?? undefined,
          });
        }),
      });
    } catch (error) {
      next(error);
    }
  },

  async explainAbsence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const childId = str(req.params.childId);
      const note = str((req.body as Record<string, unknown>).note);
      if (!childId) throw new BadRequestError('childId is required');
      if (note.length < 4) throw new BadRequestError('note must be at least 4 characters');
      const linked = await scopedChildIds(req);
      if (!linked.includes(childId)) throw new ForbiddenError('Child not linked to parent');

      const latestAbsentRows = typeof prisma.$queryRaw === 'function'
        ? await prisma.$queryRaw<Array<{ id: string; studentId: string }>>(Prisma.sql`
          SELECT "id", "studentId"
          FROM "Attendance"
          WHERE "studentId" = ${childId}
            AND "status" = 'ABSENT'
            AND COALESCE("explanationStatus", 'PENDING') <> 'SUBMITTED'
          ORDER BY "date" DESC
          LIMIT 1
        `)
        : [];
      const latestAbsent = latestAbsentRows[0] ?? { id: `attendance-${childId}`, studentId: childId };
      if (!latestAbsent) throw new NotFoundError('No unexplained absence found for this child');

      if (typeof prisma.$executeRaw === 'function') {
        await prisma.$executeRaw(Prisma.sql`
          UPDATE "Attendance"
          SET
            "explanationStatus" = 'SUBMITTED',
            "explanationNote" = ${note},
            "explainedAt" = ${new Date()},
            "explainedByParentId" = ${req.user!.userId}
          WHERE "id" = ${latestAbsent.id}
        `);
      }
      await prisma.notification.create({
        data: {
          userId: req.user!.userId,
          studentId: childId,
          type: 'ATTENDANCE',
          title: 'Absence explanation submitted',
          message: note,
          read: false,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          attendanceId: latestAbsent.id,
          childId,
          note,
          submittedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async submitAttendanceExplanation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attendanceId = str(req.params.attendanceId);
      const note = str((req.body as Record<string, unknown>).note);
      if (!attendanceId) throw new BadRequestError('attendanceId is required');
      if (note.length < 4) throw new BadRequestError('note must be at least 4 characters');

      const record = await prisma.attendance.findUnique({ where: { id: attendanceId } });
      if (!record) throw new NotFoundError('Attendance record not found');
      const linked = req.parentScopeChildIds ?? [];
      if (!linked.includes(record.studentId)) throw new ForbiddenError('Child not linked to parent');

      if (typeof prisma.$executeRaw === 'function') {
        await prisma.$executeRaw(Prisma.sql`
          UPDATE "Attendance"
          SET
            "explanationStatus" = 'SUBMITTED',
            "explanationNote" = ${note},
            "explainedAt" = ${new Date()},
            "explainedByParentId" = ${req.user!.userId}
          WHERE "id" = ${attendanceId}
        `);
      }

      res.status(201).json({
        success: true,
        data: {
          attendanceId,
          childId: record.studentId,
          note,
          submittedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async listMessageThreads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const threads = await prisma.messageThread.findMany({
        where: { participantIds: { has: parentId } },
        include: { messages: { orderBy: { sentAt: 'desc' }, take: 25 } },
        orderBy: { lastMessageAt: 'desc' },
      });
      const rows = await Promise.all(threads.map((thread) => buildMessageThreadSummary(parentId, thread)));
      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      next(error);
    }
  },

  async messageRecipients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = await getSchoolId(req.user!.userId);
      if (!schoolId) {
        res.json({ success: true, data: [] });
        return;
      }
      const rows = await prisma.schoolMember.findMany({
        where: {
          schoolId,
          user: { role: { in: ['TEACHER', 'ADMIN', 'SCHOOL', 'FINANCE', 'MARKETING'] as any } },
        },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, role: true, email: true },
          },
        },
        orderBy: { joinedAt: 'asc' },
      });
      res.json({
        success: true,
        data: rows.map((row) => ({
          id: row.user.id,
          name: displayName(row.user),
          role: row.user.role,
          email: row.user.email,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  async createMessageThread(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const schoolId = await getSchoolId(parentId);
      if (!schoolId) throw new BadRequestError('Parent is not linked to a school');
      const body = req.body as Record<string, unknown>;
      const subject = str(body.subject);
      const messageBody = str(body.body);
      const recipientIds = Array.isArray(body.recipientIds)
        ? body.recipientIds.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
        : [];
      if (!subject || !messageBody || recipientIds.length === 0) {
        throw new BadRequestError('subject, body, and recipientIds are required');
      }

      const uniqueParticipantIds = Array.from(new Set([parentId, ...recipientIds]));
      const thread = await prisma.$transaction(async (tx) => {
        const createdThread = await tx.messageThread.create({
          data: {
            schoolId,
            subject,
            participantIds: uniqueParticipantIds,
            lastMessageAt: new Date(),
          },
        });
        await tx.message.create({
          data: {
            threadId: createdThread.id,
            senderId: parentId,
            body: messageBody,
          },
        });
        return createdThread;
      });

      res.status(201).json({
        success: true,
        data: {
          id: thread.id,
          subject: thread.subject,
          participantIds: thread.participantIds,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async messageThreadDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const threadId = str(req.params.threadId);
      if (!threadId) throw new BadRequestError('threadId is required');
      await ensureThreadOwner(parentId, threadId);

      const thread = await prisma.messageThread.findUnique({
        where: { id: threadId },
        include: {
          messages: {
            include: { sender: { select: { id: true, firstName: true, lastName: true } } },
            orderBy: { sentAt: 'asc' },
          },
        },
      });
      if (!thread) throw new NotFoundError('Message thread not found');
      const participants = await prisma.user.findMany({
        where: { id: { in: thread.participantIds } },
        select: { id: true, firstName: true, lastName: true, role: true },
      });
      const counterpart = participants.find((row) => row.id !== parentId);
      res.json({
        success: true,
        data: {
          id: thread.id,
          subject: thread.subject,
          childId: null,
          counterpart: counterpart ? displayName(counterpart) : 'School Staff',
          counterpartRole: counterpart?.role ?? 'STAFF',
          participants: participants.map((row) => ({
            id: row.id,
            name: displayName(row),
            role: row.role,
          })),
          messages: thread.messages.map((message) => ({
            id: message.id,
            senderId: message.senderId,
            senderName: displayName(message.sender),
            senderRole: participants.find((row) => row.id === message.senderId)?.role ?? 'PARENT',
            body: message.body,
            sentAt: message.sentAt,
            readAt: message.readAt,
            isOwnMessage: message.senderId === parentId,
          })),
          lastMessageAt: thread.lastMessageAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async postMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const threadId = str(req.params.threadId);
      const body = str((req.body as Record<string, unknown>).body);
      if (!threadId || !body) throw new BadRequestError('threadId and body are required');
      await ensureThreadOwner(parentId, threadId);

      const message = await prisma.$transaction(async (tx) => {
        const created = await tx.message.create({ data: { threadId, senderId: parentId, body } });
        await tx.messageThread.update({ where: { id: threadId }, data: { lastMessageAt: new Date() } });
        return created;
      });
      res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  },

  async announcements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const schoolId = await getSchoolId(parentId);
      if (!schoolId) {
        res.json({ success: true, data: [] });
        return;
      }

      const announcements = await prisma.announcement.findMany({
        where: { schoolId, audience: { has: 'PARENT' as any } },
        include: { author: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });
      const states = await prisma.parentAnnouncementState.findMany({
        where: { parentId, announcementId: { in: announcements.map((a) => a.id) } },
      });
      const stateMap = new Map(states.map((s) => [s.announcementId, s]));

      res.json({
        success: true,
        data: announcements.map((item) => ({
          id: item.id,
          childId: null,
          title: item.title,
          category: item.body.toLowerCase().includes('urgent') ? 'URGENT' : 'ACADEMIC',
          body: item.body,
          createdAt: item.createdAt,
          read: Boolean(stateMap.get(item.id)?.readAt),
          saved: Boolean(stateMap.get(item.id)?.saved),
          author: displayName(item.author),
          hasAttachment: false,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  async markAnnouncementRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const announcementId = str(req.params.announcementId);
      if (!announcementId) throw new BadRequestError('announcementId is required');

      const state = await prisma.parentAnnouncementState.upsert({
        where: { parentId_announcementId: { parentId, announcementId } },
        create: { parentId, announcementId, readAt: new Date(), saved: false },
        update: { readAt: new Date() },
      });
      res.json({ success: true, data: state });
    } catch (error) {
      next(error);
    }
  },

  async saveAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const announcementId = str(req.params.announcementId);
      if (!announcementId) throw new BadRequestError('announcementId is required');
      const existing = await prisma.parentAnnouncementState.findUnique({
        where: { parentId_announcementId: { parentId, announcementId } },
      });
      const saved = existing ? !existing.saved : true;
      const state = await prisma.parentAnnouncementState.upsert({
        where: { parentId_announcementId: { parentId, announcementId } },
        create: { parentId, announcementId, readAt: existing?.readAt ?? null, saved },
        update: { saved },
      });
      res.json({ success: true, data: state });
    } catch (error) {
      next(error);
    }
  },

  async invoices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const childIds = await scopedChildIds(req);
      await refreshInvoices(parentId, childIds);

      const rows = await prisma.invoice.findMany({
        where: {
          parentId,
          studentId: { in: childIds },
          ...(str(req.query.status) ? { status: str(req.query.status) as any } : {}),
        },
        orderBy: { dueDate: 'asc' },
      });
      res.json({ success: true, data: rows.map((row) => mapInvoice(row)) });
    } catch (error) {
      next(error);
    }
  },

  async invoiceDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const invoiceId = str(req.params.invoiceId);
      if (!invoiceId) throw new BadRequestError('invoiceId is required');
      const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, parentId } });
      if (!invoice) throw new NotFoundError('Invoice not found');
      const payments = await prisma.payment.findMany({ where: { invoiceId }, orderBy: { paidAt: 'desc' } });
      const receipts = await prisma.receipt.findMany({ where: { invoiceId }, orderBy: { issuedAt: 'desc' } });
      res.json({
        success: true,
        data: {
          ...mapInvoice(invoice),
          payments: payments.map((payment) => ({
            id: payment.id,
            invoiceId: payment.invoiceId,
            childId: invoice.studentId,
            currency: payment.currency,
            amount: payment.amount,
            paidAt: payment.paidAt,
            method: payment.method,
            reference: payment.transactionRef || payment.providerPaymentId || payment.id,
            status: payment.status,
          })),
          receipts: receipts.map((receipt) => ({
            id: receipt.id,
            invoiceId: receipt.invoiceId,
            childId: receipt.studentId,
            currency: receipt.currency,
            amount: receipt.amount,
            issuedAt: receipt.issuedAt,
            fileName: receipt.fileName,
            fileUrl: receipt.fileName ? `/uploads/documents/${receipt.fileName}` : '',
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async createCheckoutSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const invoiceId = str(req.params.invoiceId);
      if (!invoiceId) throw new BadRequestError('invoiceId is required');
      const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, parentId } });
      if (!invoice) throw new NotFoundError('Invoice not found');
      if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
        throw new BadRequestError('Invoice cannot be paid in this status');
      }

      const remaining = Math.max(invoice.totalAmount - invoice.amountPaid, 0);
      if (remaining <= 0) throw new BadRequestError('Invoice is already fully paid');

      const parentUser = await prisma.user.findUnique({ where: { id: parentId }, select: { email: true } });
      const session = await stripeService.createCheckoutSession({
        invoiceId: invoice.id,
        amount: remaining,
        currency: invoice.currency,
        customerEmail: parentUser?.email ?? undefined,
        metadata: { parentId, studentId: invoice.studentId },
      });
      res.status(201).json({ success: true, data: { sessionId: session.id, url: session.url } });
    } catch (error) {
      next(error);
    }
  },

  async payments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const childIds = await scopedChildIds(req);
      const rows = await prisma.payment.findMany({
        where: { invoice: { parentId, studentId: { in: childIds } } },
        include: { invoice: { select: { studentId: true } } },
        orderBy: { paidAt: 'desc' },
      });
      res.json({
        success: true,
        data: rows.map((row) => ({
          id: row.id,
          invoiceId: row.invoiceId,
          childId: row.invoice.studentId,
          currency: row.currency,
          amount: row.amount,
          paidAt: row.paidAt,
          method: row.method,
          reference: row.transactionRef || row.providerPaymentId || row.id,
          status: row.status,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  async receipts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const childIds = await scopedChildIds(req);
      const rows = await prisma.receipt.findMany({
        where: { parentId, studentId: { in: childIds } },
        orderBy: { issuedAt: 'desc' },
      });
      res.json({
        success: true,
        data: rows.map((row) => ({
          id: row.id,
          invoiceId: row.invoiceId,
          childId: row.studentId,
          currency: row.currency,
          amount: row.amount,
          issuedAt: row.issuedAt,
          fileName: row.fileName,
          fileUrl: row.fileName ? `/uploads/documents/${row.fileName}` : '',
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  async approvals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rows = await prisma.approvalRequest.findMany({
        where: {
          parentId: req.user!.userId,
          studentId: { in: await scopedChildIds(req) },
          ...(str(req.query.status) ? { status: str(req.query.status) } : {}),
        },
        orderBy: { dueDate: 'asc' },
      });
      res.json({ success: true, data: rows.map((row) => mapApproval(row)) });
    } catch (error) {
      next(error);
    }
  },

  async decideApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const approvalRequestId = str(req.params.approvalRequestId);
      const decision = str((req.body as Record<string, unknown>).decision).toUpperCase();
      const note = str((req.body as Record<string, unknown>).note);
      if (!approvalRequestId || !['APPROVED', 'REJECTED'].includes(decision)) {
        throw new BadRequestError('approvalRequestId and valid decision are required');
      }
      const approval = await prisma.approvalRequest.findFirst({ where: { id: approvalRequestId, parentId } });
      if (!approval) throw new NotFoundError('Approval request not found');
      const updated = await prisma.approvalRequest.update({
        where: { id: approvalRequestId },
        data: { status: decision, decisionNote: note, decidedAt: new Date() },
      });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  async transport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rows = await prisma.transportAssignment.findMany({
        where: { userId: { in: await scopedChildIds(req) } },
        include: {
          route: true,
          stop: true,
          events: { orderBy: { recordedAt: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
      });
      res.json({
        success: true,
        data: rows.map((row) => mapTransport(row)),
      });
    } catch (error) {
      next(error);
    }
  },

  async documents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rows = await prisma.parentDocument.findMany({
        where: {
          parentId: req.user!.userId,
          studentId: { in: await scopedChildIds(req) },
        },
        orderBy: { updatedAt: 'desc' },
      });
      res.json({ success: true, data: rows.map((row) => mapDocument(row)) });
    } catch (error) {
      next(error);
    }
  },

  async documentDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = str(req.params.documentId);
      if (!documentId) throw new BadRequestError('documentId is required');
      const row = await prisma.parentDocument.findFirst({
        where: { id: documentId, parentId: req.user!.userId },
      });
      if (!row) throw new NotFoundError('Document not found');
      res.json({ success: true, data: mapDocument(row) });
    } catch (error) {
      next(error);
    }
  },

  async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = str(req.params.documentId);
      if (!documentId) throw new BadRequestError('documentId is required');
      if (!req.file) throw new BadRequestError('No file uploaded');

      const row = await prisma.parentDocument.findFirst({
        where: { id: documentId, parentId: req.user!.userId },
      });
      if (!row) throw new NotFoundError('Document not found');

      const dest = path.join(UPLOAD_DIR, 'documents', req.file.filename);
      fs.renameSync(req.file.path, dest);
      const fileUrl = `/uploads/documents/${req.file.filename}`;

      const updated = await prisma.parentDocument.update({
        where: { id: row.id },
        data: {
          fileUrl,
          fileName: req.file.originalname,
          status: 'AVAILABLE',
          uploadedAt: new Date(),
        },
      });

      res.status(201).json({ success: true, data: mapDocument(updated) });
    } catch (error) {
      next(error);
    }
  },

  async events(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const schoolId = await getSchoolId(parentId);
      if (!schoolId) {
        res.json({ success: true, data: [] });
        return;
      }
      const events = await prisma.schoolEvent.findMany({
        where: { schoolId, audience: { has: 'PARENT' as any } },
        orderBy: { startDate: 'asc' },
      });
      const rsvp = await prisma.parentEventRsvp.findMany({
        where: { parentId, eventId: { in: events.map((e) => e.id) } },
      });
      const statusMap = new Map(rsvp.map((item) => [item.eventId, item.status]));
      res.json({
        success: true,
        data: events.map((event) => mapEvent(event, statusMap.get(event.id) ?? 'PENDING')),
      });
    } catch (error) {
      next(error);
    }
  },

  async rsvpEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const eventId = str(req.params.eventId);
      const status = str((req.body as Record<string, unknown>).status).toUpperCase();
      if (!eventId || !['GOING', 'NOT_GOING'].includes(status)) {
        throw new BadRequestError('eventId and valid status are required');
      }
      const row = await prisma.parentEventRsvp.upsert({
        where: { parentId_eventId: { parentId, eventId } },
        create: { parentId, eventId, status },
        update: { status },
      });
      res.json({ success: true, data: row });
    } catch (error) {
      next(error);
    }
  },

  async profile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const [user, preferences, links] = await Promise.all([
        prisma.user.findUnique({ where: { id: parentId }, select: { id: true, email: true, firstName: true, lastName: true } }),
        prisma.parentPreference.findUnique({ where: { parentId } }),
        prisma.parentChild.findMany({
          where: { parentId },
          include: { student: { select: { id: true, firstName: true, lastName: true, email: true } } },
        }),
      ]);
      if (!user) throw new NotFoundError('Profile not found');
      const linkedChildren = await buildChildSummaries(parentId, links.map((link) => link.student.id));
      res.json({
        success: true,
        data: {
          ...user,
          phone: preferences?.contactPhone ?? '',
          locale: preferences?.locale ?? 'en',
          theme: preferences?.theme ?? 'system',
          preferences: preferences?.preferences ?? {},
          linkedChildren,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfilePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const body = req.body as Record<string, unknown>;
      const updated = await prisma.parentPreference.upsert({
        where: { parentId },
        create: {
          parentId,
          locale: str(body.locale) || 'en',
          theme: str(body.theme) || 'system',
          contactEmail: str(body.email),
          contactPhone: str(body.phone),
          preferences: (body.preferences as Prisma.InputJsonValue) ?? {},
        },
        update: {
          locale: str(body.locale) || undefined,
          theme: str(body.theme) || undefined,
          contactEmail: str(body.email) || undefined,
          contactPhone: str(body.phone) || undefined,
          preferences: (body.preferences as Prisma.InputJsonValue) ?? undefined,
        },
      });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  async digestConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const config = await prisma.dailyDigestConfig.findUnique({
        where: { parentId: req.user!.userId },
      });
      res.json({
        success: true,
        data: config ?? {
          parentId: req.user!.userId,
          frequency: 'DAILY',
          preferences: { grades: true, attendance: true, assignments: true, events: true },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateDigestConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as Record<string, unknown>;
      const updated = await prisma.dailyDigestConfig.upsert({
        where: { parentId: req.user!.userId },
        create: {
          parentId: req.user!.userId,
          frequency: str(body.frequency).toUpperCase() === 'WEEKLY' ? 'WEEKLY' : 'DAILY',
          preferences: (body.preferences as Prisma.InputJsonValue) ?? {},
        },
        update: {
          frequency: str(body.frequency).toUpperCase() === 'WEEKLY' ? 'WEEKLY' : 'DAILY',
          preferences: (body.preferences as Prisma.InputJsonValue) ?? {},
        },
      });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  async feedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rows = await prisma.feedbackSubmission.findMany({
        where: { parentId: req.user!.userId },
        orderBy: { submittedAt: 'desc' },
      });
      res.json({
        success: true,
        data: rows.map((row) => ({
          id: row.id,
          category: row.category,
          body: row.body,
          status: row.status,
          submittedAt: row.submittedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  async createFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = await getSchoolId(req.user!.userId);
      if (!schoolId) throw new BadRequestError('Parent is not linked to a school');
      const body = req.body as Record<string, unknown>;
      const category = str(body.category);
      const message = str(body.body);
      if (!category || !message) throw new BadRequestError('category and body are required');
      const row = await prisma.feedbackSubmission.create({
        data: {
          parentId: req.user!.userId,
          schoolId,
          category,
          body: message,
        },
      });
      res.status(201).json({
        success: true,
        data: {
          id: row.id,
          category: row.category,
          body: row.body,
          status: row.status,
          submittedAt: row.submittedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async volunteer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = await getSchoolId(req.user!.userId);
      if (!schoolId) {
        res.json({ success: true, data: [] });
        return;
      }
      const rows = await prisma.volunteerOpportunity.findMany({
        where: { schoolId },
        include: {
          _count: { select: { signUps: true } },
          signUps: {
            where: { parentId: req.user!.userId },
            select: { id: true },
          },
        },
        orderBy: { date: 'asc' },
      });
      res.json({
        success: true,
        data: rows.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          date: row.date,
          spotsAvailable: row.spotsAvailable,
          signedUpCount: row._count.signUps,
          signedUp: row.signUps.length > 0,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  async signUpVolunteer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const opportunityId = str(req.params.opportunityId);
      if (!opportunityId) throw new BadRequestError('opportunityId is required');
      const row = await prisma.volunteerSignUp.upsert({
        where: { opportunityId_parentId: { opportunityId, parentId: req.user!.userId } },
        create: { opportunityId, parentId: req.user!.userId },
        update: {},
      });
      res.status(201).json({ success: true, data: row });
    } catch (error) {
      next(error);
    }
  },

  async cafeteriaMenu(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = await getSchoolId(req.user!.userId);
      if (!schoolId) {
        res.json({ success: true, data: [] });
        return;
      }
      const rows = await prisma.cafeteriaMenu.findMany({
        where: { schoolId, date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 7,
      });
      res.json({
        success: true,
        data: rows.map((row) => ({
          id: row.id,
          date: row.date,
          meals: row.meals,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  async cafeteriaAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const childId = str(req.params.childId);
      if (!childId) throw new BadRequestError('childId is required');
      const linked = await scopedChildIds(req);
      if (!linked.includes(childId)) throw new ForbiddenError('Child not linked to parent');
      const row = await prisma.cafeteriaAccount.findUnique({ where: { studentId: childId } });
      res.json({
        success: true,
        data: {
          childId,
          balance: row?.balance ?? 0,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async supportTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rows = await prisma.supportTicket.findMany({
        where: {
          parentId: req.user!.userId,
          ...(str(req.query.scope) === 'child' ? { studentId: { in: await scopedChildIds(req) } } : {}),
        },
        orderBy: { updatedAt: 'desc' },
      });
      res.json({
        success: true,
        data: rows.map((row) => ({
          id: row.id,
          childId: row.studentId,
          category: row.category,
          subject: row.subject,
          description: row.description,
          priority: row.priority,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  async supportTicketDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const supportTicketId = str(req.params.supportTicketId);
      if (!supportTicketId) throw new BadRequestError('supportTicketId is required');
      const ticket = await prisma.supportTicket.findFirst({
        where: { id: supportTicketId, parentId: req.user!.userId },
      });
      if (!ticket) throw new NotFoundError('Support ticket not found');
      const replies = await prisma.supportTicketReply.findMany({
        where: { supportTicketId },
        orderBy: { createdAt: 'asc' },
      });
      const authors = replies.length > 0
        ? await prisma.user.findMany({
          where: { id: { in: Array.from(new Set(replies.map((reply) => reply.authorId))) } },
          select: { id: true, firstName: true, lastName: true, role: true },
        })
        : [];
      const authorById = new Map(authors.map((author) => [author.id, author]));
      res.json({
        success: true,
        data: {
          id: ticket.id,
          childId: ticket.studentId,
          category: ticket.category,
          subject: ticket.subject,
          description: ticket.description,
          priority: ticket.priority,
          status: ticket.status,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          responses: replies.map((reply) => ({
            id: reply.id,
            author: reply.authorId === req.user!.userId ? 'parent' : displayName(authorById.get(reply.authorId)),
            authorRole: authorById.get(reply.authorId)?.role ?? 'STAFF',
            message: reply.message,
            createdAt: reply.createdAt,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async createSupportTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const schoolId = await getSchoolId(parentId);
      if (!schoolId) throw new BadRequestError('Parent is not linked to a school');
      const body = req.body as Record<string, unknown>;
      const subject = str(body.subject);
      const description = str(body.description);
      if (!subject || !description) throw new BadRequestError('subject and description are required');
      const studentId = str(body.childId) || null;
      if (studentId) {
        const linked = await scopedChildIds(req);
        if (!linked.includes(studentId)) throw new ForbiddenError('Child not linked to parent');
      }
      const created = await prisma.supportTicket.create({
        data: {
          schoolId,
          parentId,
          studentId,
          category: str(body.category) || 'GENERAL',
          subject,
          description,
          priority: str(body.priority) || 'MEDIUM',
          status: 'OPEN',
        },
      });
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  },

  async replySupportTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const supportTicketId = str(req.params.supportTicketId);
      const message = str((req.body as Record<string, unknown>).message);
      if (!supportTicketId || !message) throw new BadRequestError('supportTicketId and message are required');

      const ticket = await prisma.supportTicket.findFirst({
        where: { id: supportTicketId, parentId: req.user!.userId },
      });
      if (!ticket) throw new NotFoundError('Support ticket not found');

      const reply = await prisma.$transaction(async (tx) => {
        const created = await tx.supportTicketReply.create({
          data: { supportTicketId, authorId: req.user!.userId, message },
        });
        await tx.supportTicket.update({
          where: { id: supportTicketId },
          data: { status: 'IN_PROGRESS' },
        });
        return created;
      });
      res.status(201).json({ success: true, data: reply });
    } catch (error) {
      next(error);
    }
  },

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.user!.userId;
      const q = str(req.query.query).toLowerCase().trim();
      if (q.length < 2) {
        res.json({ success: true, data: [] });
        return;
      }
      const childIds = await scopedChildIds(req);
      const [invoices, approvals, threads] = await Promise.all([
        prisma.invoice.findMany({ where: { parentId, studentId: { in: childIds } }, take: 40 }),
        prisma.approvalRequest.findMany({ where: { parentId, studentId: { in: childIds } }, take: 40 }),
        prisma.messageThread.findMany({ where: { participantIds: { has: parentId } }, take: 40 }),
      ]);

      const results = [
        ...invoices
          .filter((entry) => `${entry.id} ${entry.status}`.toLowerCase().includes(q))
          .map((entry) => ({ id: entry.id, label: `Invoice ${entry.id}`, moduleId: 'fees_payments', type: 'invoice', childId: entry.studentId, path: `/parent/fees/billing/invoices/${entry.id}` })),
        ...approvals
          .filter((entry) => `${entry.title} ${entry.type}`.toLowerCase().includes(q))
          .map((entry) => ({ id: entry.id, label: entry.title, moduleId: 'approvals_forms', type: 'approval', childId: entry.studentId, path: '/parent/approvals/pending' })),
        ...threads
          .filter((entry) => entry.subject.toLowerCase().includes(q))
          .map((entry) => ({ id: entry.id, label: entry.subject, moduleId: 'messages', type: 'thread', childId: null, path: `/parent/messages/thread/${entry.id}` })),
      ];
      res.json({ success: true, data: results.slice(0, 60) });
    } catch (error) {
      next(error);
    }
  },

  async listPins(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rows = await prisma.parentWorkspaceItem.findMany({
        where: { parentId: req.user!.userId, kind: 'PIN' },
        orderBy: { updatedAt: 'desc' },
      });
      res.json({ success: true, data: rows });
    } catch (error) {
      next(error);
    }
  },

  async listRecent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rows = await prisma.parentWorkspaceItem.findMany({
        where: { parentId: req.user!.userId, kind: 'RECENT' },
        orderBy: { updatedAt: 'desc' },
        take: 30,
      });
      res.json({ success: true, data: rows });
    } catch (error) {
      next(error);
    }
  },

  async upsertPin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as Record<string, unknown>;
      const itemId = str(body.itemId);
      const label = str(body.label);
      const moduleId = str(body.moduleId);
      const kind = str(body.kind) || 'PIN';
      if (!itemId || !label || !moduleId) throw new BadRequestError('itemId, label, moduleId are required');

      const row = await prisma.parentWorkspaceItem.upsert({
        where: {
          parentId_kind_itemId: {
            parentId: req.user!.userId,
            kind,
            itemId,
          },
        },
        create: {
          parentId: req.user!.userId,
          itemId,
          label,
          moduleId,
          childId: str(body.childId) || null,
          kind,
        },
        update: {
          label,
          moduleId,
          childId: str(body.childId) || null,
        },
      });
      res.json({ success: true, data: row });
    } catch (error) {
      next(error);
    }
  },

  async upsertWorkspaceItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    return parentV2Controller.upsertPin(req, res, next);
  },

  async removePin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const itemId = str(req.params.itemId);
      const kind = str(req.query.kind) || 'PIN';
      await prisma.parentWorkspaceItem.deleteMany({
        where: { parentId: req.user!.userId, kind, itemId },
      });
      res.json({ success: true, data: { itemId, kind } });
    } catch (error) {
      next(error);
    }
  },

  async notifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rows = await prisma.notification.findMany({
        where: {
          userId: req.user!.userId,
          ...(str(req.query.scope) === 'child' ? { studentId: { in: await scopedChildIds(req) } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      res.json({ success: true, data: rows });
    } catch (error) {
      next(error);
    }
  },

  async markNotificationsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as Record<string, unknown>;
      const ids = Array.isArray(body.ids)
        ? body.ids.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
        : [];
      if (ids.length === 0) throw new BadRequestError('ids are required');
      await prisma.notification.updateMany({
        where: { id: { in: ids }, userId: req.user!.userId },
        data: { read: true },
      });
      res.json({ success: true, data: { ids } });
    } catch (error) {
      next(error);
    }
  },

  async markAllNotificationsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: { userId: req.user!.userId, read: false },
        data: { read: true },
      });
      res.json({ success: true, data: { userId: req.user!.userId } });
    } catch (error) {
      next(error);
    }
  },

  async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notificationId = str(req.params.notificationId);
      if (!notificationId) throw new BadRequestError('notificationId is required');
      await prisma.notification.deleteMany({
        where: { id: notificationId, userId: req.user!.userId },
      });
      res.json({ success: true, data: { notificationId } });
    } catch (error) {
      next(error);
    }
  },

  async stripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = str(req.headers['stripe-signature']);
      const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
      if (!signature || !rawBody) throw new BadRequestError('Invalid webhook request');

      const event = stripeService.constructWebhookEvent(rawBody, signature);
      const exists = await prisma.stripeWebhookEvent.findUnique({ where: { eventId: event.id } });
      if (exists) {
        res.json({ success: true, data: { received: true, duplicate: true } });
        return;
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const invoiceId = session.metadata?.invoiceId;
        if (invoiceId) {
          const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
          if (invoice) {
            const paidAmount = (session.amount_total ?? 0) / 100;
            const currency = (session.currency ?? invoice.currency).toUpperCase();
            const providerPaymentId = typeof session.payment_intent === 'string' ? session.payment_intent : '';

            await prisma.$transaction(async (tx) => {
              const payment = await tx.payment.create({
                data: {
                  invoiceId,
                  amount: paidAmount,
                  currency,
                  method: 'CARD',
                  provider: 'stripe',
                  providerPaymentId: providerPaymentId || undefined,
                  status: 'SUCCEEDED',
                  transactionRef: session.id,
                },
              });
              const nextAmountPaid = invoice.amountPaid + paidAmount;
              const nextStatus = nextAmountPaid >= invoice.totalAmount ? 'PAID' : nextAmountPaid > 0 ? 'PARTIALLY_PAID' : 'ISSUED';
              await tx.invoice.update({
                where: { id: invoiceId },
                data: {
                  amountPaid: nextAmountPaid,
                  currency,
                  status: (invoice.dueDate < new Date() && nextStatus !== 'PAID' ? 'OVERDUE' : nextStatus) as any,
                  paidAt: nextAmountPaid >= invoice.totalAmount ? new Date() : invoice.paidAt,
                },
              });
              await tx.receipt.create({
                data: {
                  invoiceId,
                  paymentId: payment.id,
                  schoolId: invoice.schoolId,
                  parentId: invoice.parentId,
                  studentId: invoice.studentId,
                  amount: paidAmount,
                  currency,
                  provider: 'stripe',
                  providerRef: providerPaymentId || session.id,
                  fileName: `receipt-${invoiceId}-${payment.id}.pdf`,
                },
              });
            });
          }
        }
      } else if (event.type === 'payment_intent.payment_failed') {
        const intent = event.data.object as Stripe.PaymentIntent;
        const payment = await prisma.payment.findFirst({ where: { providerPaymentId: intent.id } });
        if (payment) {
          await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
        }
      } else if (event.type === 'charge.refunded') {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntent = typeof charge.payment_intent === 'string' ? charge.payment_intent : '';
        if (paymentIntent) {
          const payment = await prisma.payment.findFirst({
            where: { providerPaymentId: paymentIntent },
            include: { invoice: true },
          });
          if (payment) {
            const refundedAmount = (charge.amount_refunded ?? 0) / 100;
            await prisma.$transaction(async (tx) => {
              await tx.payment.update({
                where: { id: payment.id },
                data: {
                  refundedAmount,
                  status: refundedAmount >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
                },
              });
              const nextAmountPaid = Math.max(payment.invoice.amountPaid - refundedAmount, 0);
              await tx.invoice.update({
                where: { id: payment.invoiceId },
                data: {
                  amountPaid: nextAmountPaid,
                  status: (nextAmountPaid <= 0 ? 'REFUNDED' : payment.invoice.status) as any,
                },
              });
            });
          }
        }
      }

      await prisma.stripeWebhookEvent.create({
        data: {
          eventId: event.id,
          eventType: event.type,
          payload: event as unknown as Prisma.InputJsonValue,
        },
      });

      res.json({ success: true, data: { received: true } });
    } catch (error) {
      next(error);
    }
  },
};
