import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

const { mockTuitionPlan, mockInvoice, mockPayment, mockBudget, mockPayroll, mockGrant, mockInvoiceItem } = vi.hoisted(() => ({
  mockTuitionPlan: { create: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
  mockInvoice: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), count: vi.fn() },
  mockPayment: { create: vi.fn(), findMany: vi.fn() },
  mockBudget: { create: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
  mockPayroll: { create: vi.fn(), findMany: vi.fn() },
  mockGrant: { create: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
  mockInvoiceItem: { createMany: vi.fn() },
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: {
    tuitionPlan: mockTuitionPlan,
    invoice: mockInvoice,
    invoiceItem: mockInvoiceItem,
    payment: mockPayment,
    budget: mockBudget,
    payroll: mockPayroll,
    grant: mockGrant,
    $transaction: vi.fn((fn: any) => fn()),
  },
}));

import { tuitionController } from '../../../api/controllers/finance.controller.js';

describe('tuitionController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('create', () => {
    it('creates a plan with 201', async () => {
      const plan = { id: 'tp1', name: 'Grade 10', amount: 500 };
      mockTuitionPlan.create.mockResolvedValueOnce(plan);

      const req = mockReq({ params: { schoolId: 's1' } as any, body: { name: 'Grade 10', gradeLevel: '10', amount: 500 } });
      const res = mockRes();
      const next = mockNext();

      await tuitionController.create(req, res, next);
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: plan });
    });
  });

  describe('list', () => {
    it('returns tuition plans', async () => {
      mockTuitionPlan.findMany.mockResolvedValueOnce([{ id: 'tp1' }]);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await tuitionController.list(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: [{ id: 'tp1' }] });
    });
  });

  describe('update', () => {
    it('updates a plan', async () => {
      const updated = { id: 'tp1', amount: 600 };
      mockTuitionPlan.update.mockResolvedValueOnce(updated);

      const req = mockReq({ params: { id: 'tp1' } as any, body: { amount: 600 } });
      const res = mockRes();
      const next = mockNext();

      await tuitionController.update(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: updated });
    });
  });

  describe('delete', () => {
    it('deletes a plan', async () => {
      mockTuitionPlan.delete.mockResolvedValueOnce({});

      const req = mockReq({ params: { id: 'tp1' } as any });
      const res = mockRes();
      const next = mockNext();

      await tuitionController.delete(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: null });
    });
  });
});
