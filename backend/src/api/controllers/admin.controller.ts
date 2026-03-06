import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma.service.js';
import { NotFoundError, BadRequestError, ConflictError } from '../../utils/errors.js';
import bcrypt from 'bcryptjs';

/** Express 5 params can be string | string[] — helper to coerce */
const param = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

// ---------------------------------------------------------------------------
// Admissions (Applicant pipeline)
// ---------------------------------------------------------------------------

export const applicantController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { firstName, lastName, email } = req.body;
      if (!firstName || !lastName || !email) {
        throw new BadRequestError('firstName, lastName, and email are required');
      }
      const applicant = await prisma.applicant.create({
        data: {
          schoolId: param(req.params.schoolId),
          firstName,
          lastName,
          email,
          phone: req.body.phone,
          stage: req.body.stage,
        },
      });
      res.status(201).json({ success: true, data: applicant });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const applicants = await prisma.applicant.findMany({
        where: { schoolId: param(req.params.schoolId) },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: applicants });
    } catch (error) {
      next(error);
    }
  },

  async updateStage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.body.stage) {
        throw new BadRequestError('stage is required');
      }
      const applicant = await prisma.applicant.update({
        where: { id: param(req.params.id) },
        data: { stage: req.body.stage },
      });
      res.json({ success: true, data: applicant });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const applicant = await prisma.applicant.findUnique({ where: { id: param(req.params.id) } });
      if (!applicant) throw new NotFoundError('Applicant not found');
      res.json({ success: true, data: applicant });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.applicant.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Applicant deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

export const campaignController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, channel, startDate, endDate } = req.body;
      if (!name || !channel) {
        throw new BadRequestError('name and channel are required');
      }
      if (!startDate || !endDate) {
        throw new BadRequestError('startDate and endDate are required');
      }
      if (new Date(startDate) >= new Date(endDate)) {
        throw new BadRequestError('startDate must be before endDate');
      }
      const campaign = await prisma.campaign.create({
        data: {
          schoolId: param(req.params.schoolId),
          name,
          channel,
          budget: req.body.budget,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });
      res.status(201).json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaigns = await prisma.campaign.findMany({
        where: { schoolId: param(req.params.schoolId) },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: campaigns });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, channel, status, budget, metrics } = req.body;
      if (!name && !channel && !status && budget === undefined && !metrics) {
        throw new BadRequestError('At least one field must be provided for update');
      }
      const campaign = await prisma.campaign.update({
        where: { id: param(req.params.id) },
        data: {
          ...(name && { name }),
          ...(channel && { channel }),
          ...(status && { status }),
          ...(budget !== undefined && { budget }),
          ...(metrics && { metrics }),
        },
      });
      res.json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaign = await prisma.campaign.findUnique({ where: { id: param(req.params.id) } });
      if (!campaign) throw new NotFoundError('Campaign not found');
      res.json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Staff Management (for Admin role)
// ---------------------------------------------------------------------------

export const staffController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search = '' } = req.query as { search?: string };
      const schoolId = param(req.params.schoolId);

      const members = await prisma.schoolMember.findMany({
        where: {
          schoolId,
          role: { in: ['TEACHER', 'ADMIN', 'FINANCE', 'MARKETING'] },
          user: search
            ? {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              }
            : undefined,
        },
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

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: param(req.params.id) },
        select: {
          id: true, email: true, firstName: true, lastName: true, role: true,
          avatar: true, isActive: true, createdAt: true, updatedAt: true,
          courses: { select: { id: true, name: true } },
        },
      });
      if (!user) throw new NotFoundError('Staff member not found');
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Student Management (for Admin role)
// ---------------------------------------------------------------------------

export const studentManagementController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search = '' } = req.query as { search?: string };
      const schoolId = param(req.params.schoolId);

      const members = await prisma.schoolMember.findMany({
        where: {
          schoolId,
          role: 'STUDENT',
          user: search
            ? {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              }
            : undefined,
        },
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

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: param(req.params.id) },
        select: {
          id: true, email: true, firstName: true, lastName: true, role: true,
          avatar: true, isActive: true, createdAt: true,
          grades: { include: { course: { select: { name: true } }, assignment: { select: { title: true } } } },
          attendanceRecords: { orderBy: { date: 'desc' }, take: 30 },
        },
      });
      if (!user) throw new NotFoundError('Student not found');
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// School user management (Admin School > Users tab)
// ---------------------------------------------------------------------------

