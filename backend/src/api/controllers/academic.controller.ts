import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma.service.js';
import { NotFoundError } from '../../utils/errors.js';
import { wsService } from '../../services/websocket.service.js';
import crypto from 'node:crypto';

/** Express 5 params can be string | string[] — helper to coerce */
const param = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

export const courseController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await prisma.course.create({
        data: {
          schoolId: param(req.params.schoolId),
          name: req.body.name,
          description: req.body.description,
          gradeLevel: req.body.gradeLevel,
          semester: req.body.semester,
          teacherId: req.body.teacherId,
        },
        include: { teacher: { select: { id: true, firstName: true, lastName: true } } },
      });
      res.status(201).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const courses = await prisma.course.findMany({
        where: { schoolId },
        include: {
          teacher: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { enrollments: true, assignments: true } },
        },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: courses });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await prisma.course.findUnique({
        where: { id: param(req.params.id) },
        include: {
          teacher: { select: { id: true, firstName: true, lastName: true } },
          enrollments: true,
          assignments: { orderBy: { dueDate: 'asc' } },
        },
      });
      if (!course) throw new NotFoundError('Course not found');
      res.json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await prisma.course.update({
        where: { id: param(req.params.id) },
        data: {
          name: req.body.name,
          description: req.body.description,
          gradeLevel: req.body.gradeLevel,
          semester: req.body.semester,
          teacherId: req.body.teacherId,
        },
      });
      res.json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.course.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Course deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Assignment sub-controller
// ---------------------------------------------------------------------------

export const assignmentController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignment = await prisma.assignment.create({
        data: {
          courseId: req.body.courseId,
          title: req.body.title,
          description: req.body.description,
          dueDate: new Date(req.body.dueDate),
          maxScore: req.body.maxScore,
          type: req.body.type,
        },
      });
      res.status(201).json({ success: true, data: assignment });
    } catch (error) {
      next(error);
    }
  },

  async listByCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignments = await prisma.assignment.findMany({
        where: { courseId: param(req.params.courseId) },
        include: { _count: { select: { submissions: true } } },
        orderBy: { dueDate: 'asc' },
      });
      res.json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id: param(req.params.id) },
        include: {
          submissions: { include: { student: { select: { id: true, firstName: true, lastName: true } } } },
        },
      });
      if (!assignment) throw new NotFoundError('Assignment not found');
      res.json({ success: true, data: assignment });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignment = await prisma.assignment.update({
        where: { id: param(req.params.id) },
        data: {
          title: req.body.title,
          description: req.body.description,
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
          maxScore: req.body.maxScore,
          type: req.body.type,
        },
      });
      res.json({ success: true, data: assignment });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.assignment.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Assignment deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Submission sub-controller
// ---------------------------------------------------------------------------

export const submissionController = {
  async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submission = await prisma.submission.create({
        data: {
          assignmentId: param(req.params.assignmentId),
          studentId: req.user!.userId,
          content: req.body.content,
        },
      });
      res.status(201).json({ success: true, data: submission });
    } catch (error) {
      next(error);
    }
  },

  async grade(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submission = await prisma.submission.update({
        where: { id: param(req.params.id) },
        data: {
          score: req.body.score,
          feedback: req.body.feedback,
        },
      });

      // Also create a Grade record
      const assignment = await prisma.assignment.findUnique({ where: { id: submission.assignmentId } });
      if (assignment) {
        await prisma.grade.upsert({
          where: {
            studentId_courseId: { studentId: submission.studentId, courseId: assignment.courseId },
          },
          create: {
            studentId: submission.studentId,
            courseId: assignment.courseId,
            assignmentId: assignment.id,
            score: req.body.score,
          },
          update: {
            score: req.body.score,
            gradedAt: new Date(),
          },
        });

        // ── Notify student of graded assignment ──
        wsService.notifyUser(submission.studentId, {
          id: crypto.randomUUID(),
          type: 'GRADE',
          title: 'Assignment Graded',
          message: `Your submission for "${assignment.title}" received a score of ${req.body.score}`,
          link: `/student/courses/${assignment.courseId}`,
        });
      }

      res.json({ success: true, data: submission });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Attendance sub-controller
// ---------------------------------------------------------------------------

export const attendanceController = {
  async mark(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = param(req.params.courseId);
      const date = new Date(req.body.date);
      const records = req.body.records as Array<{ studentId: string; status: string }>;

      const results = await Promise.all(
        records.map((r) =>
          prisma.attendance.upsert({
            where: {
              studentId_courseId_date: { studentId: r.studentId, courseId, date },
            },
            create: {
              studentId: r.studentId,
              courseId,
              date,
              status: r.status as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
            },
            update: {
              status: r.status as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
            },
          }),
        ),
      );

      res.json({ success: true, data: results });

      // ── Notify parents of absent students (fire-and-forget) ──
      const absentRecords = records.filter((r: { status: string }) => r.status === 'ABSENT');
      for (const rec of absentRecords) {
        // Look up parent via student
        const student = await prisma.user.findUnique({
          where: { id: rec.studentId },
          select: {
            firstName: true,
            lastName: true,
            childParents: { select: { parentId: true }, take: 1 },
          },
        });
        const parentId = student?.childParents?.[0]?.parentId;
        if (parentId) {
          wsService.notifyUser(parentId, {
            id: crypto.randomUUID(),
            type: 'ATTENDANCE',
            title: 'Absence Alert',
            message: `${student.firstName} ${student.lastName} was marked absent on ${req.body.date}`,
            link: '/parent/attendance',
          });
        }
      }
    } catch (error) {
      next(error);
    }
  },

  async getByCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const records = await prisma.attendance.findMany({
        where: { courseId: param(req.params.courseId) },
        include: { student: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { date: 'desc' },
      });
      res.json({ success: true, data: records });
    } catch (error) {
      next(error);
    }
  },

  async getByStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const records = await prisma.attendance.findMany({
        where: { studentId: param(req.params.studentId) },
        include: { course: { select: { id: true, name: true } } },
        orderBy: { date: 'desc' },
      });
      res.json({ success: true, data: records });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Gradebook sub-controller
