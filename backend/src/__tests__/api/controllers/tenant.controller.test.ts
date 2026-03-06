import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

const {
  mockTenant,
  mockSchool,
  mockLogger,
  mockFetch,
} = vi.hoisted(() => ({
  mockTenant: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  mockSchool: { create: vi.fn() },
  mockLogger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
  mockFetch: vi.fn(),
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: {
    tenant: mockTenant,
    school: mockSchool,
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn({ tenant: mockTenant, school: mockSchool })),
  },
}));

vi.mock('../../../utils/logger.js', () => ({ logger: mockLogger }));

import { tenantController } from '../../../api/controllers/tenant.controller.js';

describe('tenantController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('list', () => {
    it('returns paginated tenants', async () => {
      mockTenant.findMany.mockResolvedValueOnce([{ id: 't1', name: 'School A' }]);
      mockTenant.count.mockResolvedValueOnce(1);

      const req = mockReq({ query: { page: '1', pageSize: '20' } as any });
      const res = mockRes();
      const next = mockNext();

      await tenantController.list(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: [{ id: 't1' }] });
    });

    it('filters by type', async () => {
      mockTenant.findMany.mockResolvedValueOnce([]);
      mockTenant.count.mockResolvedValueOnce(0);

      const req = mockReq({ query: { type: 'SCHOOL' } as any });
      const res = mockRes();
      const next = mockNext();

      await tenantController.list(req, res, next);
      expect(mockTenant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ type: 'SCHOOL' }) }),
      );
    });
  });

  describe('getById', () => {
    it('returns tenant when found', async () => {
      mockTenant.findUnique.mockResolvedValueOnce({ id: 't1', name: 'School A' });

      const req = mockReq({ params: { id: 't1' } as any });
      const res = mockRes();
      const next = mockNext();

      await tenantController.getById(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: { id: 't1' } });
    });

    it('calls next with NotFoundError when missing', async () => {
      mockTenant.findUnique.mockResolvedValueOnce(null);

      const req = mockReq({ params: { id: 'x' } as any });
      const res = mockRes();
      const next = mockNext();

      await tenantController.getById(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('creates a school tenant with persisted location fields', async () => {
      mockTenant.findUnique.mockResolvedValueOnce(null);
      mockSchool.create.mockResolvedValueOnce({ id: 's1' });
      mockTenant.create.mockResolvedValueOnce({ id: 't1', name: 'New School', type: 'SCHOOL' });

      const req = mockReq({
        body: {
          name: 'New School',
          type: 'SCHOOL',
          email: 'a@b.com',
          phone: '+1-555-0100',
          address: '123 Main St',
          website: 'https://newschool.edu',
          latitude: 35.21,
          longitude: -7.89,
        },
      });
      const res = mockRes();
      const next = mockNext();

      await tenantController.create(req, res, next);

      expect(mockSchool.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'New School',
            email: 'a@b.com',
            phone: '+1-555-0100',
            address: '123 Main St',
            website: 'https://newschool.edu',
            latitude: 35.21,
            longitude: -7.89,
          }),
        }),
      );
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: { id: 't1' } });
    });
  });

  describe('geocode', () => {
    it('returns normalized geocode payload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([{
          lat: '35.2031',
          lon: '-7.9822',
          display_name: 'Springfield Academy',
          boundingbox: ['35.1931', '35.2131', '-7.9922', '-7.9722'],
        }]),
      });

      const req = mockReq({ query: { query: 'Springfield Academy Main St' } as any });
      const res = mockRes();
      const next = mockNext();

      await tenantController.geocode(req, res, next);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res._json).toMatchObject({
        success: true,
        data: {
          latitude: 35.2031,
          longitude: -7.9822,
          displayName: 'Springfield Academy',
          boundingBox: {
            south: 35.1931,
            north: 35.2131,
            west: -7.9922,
            east: -7.9722,
          },
        },
      });
    });

    it('uses cache for normalized duplicate queries', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([{
          lat: '40.7128',
          lon: '-74.0060',
          display_name: 'New York, NY',
          boundingbox: ['40.7000', '40.7300', '-74.0200', '-73.9800'],
        }]),
      });

      const resA = mockRes();
      const resB = mockRes();

      await tenantController.geocode(
        mockReq({ query: { query: 'New York, NY' } as any }),
        resA,
        mockNext(),
      );
      await tenantController.geocode(
        mockReq({ query: { query: '  new   york, ny  ' } as any }),
        resB,
        mockNext(),
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(resB._json).toMatchObject({ success: true, data: expect.objectContaining({ displayName: 'New York, NY' }) });
    });

    it('calls next with NotFoundError when no geocode matches', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([]),
      });

      const req = mockReq({ query: { query: 'Unknown Address 0000' } as any });
      const res = mockRes();
      const next = mockNext();

      await tenantController.geocode(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('No location found') }),
      );
    });
  });
});

