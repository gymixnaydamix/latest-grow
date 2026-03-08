import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

const { mockAnnouncement } = vi.hoisted(() => ({
  mockAnnouncement: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: { announcement: mockAnnouncement },
}));

import { announcementController } from '../../../api/controllers/announcement.controller.js';

describe('announcementController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('create', () => {
    it('creates an announcement and returns 201', async () => {
      const item = { id: 'an1', title: 'Hello', body: 'World' };
      mockAnnouncement.create.mockResolvedValueOnce(item);

      const req = mockReq({
        params: { schoolId: 's1' } as any,
        user: { userId: 'u1', role: 'ADMIN' } as any,
        body: { title: 'Hello', body: 'World', audience: ['STUDENT'] },
      });
      const res = mockRes();
      const next = mockNext();

      await announcementController.create(req, res, next);
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: item });
    });
  });

  describe('list', () => {
    it('returns paginated announcements', async () => {
      mockAnnouncement.findMany.mockResolvedValueOnce([{ id: 'an1' }]);
      mockAnnouncement.count.mockResolvedValueOnce(1);

      const req = mockReq({ params: { schoolId: 's1' } as any, query: { page: 1, pageSize: 20 } as any });
      const res = mockRes();
      const next = mockNext();

      await announcementController.list(req, res, next);
      expect(res._json).toMatchObject({
        success: true,
        data: {
          items: [{ id: 'an1' }],
          total: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        },
      });
    });
  });

  describe('getById', () => {
    it('returns announcement when found', async () => {
      const item = { id: 'an1', title: 'A' };
      mockAnnouncement.findUnique.mockResolvedValueOnce(item);

      const req = mockReq({ params: { id: 'an1' } as any });
      const res = mockRes();
      const next = mockNext();

      await announcementController.getById(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: item });
    });

    it('calls next with NotFoundError when missing', async () => {
      mockAnnouncement.findUnique.mockResolvedValueOnce(null);
      const req = mockReq({ params: { id: 'x' } as any });
      const res = mockRes();
      const next = mockNext();

      await announcementController.getById(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