// ---------------------------------------------------------------------------

export const gradebookController = {
  async getByCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const grades = await prisma.grade.findMany({
        where: { courseId: param(req.params.courseId) },
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
          assignment: { select: { id: true, title: true, maxScore: true } },
        },
        orderBy: { gradedAt: 'desc' },
      });
      res.json({ success: true, data: grades });
    } catch (error) {
      next(error);
    }
  },

  async getByStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const grades = await prisma.grade.findMany({
        where: { studentId: param(req.params.studentId) },
        include: {
          course: { select: { id: true, name: true } },
          assignment: { select: { id: true, title: true, maxScore: true } },
        },
        orderBy: { gradedAt: 'desc' },
      });
      res.json({ success: true, data: grades });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Enrollment sub-controller
// ---------------------------------------------------------------------------

export const enrollmentController = {
  async enroll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = param(req.params.courseId);
      const studentId = req.body.studentId ?? req.user!.userId;

      const enrollment = await prisma.courseEnrollment.create({
        data: { studentId, courseId },
        include: {
          student: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });
      res.status(201).json({ success: true, data: enrollment });
    } catch (error) {
      next(error);
    }
  },

  async unenroll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = param(req.params.courseId);
      const studentId = param(req.params.studentId);

      await prisma.courseEnrollment.delete({
        where: { studentId_courseId: { studentId, courseId } },
      });
      res.json({ success: true, data: null, message: 'Unenrolled successfully' });
    } catch (error) {
      next(error);
    }
  },

  async listByCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollments = await prisma.courseEnrollment.findMany({
        where: { courseId: param(req.params.courseId) },
        include: {
          student: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        },
        orderBy: { enrolledAt: 'desc' },
      });
      res.json({ success: true, data: enrollments });
    } catch (error) {
      next(error);
    }
  },

  async listByStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollments = await prisma.courseEnrollment.findMany({
        where: { studentId: param(req.params.studentId) },
        include: {
          course: {
            include: {
              teacher: { select: { id: true, firstName: true, lastName: true } },
              _count: { select: { enrollments: true, assignments: true } },
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      });
      res.json({ success: true, data: enrollments });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Session sub-controller
// ---------------------------------------------------------------------------

export const sessionController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await prisma.courseSession.create({
        data: {
          courseId: req.body.courseId,
          title: req.body.title ?? '',
          type: req.body.type ?? 'LECTURE',
          dayOfWeek: req.body.dayOfWeek,
          startTime: req.body.startTime,
          endTime: req.body.endTime,
          room: req.body.room ?? '',
          recurring: req.body.recurring ?? true,
          startDate: req.body.startDate ? new Date(req.body.startDate) : null,
          endDate: req.body.endDate ? new Date(req.body.endDate) : null,
          notes: req.body.notes ?? '',
        },
        include: { course: { select: { id: true, name: true, teacherId: true } } },
      });
      res.status(201).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  },

  async listByCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessions = await prisma.courseSession.findMany({
        where: { courseId: param(req.params.courseId) },
        include: { course: { include: { teacher: { select: { id: true, firstName: true, lastName: true } } } } },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      });
      res.json({ success: true, data: sessions });
    } catch (error) {
      next(error);
    }
  },

  async listBySchool(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const sessions = await prisma.courseSession.findMany({
        where: { course: { schoolId } },
        include: {
          course: {
            include: {
              teacher: { select: { id: true, firstName: true, lastName: true } },
              _count: { select: { enrollments: true } },
            },
          },
        },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      });
      res.json({ success: true, data: sessions });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await prisma.courseSession.findUnique({
        where: { id: param(req.params.id) },
        include: {
          course: {
            include: {
              teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
              enrollments: { include: { student: { select: { id: true, firstName: true, lastName: true, email: true } } } },
            },
          },
        },
      });
      if (!session) throw new NotFoundError('Session not found');
      res.json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await prisma.courseSession.update({
        where: { id: param(req.params.id) },
        data: {
          title: req.body.title,
          type: req.body.type,
          dayOfWeek: req.body.dayOfWeek,
          startTime: req.body.startTime,
          endTime: req.body.endTime,
          room: req.body.room,
          recurring: req.body.recurring,
          notes: req.body.notes,
        },
      });
      res.json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.courseSession.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Session deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Department management
// ---------------------------------------------------------------------------

export const departmentController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const department = await prisma.department.create({
        data: {
          schoolId: param(req.params.schoolId),
          name: req.body.name,
          description: req.body.description ?? '',
          headId: req.body.headId ?? null,
        },
        include: {
          head: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { courses: true } },
        },
      });
      res.status(201).json({ success: true, data: department });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const departments = await prisma.department.findMany({
        where: { schoolId: param(req.params.schoolId) },
        include: {
          head: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { courses: true } },
        },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: departments });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const department = await prisma.department.update({
        where: { id: param(req.params.id) },
        data: {
          name: req.body.name,
          description: req.body.description,
          headId: req.body.headId,
        },
        include: {
          head: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { courses: true } },
        },
      });
      res.json({ success: true, data: department });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.department.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Department deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Curriculum standards and mappings
