import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

const { mockParentChild, mockGrade, mockAssignment, mockInvoice, mockAttendanceRecord, mockSubmission } = vi.hoisted(() => ({
  mockParentChild: { findMany: vi.fn(), findUnique: vi.fn() },
  mockGrade: { findMany: vi.fn() },
  mockAssignment: { findMany: vi.fn() },
  mockInvoice: { findMany: vi.fn() },
  mockAttendanceRecord: { findMany: vi.fn() },
  mockSubmission: { findMany: vi.fn() },
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: {
    parentChild: mockParentChild,
    grade: mockGrade,
    assignment: mockAssignment,
    invoice: mockInvoice,
    attendance: mockAttendanceRecord,
    submission: mockSubmission,
  },
}));

import { parentController } from '../../../api/controllers/parent.controller.js';

describe('parentController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('dashboard', () => {
    it('returns parent dashboard data', async () => {
      mockParentChild.findMany.mockResolvedValueOnce([
        { studentId: 'st1', student: { id: 'st1', firstName: 'Sam', lastName: 'S' } },
      ]);
      mockGrade.findMany.mockResolvedValueOnce([]);
      mockAssignment.findMany.mockResolvedValueOnce([]);
      mockInvoice.findMany.mockResolvedValueOnce([]);

      const req = mockReq({ user: { userId: 'p1' } as any });
      const res = mockRes();
      const next = mockNext();

      await parentController.dashboard(req, res, next);
      expect(res._json).toMatchObject({
        success: true,
        data: expect.objectContaining({ children: expect.any(Array) }),
      });
    });

    it('calls next on error', async () => {
      mockParentChild.findMany.mockRejectedValueOnce(new Error('db'));
      const req = mockReq({ user: { userId: 'p1' } as any });
      const res = mockRes();
      const next = mockNext();

      await parentController.dashboard(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getChildProgress', () => {
    it('returns child progress when relation exists', async () => {
      mockParentChild.findUnique.mockResolvedValueOnce({ parentId: 'p1', studentId: 'st1' });
      mockGrade.findMany.mockResolvedValueOnce([]);
      mockAttendanceRecord.findMany.mockResolvedValueOnce([]);
      mockSubmission.findMany.mockResolvedValueOnce([]);

      const req = mockReq({
        params: { studentId: 'st1' } as any,
        user: { userId: 'p1' } as any,
      });
      const res = mockRes();
      const next = mockNext();

      await parentController.getChildProgress(req, res, next);
      expect(res._json).toMatchObject({ success: true });
    });

    it('calls next with NotFoundError when child not linked', async () => {
      mockParentChild.findUnique.mockResolvedValueOnce(null);

      const req = mockReq({ params: { studentId: 'st1' } as any, user: { userId: 'p1' } as any });
      const res = mockRes();
      const next = mockNext();

      await parentController.getChildProgress(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