type SchoolUserGroup = 'staff' | 'students' | 'parents';

const GROUP_ROLE_MAP: Record<SchoolUserGroup, Array<'ADMIN' | 'TEACHER' | 'FINANCE' | 'MARKETING' | 'SCHOOL' | 'STUDENT' | 'PARENT'>> = {
  staff: ['ADMIN', 'TEACHER', 'FINANCE', 'MARKETING', 'SCHOOL'],
  students: ['STUDENT'],
  parents: ['PARENT'],
};

const toSchoolUserRow = (member: {
  id: string;
  schoolId: string;
  role: string;
  joinedAt: Date;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: { parentChildren?: number; childParents?: number };
  };
}) => ({
  id: member.user.id,
  email: member.user.email,
  firstName: member.user.firstName,
  lastName: member.user.lastName,
  role: member.user.role,
  avatar: member.user.avatar,
  isActive: member.user.isActive,
  createdAt: member.user.createdAt,
  updatedAt: member.user.updatedAt,
  membership: {
    id: member.id,
    schoolId: member.schoolId,
    role: member.role,
    joinedAt: member.joinedAt,
  },
  parentChildrenCount: member.user._count?.parentChildren ?? 0,
  parentLinksCount: member.user._count?.childParents ?? 0,
});

export const schoolUserController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const {
        group = 'staff',
        search = '',
        page = '1',
        pageSize = '20',
      } = req.query as Record<string, string>;

      const safeGroup: SchoolUserGroup =
        group === 'students' || group === 'parents' ? group : 'staff';
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
      const skip = (pageNum - 1) * size;

      const where = {
        schoolId,
        role: { in: GROUP_ROLE_MAP[safeGroup] },
        user: search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' as const } },
                { lastName: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : undefined,
      };

      const [items, total] = await Promise.all([
        prisma.schoolMember.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                avatar: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { parentChildren: true, childParents: true } },
              },
            },
          },
          orderBy: { joinedAt: 'desc' },
          skip,
          take: size,
        }),
        prisma.schoolMember.count({ where }),
      ]);

      res.json({
        success: true,
        data: items.map(toSchoolUserRow),
        meta: {
          page: pageNum,
          pageSize: size,
          total,
          totalPages: Math.ceil(total / size),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const { email, firstName, lastName, role, password, isActive } = req.body as {
        email: string;
        firstName: string;
        lastName: string;
        role: 'ADMIN' | 'TEACHER' | 'FINANCE' | 'MARKETING' | 'SCHOOL' | 'STUDENT' | 'PARENT';
        password?: string;
        isActive?: boolean;
      };

      const existingUser = await prisma.user.findUnique({ where: { email } });

      const member = await prisma.$transaction(async (tx) => {
        if (!existingUser) {
          const user = await tx.user.create({
            data: {
              email,
              firstName,
              lastName,
              role,
              isActive: isActive ?? true,
              passwordHash: await bcrypt.hash(password ?? 'changeme123', 12),
            },
          });

          return tx.schoolMember.create({
            data: {
              schoolId,
              userId: user.id,
              role,
            },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                  avatar: true,
                  isActive: true,
                  createdAt: true,
                  updatedAt: true,
                  _count: { select: { parentChildren: true, childParents: true } },
                },
              },
            },
          });
        }

        const existingMembership = await tx.schoolMember.findUnique({
          where: { userId_schoolId: { userId: existingUser.id, schoolId } },
        });
        if (existingMembership) {
          throw new ConflictError('User is already a member of this school');
        }

        await tx.user.update({
          where: { id: existingUser.id },
          data: {
            role,
            isActive: isActive ?? existingUser.isActive,
            firstName: firstName || existingUser.firstName,
            lastName: lastName || existingUser.lastName,
          },
        });

        return tx.schoolMember.create({
          data: {
            schoolId,
            userId: existingUser.id,
            role,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                avatar: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { parentChildren: true, childParents: true } },
              },
            },
          },
        });
      });

      res.status(201).json({ success: true, data: toSchoolUserRow(member) });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const userId = param(req.params.userId);
      const { email, firstName, lastName, role, isActive } = req.body as {
        email?: string;
        firstName?: string;
        lastName?: string;
        role?: 'ADMIN' | 'TEACHER' | 'FINANCE' | 'MARKETING' | 'SCHOOL' | 'STUDENT' | 'PARENT';
        isActive?: boolean;
      };

      const member = await prisma.schoolMember.findUnique({
        where: { userId_schoolId: { userId, schoolId } },
      });
      if (!member) throw new NotFoundError('School membership not found');

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundError('User not found');

      if (email && email !== user.email) {
        const duplicate = await prisma.user.findUnique({ where: { email } });
        if (duplicate) throw new ConflictError('A user with this email already exists');
      }

      const updated = await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            email,
            firstName,
            lastName,
            role,
            isActive,
          },
        });

        return tx.schoolMember.update({
          where: { userId_schoolId: { userId, schoolId } },
          data: { role },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                avatar: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { parentChildren: true, childParents: true } },
              },
            },
          },
        });
      });

      res.json({ success: true, data: toSchoolUserRow(updated) });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const userId = param(req.params.userId);
      const { isActive } = req.body as { isActive: boolean };

      const member = await prisma.schoolMember.findUnique({
        where: { userId_schoolId: { userId, schoolId } },
      });
      if (!member) throw new NotFoundError('School membership not found');

      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async removeMembership(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const userId = param(req.params.userId);

      const member = await prisma.schoolMember.findUnique({
        where: { userId_schoolId: { userId, schoolId } },
      });
      if (!member) throw new NotFoundError('School membership not found');

      await prisma.schoolMember.delete({
        where: { userId_schoolId: { userId, schoolId } },
      });

      res.json({ success: true, data: null, message: 'Membership removed' });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const userId = param(req.params.userId);
      const hard = (req.query.hard as string | undefined) === 'true';

      const member = await prisma.schoolMember.findUnique({
        where: { userId_schoolId: { userId, schoolId } },
      });
      if (!member) throw new NotFoundError('School membership not found');

      if (!hard) {
        await prisma.schoolMember.delete({
          where: { userId_schoolId: { userId, schoolId } },
        });
        res.json({ success: true, data: null, message: 'Membership removed' });
        return;
      }

      const memberships = await prisma.schoolMember.count({ where: { userId } });
      if (memberships > 1) {
        throw new BadRequestError('Hard delete is blocked: user belongs to other schools');
      }

      await prisma.user.delete({ where: { id: userId } });
      res.json({ success: true, data: null, message: 'User hard deleted' });
    } catch (error) {
      next(error);
    }
  },
};

