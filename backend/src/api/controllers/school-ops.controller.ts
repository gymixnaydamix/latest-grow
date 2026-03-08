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
type JsonRecord = Record<string, unknown>;

const asRecord = (value: unknown): JsonRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};

const asArray = <T = JsonRecord>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const nowId = (prefix: string): string => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const str = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : value == null ? fallback : String(value);

const num = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const bool = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return fallback;
};

const isoDate = (value: unknown, fallback = new Date()): string => {
  const date = value ? new Date(String(value)) : fallback;
  return Number.isNaN(date.getTime()) ? fallback.toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
};

const titleCase = (value: string): string =>
  value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());

const formatUserName = (user?: { firstName?: string | null; lastName?: string | null; email?: string | null }): string =>
  [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Unknown';

const userIdFromReq = (req: Request): string => req.user?.userId ?? '';

const normalizeAttendanceStatus = (value: unknown): string => {
  const raw = str(value, 'present').trim().toUpperCase();
  switch (raw) {
    case 'PRESENT':
    case 'ABSENT':
    case 'LATE':
    case 'EXCUSED':
      return raw;
    default:
      return 'PRESENT';
  }
};

const normalizeUiStatus = (value: unknown): string => titleCase(str(value, ''));

const toCurrency = (value: number): string => `$${value.toLocaleString()}`;

async function getSchoolSettings(schoolId: string): Promise<{ school: { id: string; settings: unknown; name?: string | null; address?: string | null; phone?: string | null; email?: string | null; website?: string | null }; settings: JsonRecord }> {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: {
      id: true,
      settings: true,
      name: true,
      address: true,
      phone: true,
      email: true,
      website: true,
    },
  });

  if (!school) throw new NotFoundError('School not found');
  return { school, settings: asRecord(school.settings) };
}

async function updateSchoolSettings(
  schoolId: string,
  updater: (settings: JsonRecord) => JsonRecord | Promise<JsonRecord>,
): Promise<JsonRecord> {
  const { settings } = await getSchoolSettings(schoolId);
  const nextSettings = await updater({ ...settings });
  await prisma.school.update({
    where: { id: schoolId },
    data: { settings: nextSettings as Prisma.InputJsonValue },
  });
  return nextSettings;
}

async function upsertSettingsArrayItem(
  schoolId: string,
  key: string,
  payload: JsonRecord & { id?: string },
): Promise<JsonRecord> {
  let saved: JsonRecord = {};

  await updateSchoolSettings(schoolId, (settings) => {
    const items = asArray<JsonRecord>(settings[key]);
    const incomingId = str(payload.id);
    if (incomingId) {
      const index = items.findIndex((item) => str(item.id) === incomingId);
      if (index >= 0) {
        saved = { ...items[index], ...payload, id: incomingId };
        items[index] = saved;
      } else {
        saved = { ...payload, id: incomingId };
        items.push(saved);
      }
    } else {
      saved = { ...payload, id: nowId(key) };
      items.push(saved);
    }

    return { ...settings, [key]: items };
  });

  return saved;
}

