import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

const { mockDeal, mockAccount } = vi.hoisted(() => ({
  mockDeal: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn(), groupBy: vi.fn(), aggregate: vi.fn() },
  mockAccount: { findMany: vi.fn(), findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: { crmDeal: mockDeal, crmAccount: mockAccount },
}));

vi.mock('../../../utils/logger.js', () => ({ logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() } }));

import { crmDealController } from '../../../api/controllers/crm.controller.js';

describe('crmDealController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('list', () => {
    it('returns paginated deals', async () => {
      mockDeal.findMany.mockResolvedValueOnce([{ id: 'd1', name: 'Deal A' }]);
      mockDeal.count.mockResolvedValueOnce(1);

      const req = mockReq({ query: { page: '1', pageSize: '20' } as any });
      const res = mockRes();
      const next = mockNext();

      await crmDealController.list(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: [{ id: 'd1' }] });
    });

    it('filters by stage', async () => {
      mockDeal.findMany.mockResolvedValueOnce([]);
      mockDeal.count.mockResolvedValueOnce(0);

      const req = mockReq({ query: { stage: 'PROSPECT' } as any });
      const res = mockRes();
      const next = mockNext();

      await crmDealController.list(req, res, next);
      expect(mockDeal.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ stage: 'PROSPECT' }),
      }));
    });
  });

  describe('getById', () => {
    it('returns a deal when found', async () => {
      mockDeal.findUnique.mockResolvedValueOnce({ id: 'd1', name: 'Deal' });

      const req = mockReq({ params: { id: 'd1' } as any });
      const res = mockRes();
      const next = mockNext();

      await crmDealController.getById(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: { id: 'd1' } });
    });

    it('calls next with NotFoundError if missing', async () => {
      mockDeal.findUnique.mockResolvedValueOnce(null);

      const req = mockReq({ params: { id: 'x' } as any });
      const res = mockRes();
      const next = mockNext();

      await crmDealController.getById(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('creates a deal with 201', async () => {
      const deal = { id: 'd1', name: 'New Deal', value: 5000 };
      mockDeal.create.mockResolvedValueOnce(deal);

      const req = mockReq({ body: { name: 'New Deal', value: 5000 } });
      const res = mockRes();
      const next = mockNext();

      await crmDealController.create(req, res, next);
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: deal });
    });
  });
});
