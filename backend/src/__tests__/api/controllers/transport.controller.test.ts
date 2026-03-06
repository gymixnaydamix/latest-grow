import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

const { mockRoute, mockStop, mockAssignment, mockEvent } = vi.hoisted(() => ({
  mockRoute: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  mockStop: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  mockAssignment: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  mockEvent: { findMany: vi.fn(), create: vi.fn() },
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: {
    transportRoute: mockRoute,
    transportStop: mockStop,
    transportAssignment: mockAssignment,
    transportEvent: mockEvent,
  },
}));

import { transportController } from '../../../api/controllers/transport.controller.js';

describe('transportController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('listRoutes', () => {
    it('returns transport routes', async () => {
      mockRoute.findMany.mockResolvedValueOnce([{ id: 'r1', name: 'Route A' }]);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await transportController.listRoutes(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: [{ id: 'r1' }] });
    });
  });

  describe('createRoute', () => {
    it('creates a route with 201', async () => {
      const route = { id: 'r1', name: 'Route A' };
      mockRoute.create.mockResolvedValueOnce(route);

      const req = mockReq({ params: { schoolId: 's1' } as any, body: { name: 'Route A' } });
      const res = mockRes();
      const next = mockNext();

      await transportController.createRoute(req, res, next);
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: route });
    });
  });

  describe('updateRoute', () => {
    it('updates a route', async () => {
      mockRoute.update.mockResolvedValueOnce({ id: 'r1', name: 'Updated' });

      const req = mockReq({ params: { id: 'r1' } as any, body: { name: 'Updated' } });
      const res = mockRes();
      const next = mockNext();

      await transportController.updateRoute(req, res, next);
      expect(res._json).toMatchObject({ success: true });
    });
  });

  describe('deleteRoute', () => {
    it('deletes a route', async () => {
      mockRoute.delete.mockResolvedValueOnce({});

      const req = mockReq({ params: { id: 'r1' } as any });
      const res = mockRes();
      const next = mockNext();

      await transportController.deleteRoute(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: null });
    });
  });

  describe('createStop', () => {
    it('creates a stop with 201', async () => {
      const stop = { id: 'st1', name: 'Main St' };
      mockStop.create.mockResolvedValueOnce(stop);

      const req = mockReq({ params: { id: 'r1' } as any, body: { name: 'Main St', sequence: 1 } });
      const res = mockRes();
      const next = mockNext();

      await transportController.createStop(req, res, next);
      expect(res._status).toBe(201);
    });
  });
});
