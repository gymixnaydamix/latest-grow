import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

const { mockUser } = vi.hoisted(() => ({
  mockUser: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), updateMany: vi.fn(), count: vi.fn() },
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: { user: mockUser },
}));

vi.mock('bcryptjs', () => ({ default: { hash: vi.fn().mockResolvedValue('hashed') } }));

import { userManagementController } from '../../../api/controllers/user-management.controller.js';

describe('userManagementController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('list', () => {
    it('returns paginated users', async () => {
      mockUser.findMany.mockResolvedValueOnce([{ id: 'u1', email: 'a@b.com' }]);
      mockUser.count.mockResolvedValueOnce(1);

      const req = mockReq({ query: { page: '1', pageSize: '20' } as any });
      const res = mockRes();
      const next = mockNext();

      await userManagementController.list(req, res, next);
      expect(res._json).toMatchObject({ success: true });
    });

    it('filters by role', async () => {
      mockUser.findMany.mockResolvedValueOnce([]);
      mockUser.count.mockResolvedValueOnce(0);

      const req = mockReq({ query: { role: 'ADMIN' } as any });
      const res = mockRes();
      const next = mockNext();

      await userManagementController.list(req, res, next);
      expect(mockUser.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ role: 'ADMIN' }) }),
      );
    });

    it('searches by name or email', async () => {
      mockUser.findMany.mockResolvedValueOnce([]);
      mockUser.count.mockResolvedValueOnce(0);

      const req = mockReq({ query: { search: 'Alice' } as any });
      const res = mockRes();
      const next = mockNext();

      await userManagementController.list(req, res, next);
      expect(mockUser.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) }),
      );
    });
  });

  describe('getById', () => {
    it('returns a user when found', async () => {
      mockUser.findUnique.mockResolvedValueOnce({ id: 'u1', email: 'a@b.com' });

      const req = mockReq({ params: { id: 'u1' } as any });
      const res = mockRes();
      const next = mockNext();

      await userManagementController.getById(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: { id: 'u1' } });
    });

    it('calls next with NotFoundError when missing', async () => {
      mockUser.findUnique.mockResolvedValueOnce(null);

      const req = mockReq({ params: { id: 'x' } as any });
      const res = mockRes();
      const next = mockNext();

      await userManagementController.getById(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('creates a user with 201', async () => {
      mockUser.findUnique.mockResolvedValueOnce(null);
      const user = { id: 'u1', email: 'new@b.com', firstName: 'New', lastName: 'User' };
      mockUser.create.mockResolvedValueOnce(user);

      const req = mockReq({ body: { email: 'new@b.com', password: 'pass1234', firstName: 'New', lastName: 'User', role: 'STUDENT' } });
      const res = mockRes();
      const next = mockNext();

      await userManagementController.create(req, res, next);
      expect(res._status).toBe(201);
    });
  });
});
