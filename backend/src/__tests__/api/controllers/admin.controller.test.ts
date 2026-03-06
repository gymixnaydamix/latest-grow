import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

const { mockApplicant, mockSchoolMember, mockUser, mockParentChild } = vi.hoisted(() => ({
  mockApplicant: { create: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
  mockSchoolMember: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  mockUser: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), findMany: vi.fn() },
  mockParentChild: { findMany: vi.fn(), deleteMany: vi.fn(), createMany: vi.fn() },
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: {
    applicant: mockApplicant,
    schoolMember: mockSchoolMember,
    user: mockUser,
    parentChild: mockParentChild,
    $transaction: vi.fn((fn: any) => fn({ user: mockUser, schoolMember: mockSchoolMember })),
  },
}));

vi.mock('bcryptjs', () => ({ default: { hash: vi.fn().mockResolvedValue('hashed') } }));

import { applicantController } from '../../../api/controllers/admin.controller.js';

describe('applicantController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('create', () => {
    it('creates an applicant with 201', async () => {
      const applicant = { id: 'a1', firstName: 'John', lastName: 'Doe', email: 'j@d.com' };
      mockApplicant.create.mockResolvedValueOnce(applicant);

      const req = mockReq({
        params: { schoolId: 's1' } as any,
        body: { firstName: 'John', lastName: 'Doe', email: 'j@d.com' },
      });
      const res = mockRes();
      const next = mockNext();

      await applicantController.create(req, res, next);

      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: applicant });
    });

    it('rejects missing fields', async () => {
      const req = mockReq({ params: { schoolId: 's1' } as any, body: {} });
      const res = mockRes();
      const next = mockNext();

      await applicantController.create(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    });
  });

  describe('list', () => {
    it('returns applicants for a school', async () => {
      const items = [{ id: 'a1', firstName: 'John' }];
      mockApplicant.findMany.mockResolvedValueOnce(items);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await applicantController.list(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: items });
    });
  });

  describe('updateStage', () => {
    it('updates applicant stage', async () => {
      const updated = { id: 'a1', stage: 'ACCEPTED' };
      mockApplicant.update.mockResolvedValueOnce(updated);

      const req = mockReq({ params: { id: 'a1' } as any, body: { stage: 'ACCEPTED' } });
      const res = mockRes();
      const next = mockNext();

      await applicantController.updateStage(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: updated });
    });

    it('rejects missing stage', async () => {
      const req = mockReq({ params: { id: 'a1' } as any, body: {} });
      const res = mockRes();
      const next = mockNext();

      await applicantController.updateStage(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
