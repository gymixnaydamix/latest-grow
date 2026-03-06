import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

const { mockSchool, mockSchoolMember, mockAuditLog } = vi.hoisted(() => ({
  mockSchool: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn() },
  mockSchoolMember: { create: vi.fn() },
  mockAuditLog: vi.fn(),
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: { school: mockSchool, schoolMember: mockSchoolMember },
}));

vi.mock('../../../services/audit.service.js', () => ({
  auditService: { log: mockAuditLog },
}));

import { schoolController } from '../../../api/controllers/school.controller.js';

describe('schoolController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('create', () => {
    it('creates a school and adds creator as member', async () => {
      const school = { id: 's1', name: 'Academy' };
      mockSchool.create.mockResolvedValueOnce(school);
      mockSchoolMember.create.mockResolvedValueOnce({});
      mockAuditLog.mockResolvedValueOnce(undefined);

      const req = mockReq({
        user: { userId: 'u1', role: 'ADMIN' } as any,
        body: { name: 'Academy' },
      });
      const res = mockRes();
      const next = mockNext();

      await schoolController.create(req, res, next);

      expect(mockSchool.create).toHaveBeenCalled();
      expect(mockSchoolMember.create).toHaveBeenCalled();
      expect(res._status).toBe(201);
    });
  });

  describe('getById', () => {
    it('returns a school when found', async () => {
      mockSchool.findUnique.mockResolvedValueOnce({ id: 's1', name: 'Academy' });

      const req = mockReq({ params: { id: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolController.getById(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: { id: 's1' } });
    });

    it('calls next with NotFoundError when missing', async () => {
      mockSchool.findUnique.mockResolvedValueOnce(null);

      const req = mockReq({ params: { id: 'x' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolController.getById(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('not found') }));
    });
  });

  describe('updateBranding', () => {
    it('updates school branding', async () => {
      const updated = { id: 's1', branding: { primaryColor: '#000' } };
      mockSchool.update.mockResolvedValueOnce(updated);
      mockAuditLog.mockResolvedValueOnce(undefined);

      const req = mockReq({
        params: { id: 's1' } as any,
        user: { userId: 'u1' } as any,
        body: { primaryColor: '#000' },
      });
      const res = mockRes();
      const next = mockNext();

      await schoolController.updateBranding(req, res, next);
      expect(res._json).toMatchObject({ success: true });
    });
  });
});
