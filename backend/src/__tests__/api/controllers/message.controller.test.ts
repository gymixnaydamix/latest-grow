import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

const { mockThread, mockMessage } = vi.hoisted(() => ({
  mockThread: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  mockMessage: { create: vi.fn() },
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: { messageThread: mockThread, message: mockMessage },
}));

import { messageController } from '../../../api/controllers/message.controller.js';

describe('messageController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('createThread', () => {
    it('creates a thread with 201', async () => {
      const thread = { id: 't1', subject: 'Help' };
      mockThread.create.mockResolvedValueOnce(thread);

      const req = mockReq({
        params: { schoolId: 's1' } as any,
        body: { subject: 'Help', participantIds: ['u1', 'u2'] },
      });
      const res = mockRes();
      const next = mockNext();

      await messageController.createThread(req, res, next);
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: thread });
    });
  });

  describe('listThreads', () => {
    it('returns threads for current user', async () => {
      mockThread.findMany.mockResolvedValueOnce([{ id: 't1' }]);

      const req = mockReq({ params: { schoolId: 's1' } as any, user: { userId: 'u1' } as any });
      const res = mockRes();
      const next = mockNext();

      await messageController.listThreads(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: [{ id: 't1' }] });
    });
  });

  describe('getThread', () => {
    it('returns thread with messages', async () => {
      mockThread.findUnique.mockResolvedValueOnce({ id: 't1', messages: [] });

      const req = mockReq({ params: { id: 't1' } as any });
      const res = mockRes();
      const next = mockNext();

      await messageController.getThread(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: { id: 't1' } });
    });

    it('calls next with NotFoundError when missing', async () => {
      mockThread.findUnique.mockResolvedValueOnce(null);

      const req = mockReq({ params: { id: 'x' } as any });
      const res = mockRes();
      const next = mockNext();

      await messageController.getThread(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    it('creates a message', async () => {
      const msg = { id: 'm1', body: 'Hi', sender: { id: 'u1', firstName: 'A', lastName: 'B', avatar: null } };
      mockMessage.create.mockResolvedValueOnce(msg);
      mockThread.update.mockResolvedValueOnce({});
      mockThread.findUnique.mockResolvedValueOnce({ id: 't1', participantIds: [] });

      const req = mockReq({
        params: { threadId: 't1' } as any,
        user: { userId: 'u1' } as any,
        body: { body: 'Hi' },
      });
      const res = mockRes();
      const next = mockNext();

      await messageController.sendMessage(req, res, next);
      expect(res._status).toBe(201);
    });
  });
});