async function deleteSettingsArrayItem(schoolId: string, key: string, id: string): Promise<void> {
  await updateSchoolSettings(schoolId, (settings) => ({
    ...settings,
    [key]: asArray<JsonRecord>(settings[key]).filter((item) => str(item.id) !== id),
  }));
}

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
          course: { select: { id: true, name: true, gradeLevel: true } },
        },
        orderBy: { date: 'asc' },
      });

      res.json({
        success: true,
        data: records.map((record) => ({
          id: record.id,
          date: record.date.toISOString().slice(0, 10),
          status: String(record.status).toLowerCase(),
          grade: record.course?.gradeLevel ?? '',
          studentName: formatUserName(record.student),
          studentId: record.studentId,
          note: '',
          courseId: record.courseId,
        })),
      });
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
          course: { select: { id: true, name: true, gradeLevel: true } },
        },
        orderBy: { date: 'desc' },
        take: 100,
      });

      const grouped = records.reduce<Record<string, JsonRecord>>((acc, record) => {
        const key = `${record.studentId}:${record.status}`;
        if (!acc[key]) {
          acc[key] = {
            id: key,
            student: formatUserName(record.student),
            studentId: record.studentId,
            parentId: '',
            grade: record.course?.gradeLevel ?? '',
            type: record.status === 'ABSENT' ? 'Absence' : 'Late',
            count: 0,
            status: 'Open',
          };
        }
        acc[key].count = num(acc[key].count, 0) + 1;
        return acc;
      }, {});

      res.json({ success: true, data: Object.values(grouped) });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/attendance/corrections — placeholder (no model) */
  async corrections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { settings } = await getSchoolSettings(schoolId);
      const savedCorrections = asArray<JsonRecord>(settings.attendanceCorrections);

      if (savedCorrections.length > 0) {
        res.json({ success: true, data: savedCorrections });
        return;
      }

      const courses = await prisma.course.findMany({ where: { schoolId }, select: { id: true } });
      const courseIds = courses.map((course) => course.id);
      const records = await prisma.attendance.findMany({
        where: { courseId: { in: courseIds }, status: 'EXCUSED' },
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { date: 'desc' },
        take: 50,
      });

      res.json({
        success: true,
        data: records.map((record) => ({
          id: record.id,
          student: formatUserName(record.student),
          grade: '',
          date: record.date.toISOString().slice(0, 10),
          from: 'Absent',
          to: 'Excused',
          requestedBy: 'System',
          reason: 'Imported from excused attendance',
          status: 'Approved',
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/attendance/mark */
  async mark(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      let { studentId, courseId, date, status } = req.body;
      if (!courseId) {
        const fallbackCourse = await prisma.course.findFirst({
          where: {
            schoolId,
            ...(req.body.grade ? { gradeLevel: str(req.body.grade) } : {}),
          },
          select: { id: true },
          orderBy: { createdAt: 'asc' },
        });
        courseId = fallbackCourse?.id;
      }
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
          status: normalizeAttendanceStatus(status),
        },
        update: { status: normalizeAttendanceStatus(status) },
      });
      res.json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/attendance/corrections */
  async createCorrection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const correction = await upsertSettingsArrayItem(schoolId, 'attendanceCorrections', {
        student: str(req.body.student),
        grade: str(req.body.grade),
        date: isoDate(req.body.date),
        from: str(req.body.from),
        to: str(req.body.to),
        requestedBy: str(req.body.requestedBy || req.user?.email || 'Admin'),
        reason: str(req.body.reason),
        status: str(req.body.status || 'Pending'),
      });

      res.status(201).json({ success: true, data: correction });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/attendance/corrections/:id */
  async approveCorrection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const { status } = req.body;

      const { settings } = await getSchoolSettings(schoolId);
      const corrections = asArray<JsonRecord>(settings.attendanceCorrections);
      const index = corrections.findIndex((item) => str(item.id) === id);
      if (index >= 0) {
        corrections[index] = {
          ...corrections[index],
          status: str(status || 'Approved'),
          reviewedAt: new Date().toISOString(),
        };
        await updateSchoolSettings(schoolId, (current) => ({
          ...current,
          attendanceCorrections: corrections,
        }));
        res.json({ success: true, data: corrections[index] });
        return;
      }

      const record = await prisma.attendance.update({
        where: { id },
        data: { status: normalizeAttendanceStatus(status ?? 'EXCUSED') },
      });
      res.json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /admin/schools/:schoolId/attendance/:id */
  async deleteRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = p(req.params.id);
      await prisma.attendance.delete({ where: { id } });
      res.json({ success: true, data: null, message: 'Attendance record deleted' });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /admin/schools/:schoolId/attendance/corrections/:id */
  async deleteCorrection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      await deleteSettingsArrayItem(schoolId, 'attendanceCorrections', id);
      res.json({ success: true, data: null, message: 'Correction deleted' });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/attendance/export */
  async export(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const from = str((req.query as JsonRecord).from);
      const to = str((req.query as JsonRecord).to);
      const courses = await prisma.course.findMany({ where: { schoolId }, select: { id: true } });
      const courseIds = courses.map((course) => course.id);
      const where: Prisma.AttendanceWhereInput = {
        courseId: { in: courseIds },
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
              },
            }
          : {}),
      };
      const records = await prisma.attendance.findMany({
        where,
        include: {
          student: { select: { firstName: true, lastName: true } },
          course: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
      });

      const rows = [
        'id,date,student,course,status',
        ...records.map((record) =>
          [
            record.id,
            record.date.toISOString().slice(0, 10),
            `"${formatUserName(record.student)}"`,
            `"${record.course?.name ?? ''}"`,
            record.status,
          ].join(','),
        ),
      ];

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="attendance-${schoolId}.csv"`);
      res.send(rows.join('\n'));
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
      const { settings } = await getSchoolSettings(schoolId);
      const academicYears = asArray<JsonRecord>(settings.academicYears);
      const fallbackYears = academicYears.length > 0 ? academicYears : [
        {
          id: nowId('academic_year'),
          name: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
          startDate: `${new Date().getFullYear()}-09-01`,
          endDate: `${new Date().getFullYear() + 1}-06-30`,
          terms: 3,
          status: 'Active',
          students: 0,
          staff: 0,
        },
      ];

      res.json({ success: true, data: fallbackYears });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/academics/classes — uses Course model */
  async classes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { settings } = await getSchoolSettings(schoolId);
      const classMeta = asRecord(settings.classMeta);
      const courses = await prisma.course.findMany({
        where: { schoolId },
        include: {
          teacher: { select: { id: true, firstName: true, lastName: true } },
          department: { select: { id: true, name: true } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { name: 'asc' },
      });
      res.json({
        success: true,
        data: courses.map((course) => {
          const meta = asRecord(classMeta[course.id]);
          return {
            ...course,
            level: str(meta.level || course.gradeLevel),
            section: str(meta.section, 'A'),
            classTeacher: str(meta.classTeacher || formatUserName(course.teacher)),
            room: str(meta.room),
            students: num(meta.students, course._count.enrollments),
            capacity: num(meta.capacity, 30),
            subjects: num(meta.subjects, 0),
          };
        }),
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/academics/subjects — distinct subjects from courses */
  async subjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { settings } = await getSchoolSettings(schoolId);
      const savedSubjects = asArray<JsonRecord>(settings.subjectCatalog);
      if (savedSubjects.length > 0) {
        res.json({ success: true, data: savedSubjects });
        return;
      }

      const courses = await prisma.course.findMany({
        where: { schoolId },
        select: {
          id: true,
          name: true,
          gradeLevel: true,
          teacher: { select: { firstName: true, lastName: true } },
          department: { select: { name: true } },
        },
        distinct: ['name'],
        orderBy: { name: 'asc' },
      });
      res.json({
        success: true,
        data: courses.map((course, index) => ({
          id: course.id,
          name: course.name,
          code: course.name.slice(0, 4).toUpperCase() || `SUB${index + 1}`,
          department: course.department?.name ?? 'General',
          credits: 1,
          teacher: formatUserName(course.teacher),
          classes: course.gradeLevel,
          periods: 5,
        })),
      });
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
      const { settings } = await getSchoolSettings(schoolId);
      const teacherAssignments = asArray<JsonRecord>(settings.teacherAssignments);
      if (teacherAssignments.length > 0) {
        res.json({ success: true, data: teacherAssignments });
        return;
      }

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
      const {
        name,
        description,
        gradeLevel,
        semester,
        teacherId,
        departmentId,
        level,
        section,
        classTeacher,
        room,
        capacity,
        students,
        subjects,
      } = req.body;
      if (!name) throw new BadRequestError('name is required');

      const course = await prisma.course.create({
        data: {
          schoolId,
          name,
          description: description ?? '',
          gradeLevel: gradeLevel ?? level ?? '',
          semester: semester ?? '',
          teacherId: teacherId ?? null,
          departmentId: departmentId ?? null,
        },
      });
      await updateSchoolSettings(schoolId, (settings) => {
        const classMeta = asRecord(settings.classMeta);
        classMeta[course.id] = {
          section: str(section, 'A'),
          classTeacher: str(classTeacher),
          room: str(room),
          capacity: num(capacity, 30),
          students: num(students, 0),
          subjects: num(subjects, 0),
          level: str(level || gradeLevel),
        };
        return { ...settings, classMeta };
      });
      res.status(201).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/academics/classes/:id */
  async updateClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const { name, description, gradeLevel, semester, teacherId, departmentId, level, section, classTeacher, room, capacity, students, subjects } = req.body;
      const course = await prisma.course.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...((gradeLevel !== undefined || level !== undefined) && { gradeLevel: gradeLevel ?? level }),
          ...(semester !== undefined && { semester }),
          ...(teacherId !== undefined && { teacherId }),
          ...(departmentId !== undefined && { departmentId }),
        },
      });
      await updateSchoolSettings(schoolId, (settings) => {
        const classMeta = asRecord(settings.classMeta);
        const existing = asRecord(classMeta[id]);
        classMeta[id] = {
          ...existing,
          ...(section !== undefined && { section }),
          ...(classTeacher !== undefined && { classTeacher }),
          ...(room !== undefined && { room }),
          ...(capacity !== undefined && { capacity: num(capacity, 30) }),
          ...(students !== undefined && { students: num(students, 0) }),
          ...(subjects !== undefined && { subjects: num(subjects, 0) }),
          ...((level !== undefined || gradeLevel !== undefined) && { level: str(level ?? gradeLevel) }),
        };
        return { ...settings, classMeta };
      });
      res.json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /admin/schools/:schoolId/academics/classes/:id */
  async deleteClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      await prisma.course.delete({ where: { id } });
      await updateSchoolSettings(schoolId, (settings) => {
        const classMeta = asRecord(settings.classMeta);
        delete classMeta[id];
        return { ...settings, classMeta };
      });
      res.json({ success: true, data: null, message: 'Class deleted' });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/academics/years */
  async createYear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const year = await upsertSettingsArrayItem(schoolId, 'academicYears', {
        name: str(req.body.name),
        startDate: isoDate(req.body.startDate),
        endDate: isoDate(req.body.endDate),
        terms: num(req.body.terms, 3),
        status: str(req.body.status, 'Planning'),
        students: num(req.body.students, 0),
        staff: num(req.body.staff, 0),
      });
      res.status(201).json({ success: true, data: year });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/academics/years/:id */
  async updateYear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const year = await upsertSettingsArrayItem(schoolId, 'academicYears', {
        id,
        ...req.body,
        ...(req.body.startDate !== undefined && { startDate: isoDate(req.body.startDate) }),
        ...(req.body.endDate !== undefined && { endDate: isoDate(req.body.endDate) }),
        ...(req.body.terms !== undefined && { terms: num(req.body.terms, 3) }),
      });
      res.json({ success: true, data: year });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/academics/subjects */
  async createSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const subject = await upsertSettingsArrayItem(schoolId, 'subjectCatalog', {
        name: str(req.body.name),
        code: str(req.body.code || req.body.name).slice(0, 12).toUpperCase(),
        department: str(req.body.department, 'General'),
        credits: num(req.body.credits, 1),
        teacher: str(req.body.teacher),
        classes: str(req.body.classes),
        periods: num(req.body.periods, 5),
      });
      res.status(201).json({ success: true, data: subject });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/academics/subjects/:id */
  async updateSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const subject = await upsertSettingsArrayItem(schoolId, 'subjectCatalog', {
        id,
        ...req.body,
        ...(req.body.credits !== undefined && { credits: num(req.body.credits, 1) }),
        ...(req.body.periods !== undefined && { periods: num(req.body.periods, 5) }),
      });
      res.json({ success: true, data: subject });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /admin/schools/:schoolId/academics/subjects/:id */
  async deleteSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      await deleteSettingsArrayItem(schoolId, 'subjectCatalog', id);
      res.json({ success: true, data: null, message: 'Subject deleted' });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/academics/promotion */
  async promotion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { settings } = await getSchoolSettings(schoolId);
      res.json({ success: true, data: asArray<JsonRecord>(settings.promotionRules) });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/academics/promotion */
  async createPromotionRule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const rule = await upsertSettingsArrayItem(schoolId, 'promotionRules', {
        fromGrade: str(req.body.fromGrade),
        toGrade: str(req.body.toGrade),
        minAttendance: str(req.body.minAttendance),
        minGPA: str(req.body.minGPA),
        passingSubjects: str(req.body.passingSubjects),
        status: str(req.body.status || 'Active'),
      });
      res.status(201).json({ success: true, data: rule });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/academics/promotion/:id */
  async updatePromotionRule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const rule = await upsertSettingsArrayItem(schoolId, 'promotionRules', { id, ...req.body });
      res.json({ success: true, data: rule });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/academics/assignments */
  async createTeacherAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const assignment = await upsertSettingsArrayItem(schoolId, 'teacherAssignments', {
        teacher: str(req.body.teacher),
        subject: str(req.body.subject),
        classes: str(req.body.classes),
        periodsPerWeek: num(req.body.periodsPerWeek || req.body.periods, 0),
        status: str(req.body.status || 'Active'),
      });
      res.status(201).json({ success: true, data: assignment });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/academics/assignments/:id */
  async updateTeacherAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const assignment = await upsertSettingsArrayItem(schoolId, 'teacherAssignments', {
        id,
        ...req.body,
        ...(req.body.periodsPerWeek !== undefined && { periodsPerWeek: num(req.body.periodsPerWeek, 0) }),
      });
      res.json({ success: true, data: assignment });
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
      res.json({
        success: true,
        data: invoices.map((invoice) => {
          const items = asArray<JsonRecord>(invoice.items);
          const firstItem = items[0] ?? {};
          return {
            ...invoice,
            invoiceNo: `INV-${invoice.id.slice(-6).toUpperCase()}`,
            student: str(firstItem.student || invoice.studentId),
            grade: str(firstItem.grade),
            amount: toCurrency(invoice.totalAmount),
            paid: toCurrency(invoice.amountPaid),
            balance: toCurrency(Math.max(invoice.totalAmount - invoice.amountPaid, 0)),
            dueDate: invoice.dueDate.toISOString().slice(0, 10),
            type: str(firstItem.description, 'Tuition'),
            status: titleCase(String(invoice.status).replace(/_/g, ' ')).replace('Partially Paid', 'Partial'),
          };
        }),
      });
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
      res.json({
        success: true,
        data: payments.map((payment) => ({
          ...payment,
          invoiceRef: payment.invoiceId,
          student: payment.invoice.studentId,
          receivedDate: payment.paidAt.toISOString().slice(0, 10),
          reference: payment.transactionRef,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/finance/fees — tuition plans as fee structure */
  async fees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { settings } = await getSchoolSettings(schoolId);
      const feeMeta = asRecord(settings.financeFeeMeta);
      const plans = await prisma.tuitionPlan.findMany({
        where: { schoolId },
        orderBy: { name: 'asc' },
      });
      res.json({
        success: true,
        data: plans.map((plan) => {
          const meta = asRecord(feeMeta[plan.id]);
          return {
            ...plan,
            category: str(meta.category || plan.gradeLevel),
            mandatory: bool(meta.mandatory, true),
          };
        }),
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/finance/discounts — from school settings JSON */
  async discounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { settings } = await getSchoolSettings(schoolId);
      const discounts = asArray<JsonRecord>(settings.discounts);
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
      res.json({
        success: true,
        data: overdue.map((invoice) => {
          const items = asArray<JsonRecord>(invoice.items);
          const firstItem = items[0] ?? {};
          return {
            ...invoice,
            invoiceNo: `INV-${invoice.id.slice(-6).toUpperCase()}`,
            student: str(firstItem.student || invoice.studentId),
            grade: str(firstItem.grade),
            amount: toCurrency(invoice.totalAmount),
            paid: toCurrency(invoice.amountPaid),
            balance: toCurrency(Math.max(invoice.totalAmount - invoice.amountPaid, 0)),
            dueDate: invoice.dueDate.toISOString().slice(0, 10),
            type: str(firstItem.description, 'Tuition'),
            status: 'Overdue',
          };
        }),
      });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/finance/invoices */
  async generateInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const {
        parentId,
        studentId,
        items,
        totalAmount,
        dueDate,
        currency,
        student,
        grade,
        amount,
        paid,
        type,
        status,
      } = req.body;
      const invoiceTotal = totalAmount !== undefined ? num(totalAmount) : num(amount);
      const invoiceStudentId = str(studentId || student);
      const invoiceParentId = str(parentId || invoiceStudentId);
      if (!parentId || !studentId || !totalAmount || !dueDate) {
        if (!invoiceParentId || !invoiceStudentId || !invoiceTotal || !dueDate) {
          throw new BadRequestError('parentId, studentId, totalAmount, and dueDate required');
        }
      }

      const invoice = await prisma.invoice.create({
        data: {
          schoolId,
          parentId: invoiceParentId,
          studentId: invoiceStudentId,
          items: (items ?? [
            {
              description: str(type || 'Tuition'),
              grade: str(grade),
              student: str(student),
              amount: invoiceTotal,
            },
          ]) as Prisma.InputJsonValue,
          totalAmount: invoiceTotal,
          amountPaid: num(paid),
          currency: currency ?? 'USD',
          dueDate: new Date(dueDate),
          status:
            str(status).toUpperCase() === 'PAID'
              ? 'PAID'
              : str(status).toUpperCase() === 'PARTIAL'
                ? 'PARTIAL'
                : str(status).toUpperCase() === 'OVERDUE'
                  ? 'OVERDUE'
                  : 'ISSUED',
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
      const { invoiceId, amount, method, provider, transactionRef, invoiceRef, reference, receivedDate, notes } = req.body;
      const resolvedInvoiceId = str(invoiceId || invoiceRef);
      const paymentAmount = num(amount);
      if (!resolvedInvoiceId || !paymentAmount || !method) {
        throw new BadRequestError('invoiceId, amount, and method are required');
      }

      const payment = await prisma.payment.create({
        data: {
          invoiceId: resolvedInvoiceId,
          amount: paymentAmount,
          method,
          provider: provider ?? 'manual',
          transactionRef: str(transactionRef || reference),
          metadata: { notes: str(notes) } as Prisma.InputJsonValue,
          paidAt: receivedDate ? new Date(receivedDate) : new Date(),
        },
      });

      // Update invoice amountPaid
      const updatedInvoice = await prisma.invoice.update({
        where: { id: resolvedInvoiceId },
        data: { amountPaid: { increment: paymentAmount } },
      });

      const nextStatus =
        updatedInvoice.amountPaid >= updatedInvoice.totalAmount
          ? 'PAID'
          : updatedInvoice.amountPaid > 0
            ? 'PARTIAL'
            : updatedInvoice.status;

      await prisma.invoice.update({
        where: { id: resolvedInvoiceId },
        data: { status: nextStatus as never, ...(nextStatus === 'PAID' ? { paidAt: new Date() } : {}) },
      });

      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/finance/invoices/:id */
  async updateInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = p(req.params.id);
      const data: Prisma.InvoiceUpdateInput = {
        ...(req.body.amount !== undefined && { totalAmount: num(req.body.amount) }),
        ...(req.body.paid !== undefined && { amountPaid: num(req.body.paid) }),
        ...(req.body.dueDate !== undefined && { dueDate: new Date(String(req.body.dueDate)) }),
        ...(req.body.status !== undefined && { status: str(req.body.status).toUpperCase() as never }),
        ...(req.body.type !== undefined || req.body.student !== undefined || req.body.grade !== undefined
          ? {
              items: [
                {
                  description: str(req.body.type),
                  student: str(req.body.student),
                  grade: str(req.body.grade),
                  amount: num(req.body.amount),
                },
              ] as Prisma.InputJsonValue,
            }
          : {}),
      };
      const invoice = await prisma.invoice.update({ where: { id }, data });
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/finance/fees */
  async createFeeType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const fee = await prisma.tuitionPlan.create({
        data: {
          schoolId,
          name: str(req.body.name),
          gradeLevel: str(req.body.category || req.body.gradeLevel || 'All'),
          amount: num(req.body.amount),
          frequency: str(req.body.frequency || 'TERM').toUpperCase().replace(/\s+/g, '_'),
        },
      });
      await updateSchoolSettings(schoolId, (settings) => {
        const meta = asRecord(settings.financeFeeMeta);
        meta[fee.id] = {
          category: str(req.body.category || 'Academic'),
          mandatory: bool(req.body.mandatory, true),
        };
        return { ...settings, financeFeeMeta: meta };
      });
      res.status(201).json({ success: true, data: fee });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/finance/fees/:id */
  async updateFeeType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const fee = await prisma.tuitionPlan.update({
        where: { id },
        data: {
          ...(req.body.name !== undefined && { name: str(req.body.name) }),
          ...((req.body.category !== undefined || req.body.gradeLevel !== undefined) && { gradeLevel: str(req.body.category || req.body.gradeLevel) }),
          ...(req.body.amount !== undefined && { amount: num(req.body.amount) }),
          ...(req.body.frequency !== undefined && { frequency: str(req.body.frequency).toUpperCase().replace(/\s+/g, '_') }),
        },
      });
      await updateSchoolSettings(schoolId, (settings) => {
        const meta = asRecord(settings.financeFeeMeta);
        meta[id] = {
          ...asRecord(meta[id]),
          ...(req.body.category !== undefined && { category: str(req.body.category) }),
          ...(req.body.mandatory !== undefined && { mandatory: bool(req.body.mandatory) }),
        };
        return { ...settings, financeFeeMeta: meta };
      });
      res.json({ success: true, data: fee });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /admin/schools/:schoolId/finance/fees/:id */
  async deleteFeeType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      await prisma.tuitionPlan.delete({ where: { id } });
      await updateSchoolSettings(schoolId, (settings) => {
        const meta = asRecord(settings.financeFeeMeta);
        delete meta[id];
        return { ...settings, financeFeeMeta: meta };
      });
      res.json({ success: true, data: null, message: 'Fee deleted' });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/finance/discounts */
  async createDiscount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const discount = await upsertSettingsArrayItem(schoolId, 'discounts', {
        name: str(req.body.name),
        type: str(req.body.type || 'percent'),
        value: str(req.body.value),
        applicableGrades: str(req.body.applicableGrades),
        validity: str(req.body.validity),
        status: str(req.body.status || 'Active'),
      });
      res.status(201).json({ success: true, data: discount });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/finance/discounts/:id */
  async updateDiscount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const discount = await upsertSettingsArrayItem(schoolId, 'discounts', { id, ...req.body });
      res.json({ success: true, data: discount });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /admin/schools/:schoolId/finance/discounts/:id */
  async deleteDiscount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      await deleteSettingsArrayItem(schoolId, 'discounts', id);
      res.json({ success: true, data: null, message: 'Discount deleted' });
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
      const { settings } = await getSchoolSettings(schoolId);
      const routeMeta = asRecord(settings.transportRouteMeta);
      const routes = await prisma.transportRoute.findMany({
        where: { schoolId },
        include: { stops: { orderBy: { sequence: 'asc' } }, _count: { select: { assignments: true } } },
        orderBy: { name: 'asc' },
      });
      res.json({
        success: true,
        data: routes.map((route) => {
          const meta = asRecord(routeMeta[route.id]);
          return {
            ...route,
            driver: route.driverName,
            vehicle: route.vehicleNumber,
            students: num(meta.students, route._count.assignments),
            stops: num(meta.stops, route.stops.length),
            morningTime: str(meta.morningTime),
            afternoonTime: str(meta.afternoonTime),
            status: str(meta.status, route.isActive ? 'Active' : 'Suspended'),
          };
        }),
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/transport/vehicles */
  async vehicles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { settings } = await getSchoolSettings(schoolId);
      const vehicleMeta = asRecord(settings.transportVehicleMeta);
      const vehicles = await prisma.vehicle.findMany({
        where: { schoolId },
        orderBy: { code: 'asc' },
      });
      res.json({
        success: true,
        data: vehicles.map((vehicle) => {
          const meta = asRecord(vehicleMeta[vehicle.id]);
          return {
            ...vehicle,
            regNumber: vehicle.plateNumber,
            driver: vehicle.driverName,
            type: str(meta.type, 'Bus'),
            insuranceExpiry: str(meta.insuranceExpiry),
            lastService: str(meta.lastService),
            nextService: str(meta.nextService),
            status: str(meta.status, vehicle.isActive ? 'Active' : 'Retired'),
          };
        }),
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/transport/assignments */
  async assignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { settings } = await getSchoolSettings(schoolId);
      const assignmentMeta = asRecord(settings.transportAssignmentMeta);
      const assignments = await prisma.transportAssignment.findMany({
        where: { schoolId },
        include: {
          route: { select: { id: true, name: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          stop: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json({
        success: true,
        data: assignments.map((assignment) => {
          const meta = asRecord(assignmentMeta[assignment.id]);
          return {
            ...assignment,
            student: str(meta.student || formatUserName(assignment.user)),
            grade: str(meta.grade),
            route: str(meta.route || assignment.route.name),
            stop: str(meta.stop || assignment.stop?.name),
            pickupTime: str(meta.pickupTime),
            dropTime: str(meta.dropTime),
            status: str(meta.status || normalizeUiStatus(assignment.status)),
          };
        }),
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/transport/incidents — from tracking events */
  async incidents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { settings } = await getSchoolSettings(schoolId);
      const savedIncidents = asArray<JsonRecord>(settings.transportIncidents);
      if (savedIncidents.length > 0) {
        res.json({ success: true, data: savedIncidents });
        return;
      }

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
      const { name, code, driverName, vehicleNumber, capacity, driver, vehicle, students, stops, morningTime, afternoonTime, status } = req.body;
      if (!name) throw new BadRequestError('name is required');

      const route = await prisma.transportRoute.create({
        data: {
          schoolId,
          name,
          code: code ?? '',
          driverName: driverName ?? driver ?? '',
          vehicleNumber: vehicleNumber ?? vehicle ?? '',
          capacity: num(capacity, 0),
        },
      });
      await updateSchoolSettings(schoolId, (settings) => {
        const routeMeta = asRecord(settings.transportRouteMeta);
        routeMeta[route.id] = {
          students: num(students, 0),
          stops: num(stops, 0),
          morningTime: str(morningTime),
          afternoonTime: str(afternoonTime),
          status: str(status, 'Active'),
        };
        return { ...settings, transportRouteMeta: routeMeta };
      });
      res.status(201).json({ success: true, data: route });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/transport/incidents */
  async reportIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { assignmentId, status, note, recordedBy } = req.body;
      if (!assignmentId || !status) {
        const incident = await upsertSettingsArrayItem(schoolId, 'transportIncidents', {
          route: str(req.body.route),
          vehicle: str(req.body.vehicle),
          date: isoDate(req.body.date),
          type: str(req.body.type),
          description: str(req.body.description || note),
          severity: str(req.body.severity || 'Medium'),
          status: str(req.body.status || 'Open'),
          actionTaken: str(req.body.actionTaken),
        });
        res.status(201).json({ success: true, data: incident });
        return;
      }

      const event = await prisma.transportTrackingEvent.create({
        data: {
          assignmentId,
          status,
          note: note ?? '',
          recordedBy: recordedBy ?? userIdFromReq(req),
          recordedAt: new Date(),
        },
      });
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/transport/routes/:id */
  async updateRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const route = await prisma.transportRoute.update({
        where: { id },
        data: {
          ...(req.body.name !== undefined && { name: str(req.body.name) }),
          ...((req.body.driver !== undefined || req.body.driverName !== undefined) && { driverName: str(req.body.driver ?? req.body.driverName) }),
          ...((req.body.vehicle !== undefined || req.body.vehicleNumber !== undefined) && { vehicleNumber: str(req.body.vehicle ?? req.body.vehicleNumber) }),
          ...(req.body.capacity !== undefined && { capacity: num(req.body.capacity, 0) }),
        },
      });
      await updateSchoolSettings(schoolId, (settings) => {
        const routeMeta = asRecord(settings.transportRouteMeta);
        routeMeta[id] = {
          ...asRecord(routeMeta[id]),
          ...(req.body.students !== undefined && { students: num(req.body.students, 0) }),
          ...(req.body.stops !== undefined && { stops: num(req.body.stops, 0) }),
          ...(req.body.morningTime !== undefined && { morningTime: str(req.body.morningTime) }),
          ...(req.body.afternoonTime !== undefined && { afternoonTime: str(req.body.afternoonTime) }),
          ...(req.body.status !== undefined && { status: str(req.body.status) }),
        };
        return { ...settings, transportRouteMeta: routeMeta };
      });
      res.json({ success: true, data: route });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /admin/schools/:schoolId/transport/routes/:id */
  async deleteRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      await prisma.transportRoute.delete({ where: { id } });
      await updateSchoolSettings(schoolId, (settings) => {
        const routeMeta = asRecord(settings.transportRouteMeta);
        delete routeMeta[id];
        return { ...settings, transportRouteMeta: routeMeta };
      });
      res.json({ success: true, data: null, message: 'Route deleted' });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/transport/vehicles */
  async createVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const vehicle = await prisma.vehicle.create({
        data: {
          schoolId,
          code: str(req.body.code || req.body.regNumber || nowId('vehicle')).slice(0, 48),
          plateNumber: str(req.body.regNumber || req.body.plateNumber),
          capacity: num(req.body.capacity, 0),
          driverName: str(req.body.driver || req.body.driverName),
          driverPhone: str(req.body.driverPhone),
          isActive: str(req.body.status, 'Active') !== 'Retired',
        },
      });
      await updateSchoolSettings(schoolId, (settings) => {
        const vehicleMeta = asRecord(settings.transportVehicleMeta);
        vehicleMeta[vehicle.id] = {
          type: str(req.body.type || 'Bus'),
          insuranceExpiry: isoDate(req.body.insuranceExpiry),
          lastService: isoDate(req.body.lastService),
          nextService: isoDate(req.body.nextService),
          status: str(req.body.status, 'Active'),
        };
        return { ...settings, transportVehicleMeta: vehicleMeta };
      });
      res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/transport/vehicles/:id */
  async updateVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const vehicle = await prisma.vehicle.update({
        where: { id },
        data: {
          ...((req.body.regNumber !== undefined || req.body.plateNumber !== undefined) && { plateNumber: str(req.body.regNumber ?? req.body.plateNumber) }),
          ...(req.body.capacity !== undefined && { capacity: num(req.body.capacity, 0) }),
          ...((req.body.driver !== undefined || req.body.driverName !== undefined) && { driverName: str(req.body.driver ?? req.body.driverName) }),
          ...(req.body.status !== undefined && { isActive: str(req.body.status) !== 'Retired' }),
        },
      });
      await updateSchoolSettings(schoolId, (settings) => {
        const vehicleMeta = asRecord(settings.transportVehicleMeta);
        vehicleMeta[id] = {
          ...asRecord(vehicleMeta[id]),
          ...(req.body.type !== undefined && { type: str(req.body.type) }),
          ...(req.body.insuranceExpiry !== undefined && { insuranceExpiry: isoDate(req.body.insuranceExpiry) }),
          ...(req.body.lastService !== undefined && { lastService: isoDate(req.body.lastService) }),
          ...(req.body.nextService !== undefined && { nextService: isoDate(req.body.nextService) }),
          ...(req.body.status !== undefined && { status: str(req.body.status) }),
        };
        return { ...settings, transportVehicleMeta: vehicleMeta };
      });
      res.json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /admin/schools/:schoolId/transport/vehicles/:id */
  async deleteVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      await prisma.vehicle.delete({ where: { id } });
      await updateSchoolSettings(schoolId, (settings) => {
        const vehicleMeta = asRecord(settings.transportVehicleMeta);
        delete vehicleMeta[id];
        return { ...settings, transportVehicleMeta: vehicleMeta };
      });
      res.json({ success: true, data: null, message: 'Vehicle deleted' });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/transport/assignments/:id */
  async updateAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const assignment = await prisma.transportAssignment.update({
        where: { id },
        data: {
          ...(req.body.routeId !== undefined && { routeId: str(req.body.routeId) }),
          ...(req.body.stopId !== undefined && { stopId: req.body.stopId ? str(req.body.stopId) : null }),
          ...(req.body.status !== undefined && { status: str(req.body.status).toUpperCase() }),
          ...(req.body.notes !== undefined && { notes: str(req.body.notes) }),
        },
      });
      await updateSchoolSettings(schoolId, (settings) => {
        const assignmentMeta = asRecord(settings.transportAssignmentMeta);
        assignmentMeta[id] = {
          ...asRecord(assignmentMeta[id]),
          ...(req.body.student !== undefined && { student: str(req.body.student) }),
          ...(req.body.grade !== undefined && { grade: str(req.body.grade) }),
          ...(req.body.route !== undefined && { route: str(req.body.route) }),
          ...(req.body.stop !== undefined && { stop: str(req.body.stop) }),
          ...(req.body.pickupTime !== undefined && { pickupTime: str(req.body.pickupTime) }),
          ...(req.body.dropTime !== undefined && { dropTime: str(req.body.dropTime) }),
          ...(req.body.status !== undefined && { status: str(req.body.status) }),
        };
        return { ...settings, transportAssignmentMeta: assignmentMeta };
      });
      res.json({ success: true, data: assignment });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/transport/incidents/:id */
  async updateIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const incident = await upsertSettingsArrayItem(schoolId, 'transportIncidents', { id, ...req.body });
      res.json({ success: true, data: incident });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /admin/schools/:schoolId/transport/incidents/:id */
  async deleteIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      await deleteSettingsArrayItem(schoolId, 'transportIncidents', id);
      res.json({ success: true, data: null, message: 'Incident deleted' });
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
      const { settings } = await getSchoolSettings(schoolId);
      const roomMeta = asRecord(settings.facilityRoomMeta);
      const facilities = await prisma.facility.findMany({
        where: { schoolId },
        include: { _count: { select: { bookings: true, maintenanceRequests: true } } },
        orderBy: { name: 'asc' },
      });
      res.json({
        success: true,
        data: facilities.map((facility) => {
          const meta = asRecord(roomMeta[facility.id]);
          return {
            ...facility,
            floor: str(meta.floor),
            allocated: str(meta.allocated),
            status: str(meta.status, titleCase(String(facility.status))),
          };
        }),
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/facilities/maintenance */
  async maintenance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { settings } = await getSchoolSettings(schoolId);
      const maintenanceMeta = asRecord(settings.maintenanceMeta);
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
      res.json({
        success: true,
        data: requests.map((request) => {
          const meta = asRecord(maintenanceMeta[request.id]);
          return {
            ...request,
            room: str(meta.room || request.facility?.name),
            type: str(meta.type || request.title),
            status: str(meta.status, titleCase(String(request.status))),
            reportedAt: request.requestedAt.toISOString().slice(0, 10),
            assignedTo: str(request.assignee ? formatUserName(request.assignee) : meta.assignedTo),
            completedAt: str(meta.completedAt),
          };
        }),
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/facilities/assets — from school settings JSON */
  async assets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { settings } = await getSchoolSettings(schoolId);
      const assets = asArray<JsonRecord>(settings.assets);
      res.json({ success: true, data: assets });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/facilities/bookings */
  async bookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { settings } = await getSchoolSettings(schoolId);
      const bookingMeta = asRecord(settings.facilityBookingMeta);
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
      res.json({
        success: true,
        data: bookings.map((booking) => {
          const meta = asRecord(bookingMeta[booking.id]);
          return {
            ...booking,
            room: booking.facility?.name ?? '',
            event: str(meta.event || booking.purpose),
            date: booking.startTime.toISOString().slice(0, 10),
            time: `${booking.startTime.toISOString().slice(11, 16)}-${booking.endTime.toISOString().slice(11, 16)}`,
            bookedBy: str(meta.bookedBy || formatUserName(booking.user)),
            status: str(meta.status, 'Confirmed'),
          };
        }),
      });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/facilities/maintenance */
  async createMaintenanceRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { title, description, facilityId, priority, assignedTo, requestedBy, room, type, vehicleId, reportedAt } = req.body;
      const resolvedTitle = str(title || type || room || 'Maintenance');
      if (!resolvedTitle || !description) throw new BadRequestError('title and description are required');

      const request = await prisma.maintenanceRequest.create({
        data: {
          schoolId,
          facilityId: facilityId ?? null,
          title: resolvedTitle,
          description,
          priority: str(priority || 'MEDIUM').toUpperCase() as never,
          assignedTo: assignedTo ?? null,
          requestedBy: requestedBy ?? userIdFromReq(req),
          requestedAt: reportedAt ? new Date(String(reportedAt)) : new Date(),
        },
      });
      if (room || type || vehicleId) {
        await updateSchoolSettings(schoolId, (settings) => {
          const maintenanceMeta = asRecord(settings.maintenanceMeta);
          maintenanceMeta[request.id] = {
            room: str(room),
            type: str(type || title || 'General'),
            vehicleId: str(vehicleId),
            status: str(req.body.status || 'Reported'),
            completedAt: str(req.body.completedAt),
          };
          return { ...settings, maintenanceMeta };
        });
      }
      res.status(201).json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/facilities/bookings */
  async book(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facilityId, startTime, endTime, purpose, reservedBy, roomId, date, event, bookedBy, status } = req.body;
      const resolvedFacilityId = str(facilityId || roomId);
      if (!resolvedFacilityId || !startTime || !endTime) {
        throw new BadRequestError('facilityId, startTime, and endTime are required');
      }

      const booking = await prisma.facilityBooking.create({
        data: {
          facilityId: resolvedFacilityId,
          reservedBy: reservedBy ?? bookedBy ?? userIdFromReq(req),
          startTime: date ? new Date(`${date}T${startTime}`) : new Date(startTime),
          endTime: date ? new Date(`${date}T${endTime}`) : new Date(endTime),
          purpose: purpose ?? '',
        },
      });
      const schoolId = p(req.params.schoolId);
      await updateSchoolSettings(schoolId, (settings) => {
        const bookingMeta = asRecord(settings.facilityBookingMeta);
        bookingMeta[booking.id] = {
          event: str(event || purpose),
          status: str(status || 'Confirmed'),
          bookedBy: str(bookedBy || reservedBy),
        };
        return { ...settings, facilityBookingMeta: bookingMeta };
      });
      res.status(201).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/facilities/rooms */
  async createRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const room = await prisma.facility.create({
        data: {
          schoolId,
          name: str(req.body.name),
          type: str(req.body.type || 'Room'),
          capacity: num(req.body.capacity, 0),
          status: str(req.body.status || 'AVAILABLE').toUpperCase().replace(/\s+/g, '_') as never,
        },
      });
      await updateSchoolSettings(schoolId, (settings) => {
        const roomMeta = asRecord(settings.facilityRoomMeta);
        roomMeta[room.id] = {
          floor: str(req.body.floor),
          allocated: str(req.body.allocated),
          status: str(req.body.status || 'Available'),
        };
        return { ...settings, facilityRoomMeta: roomMeta };
      });
      res.status(201).json({ success: true, data: room });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/facilities/rooms/:id */
  async updateRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const room = await prisma.facility.update({
        where: { id },
        data: {
          ...(req.body.name !== undefined && { name: str(req.body.name) }),
          ...(req.body.type !== undefined && { type: str(req.body.type) }),
          ...(req.body.capacity !== undefined && { capacity: num(req.body.capacity, 0) }),
          ...(req.body.status !== undefined && { status: str(req.body.status).toUpperCase().replace(/\s+/g, '_') as never }),
        },
      });
      await updateSchoolSettings(schoolId, (settings) => {
        const roomMeta = asRecord(settings.facilityRoomMeta);
        roomMeta[id] = {
          ...asRecord(roomMeta[id]),
          ...(req.body.floor !== undefined && { floor: str(req.body.floor) }),
          ...(req.body.allocated !== undefined && { allocated: str(req.body.allocated) }),
          ...(req.body.status !== undefined && { status: str(req.body.status) }),
        };
        return { ...settings, facilityRoomMeta: roomMeta };
      });
      res.json({ success: true, data: room });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /admin/schools/:schoolId/facilities/rooms/:id */
  async deleteRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      await prisma.facility.delete({ where: { id } });
      await updateSchoolSettings(schoolId, (settings) => {
        const roomMeta = asRecord(settings.facilityRoomMeta);
        delete roomMeta[id];
        return { ...settings, facilityRoomMeta: roomMeta };
      });
      res.json({ success: true, data: null, message: 'Room deleted' });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/facilities/maintenance/:id */
  async updateMaintenanceRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const request = await prisma.maintenanceRequest.update({
        where: { id },
        data: {
          ...(req.body.description !== undefined && { description: str(req.body.description) }),
          ...(req.body.priority !== undefined && { priority: str(req.body.priority).toUpperCase() as never }),
          ...(req.body.assignedTo !== undefined && { assignedTo: req.body.assignedTo ? str(req.body.assignedTo) : null }),
          ...(req.body.room !== undefined || req.body.type !== undefined
            ? { title: str(req.body.type || req.body.room || 'Maintenance') }
            : {}),
        },
      });
      await updateSchoolSettings(schoolId, (settings) => {
        const maintenanceMeta = asRecord(settings.maintenanceMeta);
        maintenanceMeta[id] = {
          ...asRecord(maintenanceMeta[id]),
          ...(req.body.room !== undefined && { room: str(req.body.room) }),
          ...(req.body.type !== undefined && { type: str(req.body.type) }),
          ...(req.body.status !== undefined && { status: str(req.body.status) }),
          ...(req.body.completedAt !== undefined && { completedAt: str(req.body.completedAt) }),
        };
        return { ...settings, maintenanceMeta };
      });
      res.json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /admin/schools/:schoolId/facilities/maintenance/:id */
  async deleteMaintenanceRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      await prisma.maintenanceRequest.delete({ where: { id } });
      await updateSchoolSettings(schoolId, (settings) => {
        const maintenanceMeta = asRecord(settings.maintenanceMeta);
        delete maintenanceMeta[id];
        return { ...settings, maintenanceMeta };
      });
      res.json({ success: true, data: null, message: 'Maintenance request deleted' });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/facilities/assets */
  async createAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const asset = await upsertSettingsArrayItem(schoolId, 'assets', {
        name: str(req.body.name),
        type: str(req.body.type),
        location: str(req.body.location),
        purchaseDate: isoDate(req.body.purchaseDate),
        value: str(req.body.value),
        condition: str(req.body.condition, 'Good'),
        assignedTo: str(req.body.assignedTo),
      });
      res.status(201).json({ success: true, data: asset });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/facilities/assets/:id */
  async updateAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const asset = await upsertSettingsArrayItem(schoolId, 'assets', { id, ...req.body });
      res.json({ success: true, data: asset });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /admin/schools/:schoolId/facilities/assets/:id */
  async deleteAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      await deleteSettingsArrayItem(schoolId, 'assets', id);
      res.json({ success: true, data: null, message: 'Asset deleted' });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/facilities/bookings/:id */
  async updateBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const booking = await prisma.facilityBooking.update({
        where: { id },
        data: {
          ...(req.body.startTime !== undefined && { startTime: new Date(String(req.body.startTime)) }),
          ...(req.body.endTime !== undefined && { endTime: new Date(String(req.body.endTime)) }),
          ...(req.body.purpose !== undefined && { purpose: str(req.body.purpose) }),
        },
      });
      await updateSchoolSettings(schoolId, (settings) => {
        const bookingMeta = asRecord(settings.facilityBookingMeta);
        bookingMeta[id] = {
          ...asRecord(bookingMeta[id]),
          ...(req.body.event !== undefined && { event: str(req.body.event) }),
          ...(req.body.bookedBy !== undefined && { bookedBy: str(req.body.bookedBy) }),
          ...(req.body.status !== undefined && { status: str(req.body.status) }),
        };
        return { ...settings, facilityBookingMeta: bookingMeta };
      });
      res.json({ success: true, data: booking });
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
      res.json({
        success: true,
        data: threads.map((thread) => {
          const latest = thread.messages[0];
          return {
            ...thread,
            from: thread.participantIds[0] ?? '',
            subject: thread.subject,
            category: 'general',
            date: thread.lastMessageAt.toISOString(),
            preview: latest?.body?.slice(0, 120) ?? '',
            unread: !latest?.readAt,
          };
        }),
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/communication/announcements */
  async announcements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { settings } = await getSchoolSettings(schoolId);
      const announcementMeta = asRecord(settings.announcementMeta);
      const announcements = await prisma.announcement.findMany({
        where: { schoolId },
        include: { author: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      res.json({
        success: true,
        data: announcements.map((announcement) => {
          const meta = asRecord(announcementMeta[announcement.id]);
          return {
            ...announcement,
            author: formatUserName(announcement.author),
            date: announcement.createdAt.toISOString(),
            priority: str(meta.priority, 'normal'),
            status: str(meta.status, announcement.publishedAt ? 'active' : 'draft'),
            reads: num(meta.reads, 0),
          };
        }),
      });
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
      const { settings } = await getSchoolSettings(schoolId);
      const templates = asArray<JsonRecord>(settings.communicationTemplates);
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
          authorId: userIdFromReq(req),
          title,
          body,
          audience: Array.isArray(audience) ? audience : [str(audience).toUpperCase()].filter(Boolean),
          publishedAt: publish ? new Date() : null,
        },
      });
      await updateSchoolSettings(schoolId, (settings) => {
        const announcementMeta = asRecord(settings.announcementMeta);
        announcementMeta[announcement.id] = {
          priority: str(req.body.priority || 'normal'),
          status: str(req.body.status || (publish ? 'active' : 'draft')),
        };
        return { ...settings, announcementMeta };
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
      const title = str(req.body.title || `Broadcast ${new Date().toISOString().slice(0, 10)}`);
      const body = str(req.body.body || req.body.message);
      const audience = req.body.audience;
      if (!body) throw new BadRequestError('title and body are required');

      const announcement = await prisma.announcement.create({
        data: {
          schoolId,
          authorId: userIdFromReq(req),
          title,
          body,
          audience: Array.isArray(audience)
            ? audience
            : [str(audience, 'ALL').toUpperCase()].filter(Boolean),
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
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      await prisma.announcement.delete({ where: { id } });
      await updateSchoolSettings(schoolId, (settings) => {
        const announcementMeta = asRecord(settings.announcementMeta);
        delete announcementMeta[id];
        return { ...settings, announcementMeta };
      });
      res.json({ success: true, data: null, message: 'Announcement deleted' });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/communication/announcements/:id */
  async updateAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const announcement = await prisma.announcement.update({
        where: { id },
        data: {
          ...(req.body.title !== undefined && { title: str(req.body.title) }),
          ...(req.body.body !== undefined && { body: str(req.body.body) }),
          ...(req.body.audience !== undefined && {
            audience: Array.isArray(req.body.audience)
              ? req.body.audience
              : [str(req.body.audience).toUpperCase()].filter(Boolean),
          }),
          ...(req.body.status !== undefined && {
            publishedAt: str(req.body.status).toLowerCase() === 'draft' ? null : new Date(),
          }),
        },
      });
      await updateSchoolSettings(schoolId, (settings) => {
        const announcementMeta = asRecord(settings.announcementMeta);
        announcementMeta[id] = {
          ...asRecord(announcementMeta[id]),
          ...(req.body.priority !== undefined && { priority: str(req.body.priority) }),
          ...(req.body.status !== undefined && { status: str(req.body.status) }),
        };
        return { ...settings, announcementMeta };
      });
      res.json({ success: true, data: announcement });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/communication/templates */
  async createTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const template = await upsertSettingsArrayItem(schoolId, 'communicationTemplates', {
        name: str(req.body.name),
        type: str(req.body.type || 'email'),
        category: str(req.body.category || 'general'),
        body: str(req.body.body),
        status: str(req.body.status || 'active'),
        lastEdited: new Date().toISOString(),
      });
      res.status(201).json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/communication/templates/:id */
  async updateTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const template = await upsertSettingsArrayItem(schoolId, 'communicationTemplates', {
        id,
        ...req.body,
        lastEdited: new Date().toISOString(),
      });
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /admin/schools/:schoolId/communication/templates/:id */
  async deleteTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      await deleteSettingsArrayItem(schoolId, 'communicationTemplates', id);
      res.json({ success: true, data: null, message: 'Template deleted' });
    } catch (error) {
      next(error);
    }
  },

  /** PUT /admin/schools/:schoolId/communication/messages/:id/read */
  async markMessageRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const threadId = p(req.params.id);
      await prisma.message.updateMany({
        where: { threadId, readAt: null },
        data: { readAt: new Date() },
      });
      res.json({ success: true, data: { id: threadId } });
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
      const { school, settings } = await getSchoolSettings(schoolId);
      const extras = asRecord(settings.schoolProfileExtras);
      res.json({
        success: true,
        data: {
          ...school,
          schoolName: school.name ?? '',
          regNumber: str(extras.regNumber),
          timezone: str(extras.timezone),
          schoolHours: str(extras.schoolHours),
          officeHours: str(extras.officeHours),
          foundedYear: str(extras.foundedYear),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/settings/profile */
  async saveProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { name, address, phone, email, website, schoolName, regNumber, timezone, schoolHours, officeHours, foundedYear } = req.body;
      const school = await prisma.school.update({
        where: { id: schoolId },
        data: {
          ...((name !== undefined || schoolName !== undefined) && { name: str(name ?? schoolName) }),
          ...(address !== undefined && { address }),
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { email }),
          ...(website !== undefined && { website }),
        },
      });
      await updateSchoolSettings(schoolId, (settings) => ({
        ...settings,
        schoolProfileExtras: {
          ...asRecord(settings.schoolProfileExtras),
          ...(regNumber !== undefined && { regNumber: str(regNumber) }),
          ...(timezone !== undefined && { timezone: str(timezone) }),
          ...(schoolHours !== undefined && { schoolHours: str(schoolHours) }),
          ...(officeHours !== undefined && { officeHours: str(officeHours) }),
          ...(foundedYear !== undefined && { foundedYear: str(foundedYear) }),
        },
      }));
      res.json({ success: true, data: school });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/settings/academic */
  async academic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { settings } = await getSchoolSettings(schoolId);
      res.json({ success: true, data: asRecord(settings.academicConfig) });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/settings/academic */
  async saveAcademic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const updatedSettings = await updateSchoolSettings(schoolId, (settings) => ({
        ...settings,
        academicConfig: {
          ...asRecord(settings.academicConfig),
          ...asRecord(req.body),
        },
      }));
      res.json({ success: true, data: updatedSettings.academicConfig });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/settings/grading */
  async grading(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { settings } = await getSchoolSettings(schoolId);
      res.json({ success: true, data: asArray<JsonRecord>(settings.gradingScales) });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/settings/grading */
  async createGradingScale(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const scale = await upsertSettingsArrayItem(schoolId, 'gradingScales', {
        grade: str(req.body.grade),
        min: num(req.body.min),
        max: num(req.body.max),
        gpa: str(req.body.gpa),
        desc: str(req.body.desc),
      });
      res.status(201).json({ success: true, data: scale });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/settings/fees */
  async fees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { settings } = await getSchoolSettings(schoolId);
      res.json({ success: true, data: asArray<JsonRecord>(settings.feeConfig) });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/settings/fees */
  async saveFees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const fee = await upsertSettingsArrayItem(schoolId, 'feeConfig', {
        ...(req.body.id !== undefined && { id: str(req.body.id) }),
        name: str(req.body.name),
        category: str(req.body.category || 'Academic'),
        amount: str(req.body.amount),
        frequency: str(req.body.frequency || 'Per Term'),
        mandatory: bool(req.body.mandatory, true),
      });
      res.json({ success: true, data: fee });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /admin/schools/:schoolId/settings/fees/:id */
  async deleteFee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      await deleteSettingsArrayItem(schoolId, 'feeConfig', id);
      res.json({ success: true, data: null, message: 'Fee deleted' });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/settings/roles */
  async roles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const { settings } = await getSchoolSettings(schoolId);
      const savedRoles = asArray<JsonRecord>(settings.schoolRoles);
      if (savedRoles.length > 0) {
        res.json({ success: true, data: savedRoles });
        return;
      }
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

  /** POST /admin/schools/:schoolId/settings/roles */
  async createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const role = await upsertSettingsArrayItem(schoolId, 'schoolRoles', {
        role: str(req.body.name || req.body.role),
        desc: str(req.body.description || req.body.desc),
        perms: str(req.body.permissions || req.body.perms),
        users: num(req.body.users, 0),
      });
      res.status(201).json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/settings/roles/:id */
  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const id = p(req.params.id);
      const role = await upsertSettingsArrayItem(schoolId, 'schoolRoles', {
        id,
        role: str(req.body.name || req.body.role),
        desc: str(req.body.description || req.body.desc),
        perms: str(req.body.permissions || req.body.perms),
        users: num(req.body.users, 0),
      });
      res.json({ success: true, data: role });
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
      res.json({
        success: true,
        data: reports.map((report) => {
          const content = asRecord(report.content);
          return {
            ...report,
            area: report.title,
            description: str(content.description),
            dueDate: str(content.dueDate),
            assignee: str(content.assignee),
            priority: str(content.priority, 'Medium'),
            status: str(report.status),
          };
        }),
      });
    } catch (error) {
      next(error);
    }
  },

  /** POST /admin/schools/:schoolId/audit/compliance */
  async createCompliance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const report = await prisma.complianceReport.create({
        data: {
          schoolId,
          title: str(req.body.area),
          type: 'COMPLIANCE_TASK',
          status: str(req.body.status || 'Open'),
          content: {
            description: str(req.body.description),
            dueDate: str(req.body.dueDate),
            assignee: str(req.body.assignee),
            priority: str(req.body.priority || 'Medium'),
          } as Prisma.InputJsonValue,
        },
      });
      res.status(201).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  /** PATCH /admin/schools/:schoolId/audit/compliance/:id */
  async updateCompliance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = p(req.params.id);
      const existing = await prisma.complianceReport.findUnique({ where: { id }, select: { content: true } });
      const content = asRecord(existing?.content);
      const report = await prisma.complianceReport.update({
        where: { id },
        data: {
          ...(req.body.area !== undefined && { title: str(req.body.area) }),
          ...(req.body.status !== undefined && { status: str(req.body.status) }),
          content: {
            ...content,
            ...(req.body.description !== undefined && { description: str(req.body.description) }),
            ...(req.body.dueDate !== undefined && { dueDate: str(req.body.dueDate) }),
            ...(req.body.assignee !== undefined && { assignee: str(req.body.assignee) }),
            ...(req.body.priority !== undefined && { priority: str(req.body.priority) }),
          } as Prisma.InputJsonValue,
        },
      });
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /admin/schools/:schoolId/audit/compliance/:id */
  async deleteCompliance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = p(req.params.id);
      await prisma.complianceReport.delete({ where: { id } });
      res.json({ success: true, data: null, message: 'Compliance task deleted' });
    } catch (error) {
      next(error);
    }
  },
};

export const schoolOpsDashboardController = {
  /** GET /admin/schools/:schoolId/dashboard/analytics */
  async analytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const [members, grades, courses, attendance, assignments] = await Promise.all([
        prisma.schoolMember.findMany({ where: { schoolId }, include: { user: { select: { role: true } } } }),
        prisma.grade.findMany({
          where: { course: { schoolId } },
          include: { course: { select: { department: { select: { name: true } } } } },
        }),
        prisma.course.findMany({ where: { schoolId }, include: { department: { select: { name: true } }, _count: { select: { enrollments: true } } } }),
        prisma.attendance.findMany({ where: { course: { schoolId } } }),
        prisma.assignment.findMany({ where: { course: { schoolId } }, include: { _count: { select: { submissions: true } } } }),
      ]);

      const students = members.filter((member) => member.role === 'STUDENT' || member.user.role === 'STUDENT');
      const totalStudents = students.length;
      const averageScore = grades.length > 0 ? grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length : 0;
      const attendanceRate =
        attendance.length > 0
          ? (attendance.filter((record) => record.status === 'PRESENT' || record.status === 'LATE').length / attendance.length) * 100
          : 0;
      const completionRate =
        assignments.length > 0
          ? (assignments.reduce((sum, assignment) => sum + assignment._count.submissions, 0) / assignments.length) * 100
          : 0;

      const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
      const enrollmentTrend = Array.from({ length: 6 }).map((_, index) => {
        const anchor = new Date();
        anchor.setMonth(anchor.getMonth() - (5 - index));
        const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
        const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
        const count = students.filter((student) => student.joinedAt < monthEnd).length;
        return { name: monthFormatter.format(monthStart), students: count };
      });

      const attendanceTrend = Array.from({ length: 6 }).map((_, index) => {
        const anchor = new Date();
        anchor.setMonth(anchor.getMonth() - (5 - index));
        const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
        const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
        const monthAttendance = attendance.filter((record) => record.date >= monthStart && record.date < monthEnd);
        const rate =
          monthAttendance.length > 0
            ? (monthAttendance.filter((record) => record.status === 'PRESENT' || record.status === 'LATE').length / monthAttendance.length) * 100
            : 0;
        return { name: monthFormatter.format(monthStart), rate: Math.round(rate) };
      });

      const gradeDistribution = [
        { name: 'A', value: grades.filter((grade) => grade.score >= 90).length, color: '#34d399' },
        { name: 'B', value: grades.filter((grade) => grade.score >= 80 && grade.score < 90).length, color: '#818cf8' },
        { name: 'C', value: grades.filter((grade) => grade.score >= 70 && grade.score < 80).length, color: '#fbbf24' },
        { name: 'D', value: grades.filter((grade) => grade.score >= 60 && grade.score < 70).length, color: '#fb923c' },
        { name: 'F', value: grades.filter((grade) => grade.score < 60).length, color: '#f87171' },
      ];

      const departmentPerformance = courses
        .reduce<Record<string, { scores: number[]; attendance: number[] }>>((acc, course) => {
          const key = course.department?.name ?? 'General';
          if (!acc[key]) acc[key] = { scores: [], attendance: [] };
          const courseGrades = grades.filter((grade) => grade.courseId === course.id).map((grade) => grade.score);
          const courseAttendance = attendance.filter((record) => record.courseId === course.id);
          if (courseGrades.length > 0) acc[key].scores.push(...courseGrades);
          if (courseAttendance.length > 0) {
            const presentCount = courseAttendance.filter((record) => record.status === 'PRESENT' || record.status === 'LATE').length;
            acc[key].attendance.push((presentCount / courseAttendance.length) * 100);
          }
          return acc;
        }, {});

      res.json({
        success: true,
        data: {
          totalStudents,
          avgGpa: Number((averageScore / 25).toFixed(2)),
          attendanceRate: Number(attendanceRate.toFixed(1)),
          courseCompletionRate: Number(Math.min(completionRate, 100).toFixed(1)),
          enrollmentTrend,
          attendanceTrend,
          gradeDistribution,
          departmentPerformance: Object.entries(departmentPerformance).map(([name, stats]) => ({
            name,
            avgGrade: stats.scores.length > 0 ? Math.round(stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length) : 0,
            attendance: stats.attendance.length > 0 ? Math.round(stats.attendance.reduce((sum, rate) => sum + rate, 0) / stats.attendance.length) : 0,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/dashboard/market */
  async market(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const [applicants, campaigns] = await Promise.all([
        prisma.applicant.findMany({ where: { schoolId }, orderBy: { createdAt: 'asc' } }),
        prisma.campaign.findMany({ where: { schoolId }, orderBy: { createdAt: 'desc' } }),
      ]);

      const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
      const inquiryTrend = Array.from({ length: 6 }).map((_, index) => {
        const anchor = new Date();
        anchor.setMonth(anchor.getMonth() - (5 - index));
        const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
        const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
        return {
          name: monthFormatter.format(monthStart),
          inquiries: applicants.filter((applicant) => applicant.createdAt >= monthStart && applicant.createdAt < monthEnd).length,
        };
      });

      const stageCounts = ['INQUIRY', 'APPLICATION', 'REVIEW', 'ACCEPTED', 'ENROLLED', 'REJECTED'].map((stage) => ({
        name: titleCase(stage),
        value: applicants.filter((applicant) => applicant.stage === stage).length,
      }));

      const campaignPerformance = campaigns.map((campaign) => ({
        name: campaign.name,
        channel: campaign.channel,
        budget: campaign.budget,
        leads: num(asRecord(campaign.metrics).leads),
        conversions: num(asRecord(campaign.metrics).conversions),
      }));

      const conversionRate = applicants.length > 0
        ? (applicants.filter((applicant) => applicant.stage === 'ENROLLED').length / applicants.length) * 100
        : 0;

      res.json({
        success: true,
        data: {
          inquiryVolume: applicants.length,
          waitlistStudents: 0,
          conversionRate: Number(conversionRate.toFixed(1)),
          brandScore: campaigns.length > 0
            ? Number((campaigns.reduce((sum, campaign) => sum + num(asRecord(campaign.metrics).engagementScore), 0) / campaigns.length).toFixed(1))
            : 0,
          inquiryTrend,
          stageDistribution: stageCounts,
          campaignPerformance,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /** GET /admin/schools/:schoolId/dashboard/system */
  async system(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = p(req.params.schoolId);
      const [maintenance, compliance, audits, messages, announcements] = await Promise.all([
        prisma.maintenanceRequest.findMany({ where: { schoolId }, orderBy: { requestedAt: 'desc' }, take: 20 }),
        prisma.complianceReport.findMany({ where: { schoolId }, orderBy: { updatedAt: 'desc' }, take: 20 }),
        prisma.auditLog.findMany({
          where: { metadata: { path: ['schoolId'], equals: schoolId } },
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { timestamp: 'desc' },
          take: 20,
        }),
        prisma.messageThread.count({ where: { schoolId } }),
        prisma.announcement.count({ where: { schoolId, publishedAt: { not: null } } }),
      ]);

      const openMaintenance = maintenance.filter((item) => !['COMPLETED', 'DONE'].includes(str(item.status).toUpperCase())).length;
      const openCompliance = compliance.filter((item) => !['COMPLETED', 'CLOSED'].includes(str(item.status).toUpperCase())).length;
      const criticalAudits = audits.filter((log) => /delete|failed|denied|security/i.test(log.action)).length;
      const operationalScore = Math.max(0, 100 - openMaintenance * 4 - openCompliance * 3 - criticalAudits * 5);

      res.json({
        success: true,
        data: {
          operationalScore,
          openMaintenance,
          openCompliance,
          criticalAudits,
          activeMessageThreads: messages,
          publishedAnnouncements: announcements,
          services: [
            { name: 'Maintenance Queue', status: openMaintenance > 5 ? 'warning' : 'healthy', metric: openMaintenance },
            { name: 'Compliance Queue', status: openCompliance > 3 ? 'warning' : 'healthy', metric: openCompliance },
            { name: 'Communications', status: 'healthy', metric: messages + announcements },
          ],
          incidents: audits.slice(0, 8).map((log) => ({
            title: log.action,
            time: log.timestamp.toISOString(),
            severity: /delete|failed|denied|security/i.test(log.action) ? 'critical' : 'info',
            resolved: !/pending|failed/i.test(log.action),
            actor: formatUserName(log.user),
          })),
        },
      });
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
            ? Number((grades.reduce((sum: number, g: { score: number }) => sum + g.score, 0) / grades.length).toFixed(2))
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

      const validChannels = ['email', 'sms', 'push'];
      const channel = validChannels.includes(type) ? type : 'email';
      const notificationType = channel === 'push' ? 'PUSH' : channel === 'sms' ? 'SMS' : 'EMAIL';

      // Create a notification record for in-app delivery
      if (recipientId) {
        await prisma.notification.create({
          data: {
            userId: recipientId,
            type: notificationType,
            title: subject,
            message: body,
            metadata: { schoolId, channel, recipientEmail: recipientEmail ?? null },
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
