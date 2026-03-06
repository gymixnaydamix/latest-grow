import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

const mockTenant = vi.hoisted(() => ({ count: vi.fn() }));
const mockUserModel = vi.hoisted(() => ({ count: vi.fn() }));
const mockSchool = vi.hoisted(() => ({ count: vi.fn() }));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: {
    tenant: mockTenant,
    user: mockUserModel,
    school: mockSchool,
  },
}));

vi.mock('../../../utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import {
  getOverviewMetrics,
  getPlatformAnalytics,
  getMarketIntelligence,
  getSystemHealth,
  getOverlaySettings,
  updateOverlaySettings,
} from '../../../api/controllers/analytics.controller.js';

describe('analyticsController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('getOverviewMetrics', () => {
    it('returns tenants/users/schools counts', async () => {
      mockTenant.count.mockResolvedValueOnce(5);
      mockUserModel.count.mockResolvedValueOnce(120);
      mockSchool.count.mockResolvedValueOnce(3);

      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      await getOverviewMetrics(req, res, next);

      expect(res._json).toMatchObject({
        success: true,
        data: { tenants: 5, users: 120, schools: 3 },
      });
    });

    it('calls next on error', async () => {
      const error = new Error('DB connection failed');
      mockTenant.count.mockRejectedValueOnce(error);

      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      await getOverviewMetrics(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getPlatformAnalytics', () => {
    it('returns kpis, mrrData, and topPages', async () => {
      mockUserModel.count.mockResolvedValueOnce(50);

      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      await getPlatformAnalytics(req, res, next);

      const json = res._json as any;
      expect(json.success).toBe(true);
      expect(json.data.kpis).toBeDefined();
      expect(Array.isArray(json.data.mrrData)).toBe(true);
      expect(json.data.mrrData.length).toBe(12);
      expect(Array.isArray(json.data.topPages)).toBe(true);
      expect(json.data.topPages.length).toBeGreaterThan(0);
    });
  });

  describe('getMarketIntelligence', () => {
    it('returns kpis and competitors', async () => {
      mockTenant.count.mockResolvedValueOnce(10);

      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      await getMarketIntelligence(req, res, next);

      const json = res._json as any;
      expect(json.success).toBe(true);
      expect(json.data.kpis).toBeDefined();
      expect(json.data.tenants).toBe(10);
      expect(Array.isArray(json.data.competitors)).toBe(true);
      expect(json.data.competitors.length).toBeGreaterThan(0);
    });
  });

  describe('getSystemHealth', () => {
    it('returns process data and services', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      await getSystemHealth(req, res, next);

      const json = res._json as any;
      expect(json.success).toBe(true);
      expect(json.data.process).toBeDefined();
      expect(json.data.process.heapUsedMB).toBeGreaterThan(0);
      expect(json.data.process.uptimeHours).toBeDefined();
      expect(Array.isArray(json.data.services)).toBe(true);
      expect(json.data.services.length).toBeGreaterThan(0);
    });
  });

  describe('getOverlaySettings', () => {
    it('returns success true', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      await getOverlaySettings(req, res, next);

      expect(res._json).toMatchObject({ success: true });
    });
  });

  describe('updateOverlaySettings', () => {
    it('updates settings from body and returns success true', async () => {
      const req = mockReq({
        body: { chat: { enabled: true }, notifications: { enabled: false } },
      });
      const res = mockRes();
      const next = mockNext();

      await updateOverlaySettings(req, res, next);

      const json = res._json as any;
      expect(json.success).toBe(true);
      expect(json.data.chat).toEqual({ enabled: true });
      expect(json.data.notifications).toEqual({ enabled: false });
    });
  });
});
