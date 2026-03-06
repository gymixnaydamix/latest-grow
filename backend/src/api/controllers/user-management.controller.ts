import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma.service.js';
import { NotFoundError, BadRequestError, ConflictError } from '../../utils/errors.js';
import bcrypt from 'bcryptjs';

/** Express 5 params can be string | string[] — helper to coerce */
const param = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

// ---------------------------------------------------------------------------
// User Management — Platform-wide CRUD with search, pagination, bulk ops
// ---------------------------------------------------------------------------

export const userManagementController = {
  /**
   * List users with pagination, search, role filter, status filter, sorting
   * GET /user-management/users?page=1&pageSize=20&search=&role=&isActive=&sortBy=createdAt&sortOrder=desc
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = '1',
        pageSize = '20',
        search = '',
        role = '',
        isActive = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query as Record<string, string>;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
      const skip = (pageNum - 1) * size;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (role) {
        where.role = role;
      }

      if (isActive === 'true') where.isActive = true;
      else if (isActive === 'false') where.isActive = false;

      // Validate sortBy
      const allowedSortFields = ['createdAt', 'updatedAt', 'firstName', 'lastName', 'email', 'role'];
      const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
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
            schoolMemberships: {
              select: { school: { select: { id: true, name: true } }, role: true },
            },
          },
          orderBy: { [safeSortBy]: safeSortOrder },
          skip,
          take: size,
        }),
        prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / size);

      res.json({
        success: true,
        data: users,
        meta: { page: pageNum, pageSize: size, total, totalPages },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single user by ID with enriched relations
   * GET /user-management/users/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: param(req.params.id) },
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
          schoolMemberships: {
            select: { school: { select: { id: true, name: true } }, role: true },
          },
          courses: { select: { id: true, name: true } },
          auditLogs: { orderBy: { timestamp: 'desc' }, take: 10, select: { id: true, action: true, timestamp: true } },
        },
      });
      if (!user) throw new NotFoundError('User not found');
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new user
   * POST /user-management/users
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName, role, avatar, isActive } = req.body;

      // Check email uniqueness
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) throw new ConflictError('A user with this email already exists');

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          role,
          avatar: avatar || null,
          isActive: isActive ?? true,
        },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, avatar: true, isActive: true, createdAt: true, updatedAt: true,
        },
      });

      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update existing user
   * PATCH /user-management/users/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      const { email, firstName, lastName, role, avatar, isActive, password } = req.body;

      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) throw new NotFoundError('User not found');

      // If email changed, check uniqueness
      if (email && email !== existing.email) {
        const dup = await prisma.user.findUnique({ where: { email } });
        if (dup) throw new ConflictError('A user with this email already exists');
      }

      const data: any = {};
      if (email !== undefined) data.email = email;
      if (firstName !== undefined) data.firstName = firstName;
      if (lastName !== undefined) data.lastName = lastName;
      if (role !== undefined) data.role = role;
      if (avatar !== undefined) data.avatar = avatar || null;
      if (isActive !== undefined) data.isActive = isActive;
      if (password) data.passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, avatar: true, isActive: true, createdAt: true, updatedAt: true,
        },
      });

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a single user
   * DELETE /user-management/users/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) throw new NotFoundError('User not found');

      await prisma.user.delete({ where: { id } });
      res.json({ success: true, data: null, message: 'User deleted' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Bulk delete users
   * POST /user-management/users/bulk-delete
   */
  async bulkDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('ids must be a non-empty array');
      }

      const result = await prisma.user.deleteMany({
        where: { id: { in: ids } },
      });

      res.json({ success: true, data: { deleted: result.count }, message: `${result.count} user(s) deleted` });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Bulk update role
   * POST /user-management/users/bulk-role
   */
  async bulkUpdateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ids, role } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('ids must be a non-empty array');
      }

      const result = await prisma.user.updateMany({
        where: { id: { in: ids } },
        data: { role },
      });

      res.json({ success: true, data: { updated: result.count }, message: `${result.count} user(s) updated` });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Export users as JSON (could be expanded to CSV)
   * GET /user-management/users/export?role=&isActive=
   */
  async exportUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role = '', isActive = '' } = req.query as Record<string, string>;

      const where: any = {};
      if (role) where.role = role;
      if (isActive === 'true') where.isActive = true;
      else if (isActive === 'false') where.isActive = false;

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, isActive: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="users-export.csv"');

      const header = 'id,email,firstName,lastName,role,isActive,createdAt\n';
      const rows = users.map(u =>
        `${u.id},${u.email},${u.firstName},${u.lastName},${u.role},${u.isActive},${u.createdAt.toISOString()}`,
      ).join('\n');

      res.send(header + rows);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user role statistics
   * GET /user-management/stats
   */
  async stats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [total, active, inactive, byRole] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { isActive: false } }),
        prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
      ]);

      const roleCounts: Record<string, number> = {};
      byRole.forEach(r => { roleCounts[r.role] = r._count.id; });

      res.json({
        success: true,
        data: { total, active, inactive, roleCounts },
      });
    } catch (error) {
      next(error);
    }
  },
};
