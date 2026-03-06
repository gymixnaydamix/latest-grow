import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

const { mockPlatformConfig, mockFeatureFlag, mockApiKey } = vi.hoisted(() => ({
  mockPlatformConfig: { findMany: vi.fn(), upsert: vi.fn() },
  mockFeatureFlag: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
  mockApiKey: { findMany: vi.fn(), create: vi.fn(), delete: vi.fn() },
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: {
    platformConfig: mockPlatformConfig,
    featureFlag: mockFeatureFlag,
    aBTest: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    integration: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    webhook: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    apiKey: mockApiKey,
    ipRule: { findMany: vi.fn(), create: vi.fn(), delete: vi.fn() },
    platformRole: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    authSetting: { findMany: vi.fn(), upsert: vi.fn() },
    legalDocument: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    complianceCert: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    notificationRule: { findMany: vi.fn(), upsert: vi.fn() },
    $transaction: vi.fn((ops: any[]) => Promise.all(ops)),
  },
}));

import { platformConfigController } from '../../../api/controllers/settings.controller.js';

describe('platformConfigController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('list', () => {
    it('returns all configs', async () => {
      mockPlatformConfig.findMany.mockResolvedValueOnce([{ key: 'app_name', value: 'GROW' }]);

      const req = mockReq({ query: {} as any });
      const res = mockRes();
      const next = mockNext();

      await platformConfigController.list(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: [{ key: 'app_name' }] });
    });

    it('filters by group', async () => {
      mockPlatformConfig.findMany.mockResolvedValueOnce([]);

      const req = mockReq({ query: { group: 'branding' } as any });
      const res = mockRes();
      const next = mockNext();

      await platformConfigController.list(req, res, next);
      expect(mockPlatformConfig.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { group: 'branding' },
      }));
    });
  });

  describe('upsert', () => {
    it('upserts a config value', async () => {
      const cfg = { key: 'app_name', value: 'GROW 2.0' };
      mockPlatformConfig.upsert.mockResolvedValueOnce(cfg);

      const req = mockReq({ body: { key: 'app_name', value: 'GROW 2.0', type: 'string', label: '', group: 'general' } });
      const res = mockRes();
      const next = mockNext();

      await platformConfigController.upsert(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: cfg });
    });
  });
});