// ---------------------------------------------------------------------------

export const curriculumController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const standard = await prisma.curriculumStandard.create({
        data: {
          schoolId: param(req.params.schoolId),
          code: req.body.code,
          title: req.body.title,
          description: req.body.description ?? '',
          subject: req.body.subject ?? '',
          gradeLevel: req.body.gradeLevel ?? '',
        },
        include: {
          _count: { select: { links: true } },
        },
      });
      res.status(201).json({ success: true, data: standard });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const standards = await prisma.curriculumStandard.findMany({
        where: { schoolId: param(req.params.schoolId) },
        include: {
          _count: { select: { links: true } },
        },
        orderBy: { code: 'asc' },
      });
      res.json({ success: true, data: standards });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const standard = await prisma.curriculumStandard.update({
        where: { id: param(req.params.id) },
        data: {
          code: req.body.code,
          title: req.body.title,
          description: req.body.description,
          subject: req.body.subject,
          gradeLevel: req.body.gradeLevel,
        },
        include: {
          _count: { select: { links: true } },
        },
      });
      res.json({ success: true, data: standard });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.curriculumStandard.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Curriculum standard deleted' });
    } catch (error) {
      next(error);
    }
  },

  async listCourseMappings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = param(req.params.courseId);
      const mappings = await prisma.courseCurriculumLink.findMany({
        where: { courseId },
        include: { standard: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: mappings });
    } catch (error) {
      next(error);
    }
  },

  async addCourseMapping(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mapping = await prisma.courseCurriculumLink.create({
        data: {
          courseId: param(req.params.courseId),
          standardId: param(req.params.standardId),
        },
        include: { standard: true },
      });
      res.status(201).json({ success: true, data: mapping });
    } catch (error) {
      next(error);
    }
  },

  async removeCourseMapping(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.courseCurriculumLink.delete({
        where: {
          courseId_standardId: {
            courseId: param(req.params.courseId),
            standardId: param(req.params.standardId),
          },
        },
      });
      res.json({ success: true, data: null, message: 'Curriculum mapping removed' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// School-wide gradebook summary
// ---------------------------------------------------------------------------

export const schoolGradebookController = {
  async summary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);

      const [courseCount, studentCount, gradeAggregate, groupedByStudent] = await Promise.all([
        prisma.course.count({ where: { schoolId } }),
        prisma.schoolMember.count({ where: { schoolId, role: 'STUDENT' } }),
        prisma.grade.aggregate({
          where: { course: { schoolId } },
          _avg: { score: true },
          _count: { id: true },
        }),
        prisma.grade.groupBy({
          by: ['studentId'],
          where: { course: { schoolId } },
          _avg: { score: true },
        }),
      ]);

      const honorRoll = groupedByStudent.filter((x) => (x._avg.score ?? 0) >= 90).length;
      const atRisk = groupedByStudent.filter((x) => (x._avg.score ?? 0) < 60).length;

      res.json({
        success: true,
        data: {
          schoolId,
          courseCount,
          studentCount,
          gradedStudents: groupedByStudent.length,
          totalGrades: gradeAggregate._count.id,
          averageScore: Number((gradeAggregate._avg.score ?? 0).toFixed(2)),
          honorRoll,
          atRisk,
          ungradedStudents: Math.max(0, studentCount - groupedByStudent.length),
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
