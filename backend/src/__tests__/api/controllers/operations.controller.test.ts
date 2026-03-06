import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

const { mockFacility, mockBooking, mockPolicy, mockEvent, mockGoal } = vi.hoisted(() => ({
  mockFacility: { create: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
  mockBooking: { create: vi.fn(), findMany: vi.fn(), delete: vi.fn() },
  mockPolicy: { create: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
  mockEvent: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  mockGoal: { create: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: {
    facility: mockFacility,
    booking: mockBooking,
    policy: mockPolicy,
    schoolEvent: mockEvent,
    strategicGoal: mockGoal,
    maintenanceRequest: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
  },
}));

vi.mock('../../../services/audit.service.js', () => ({
  auditService: { log: vi.fn() },
}));

import { facilityController } from '../../../api/controllers/operations.controller.js';

describe('facilityController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('create', () => {
    it('creates a facility with 201', async () => {
      const facility = { id: 'f1', name: 'Gym', type: 'SPORTS' };
      mockFacility.create.mockResolvedValueOnce(facility);

      const req = mockReq({ params: { schoolId: 's1' } as any, body: { name: 'Gym', type: 'SPORTS', capacity: 50 } });
      const res = mockRes();
      const next = mockNext();

      await facilityController.create(req, res, next);
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: facility });
    });
  });

  describe('list', () => {
    it('returns facilities', async () => {
      mockFacility.findMany.mockResolvedValueOnce([{ id: 'f1', name: 'Gym' }]);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await facilityController.list(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: [{ id: 'f1' }] });
    });
  });

  describe('update', () => {
    it('updates a facility', async () => {
      mockFacility.update.mockResolvedValueOnce({ id: 'f1', capacity: 100 });

      const req = mockReq({ params: { id: 'f1' } as any, body: { capacity: 100 } });
      const res = mockRes();
      const next = mockNext();

      await facilityController.update(req, res, next);
      expect(res._json).toMatchObject({ success: true });
    });
  });

  describe('delete', () => {
    it('deletes a facility', async () => {
      mockFacility.delete.mockResolvedValueOnce({});

      const req = mockReq({ params: { id: 'f1' } as any });
      const res = mockRes();
      const next = mockNext();

      await facilityController.delete(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: null });
    });
  });
});