export const parentSchoolController = {
  async listChildren(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const parentId = param(req.params.parentId);

      const links = await prisma.parentChild.findMany({
        where: {
          parentId,
          student: {
            schoolMemberships: {
              some: { schoolId, role: 'STUDENT' },
            },
          },
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              isActive: true,
            },
          },
        },
      });

      res.json({ success: true, data: links });
    } catch (error) {
      next(error);
    }
  },

  async upsertChildren(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const parentId = param(req.params.parentId);
      const childIds = (req.body.childIds as string[]) ?? [];

      const parentMembership = await prisma.schoolMember.findUnique({
        where: { userId_schoolId: { userId: parentId, schoolId } },
      });
      if (!parentMembership || parentMembership.role !== 'PARENT') {
        throw new BadRequestError('Parent must be a member of this school');
      }

      const validChildren = await prisma.schoolMember.findMany({
        where: {
          schoolId,
          role: 'STUDENT',
          userId: { in: childIds },
        },
        select: { userId: true },
      });

      if (validChildren.length !== childIds.length) {
        throw new BadRequestError('All children must be students in the same school');
      }

      await prisma.$transaction(async (tx) => {
        await tx.parentChild.deleteMany({ where: { parentId } });
        if (childIds.length > 0) {
          await tx.parentChild.createMany({
            data: childIds.map((studentId) => ({ parentId, studentId })),
            skipDuplicates: true,
          });
        }
      });

      const updatedLinks = await prisma.parentChild.findMany({
        where: {
          parentId,
          student: {
            schoolMemberships: { some: { schoolId, role: 'STUDENT' } },
          },
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              isActive: true,
            },
          },
        },
      });

      res.json({ success: true, data: updatedLinks });
    } catch (error) {
      next(error);
    }
  },
};
