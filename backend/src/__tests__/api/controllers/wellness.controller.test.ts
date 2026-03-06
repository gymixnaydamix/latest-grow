import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

vi.mock('../../../utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { wellnessController } from '../../../api/controllers/wellness.controller.js';

describe('wellnessController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('getMetrics', () => {
    it('returns success true with wellnessScore', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      await wellnessController.getMetrics(req, res, next);

      expect(res._json).toMatchObject({
        success: true,
        data: { wellnessScore: 78 },
      });
    });
  });

  describe('getWeeklySummary', () => {
    it('returns success true with array data', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      await wellnessController.getWeeklySummary(req, res, next);

      expect(res._json).toMatchObject({ success: true });
      expect(Array.isArray((res._json as any).data)).toBe(true);
      expect((res._json as any).data.length).toBeGreaterThan(0);
    });
  });

  describe('listJournalEntries', () => {
    it('returns success true with data array', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      await wellnessController.listJournalEntries(req, res, next);

      expect(res._json).toMatchObject({ success: true });
      expect(Array.isArray((res._json as any).data)).toBe(true);
    });
  });

  describe('createJournalEntry', () => {
    it('returns 201 with new entry containing mood/summary', async () => {
      const req = mockReq({
        body: { mood: 'Happy', moodEmoji: '😄', summary: 'Great day today' },
      });
      const res = mockRes();
      const next = mockNext();

      await wellnessController.createJournalEntry(req, res, next);

      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({
        success: true,
        data: {
          mood: 'Happy',
          moodEmoji: '😄',
          summary: 'Great day today',
        },
      });
    });
  });

  describe('listGoals', () => {
    it('returns success true with data array', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      await wellnessController.listGoals(req, res, next);

      expect(res._json).toMatchObject({ success: true });
      expect(Array.isArray((res._json as any).data)).toBe(true);
    });
  });

  describe('createGoal', () => {
    it('returns 201 with new goal', async () => {
      const req = mockReq({
        body: { title: 'Run 5k', target: '8 weeks' },
      });
      const res = mockRes();
      const next = mockNext();

      await wellnessController.createGoal(req, res, next);

      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({
        success: true,
        data: {
          title: 'Run 5k',
          target: '8 weeks',
          progress: 0,
        },
      });
    });
  });

  describe('updateGoal', () => {
    it('returns updated goal when found', async () => {
      const req = mockReq({
        params: { id: 'g1' } as any,
        body: { progress: 95, current: '28 days' },
      });
      const res = mockRes();
      const next = mockNext();

      await wellnessController.updateGoal(req, res, next);

      expect(res._json).toMatchObject({
        success: true,
        data: { id: 'g1', progress: 95, current: '28 days' },
      });
    });

    it('returns 404 when goal not found', async () => {
      const req = mockReq({
        params: { id: 'nonexistent' } as any,
        body: { progress: 50 },
      });
      const res = mockRes();
      const next = mockNext();

      await wellnessController.updateGoal(req, res, next);

      expect(res._status).toBe(404);
      expect(res._json).toMatchObject({ success: false, message: 'Goal not found' });
    });
  });

  describe('getMindBodyMetrics', () => {
    it('returns success true with data array', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      await wellnessController.getMindBodyMetrics(req, res, next);

      expect(res._json).toMatchObject({ success: true });
      expect(Array.isArray((res._json as any).data)).toBe(true);
      expect((res._json as any).data.length).toBeGreaterThan(0);
    });
  });

  describe('listResources', () => {
    it('returns success true with data array', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = mockNext();

      await wellnessController.listResources(req, res, next);

      expect(res._json).toMatchObject({ success: true });
      expect(Array.isArray((res._json as any).data)).toBe(true);
      expect((res._json as any).data.length).toBeGreaterThan(0);
    });
  });
});
