import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

const mockUser = vi.hoisted(() => ({ update: vi.fn() }));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: { user: mockUser },
}));

vi.mock('../../../utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('node:fs', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    default: {
      ...actual.default,
      renameSync: vi.fn(),
      existsSync: vi.fn(() => true),
      mkdirSync: vi.fn(),
    },
  };
});

import { uploadController } from '../../../api/controllers/upload.controller.js';

describe('uploadController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('uploadAvatar', () => {
    it('returns 400 when no file is uploaded', async () => {
      const req = mockReq({ user: { userId: 'u1' } as any });
      const res = mockRes();
      const next = mockNext();

      await uploadController.uploadAvatar(req, res, next);

      expect(res._status).toBe(400);
      expect(res._json).toMatchObject({ success: false, message: 'No file uploaded' });
    });

    it('updates user avatar and returns url when file is provided', async () => {
      const file = {
        filename: 'test-abc.png',
        path: '/tmp/test-abc.png',
        originalname: 'photo.png',
        size: 1024,
        mimetype: 'image/png',
      };

      mockUser.update.mockResolvedValueOnce({ id: 'u1', avatar: '/uploads/avatars/test-abc.png' });

      const req = mockReq({ file: file as any, user: { userId: 'u1' } as any });
      const res = mockRes();
      const next = mockNext();

      await uploadController.uploadAvatar(req, res, next);

      expect(mockUser.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { avatar: '/uploads/avatars/test-abc.png' },
      });
      expect(res._json).toMatchObject({
        success: true,
        data: {
          url: '/uploads/avatars/test-abc.png',
          filename: 'test-abc.png',
          size: 1024,
          mimetype: 'image/png',
        },
      });
    });
  });

  describe('uploadDocument', () => {
    it('returns 400 when no file is uploaded', async () => {
      const req = mockReq({ user: { userId: 'u1' } as any });
      const res = mockRes();
      const next = mockNext();

      await uploadController.uploadDocument(req, res, next);

      expect(res._status).toBe(400);
      expect(res._json).toMatchObject({ success: false, message: 'No file uploaded' });
    });

    it('returns url and category when file is provided', async () => {
      const file = {
        filename: 'doc-xyz.pdf',
        path: '/tmp/doc-xyz.pdf',
        originalname: 'report.pdf',
        size: 2048,
        mimetype: 'application/pdf',
      };

      const req = mockReq({
        file: file as any,
        user: { userId: 'u1' } as any,
        body: { category: 'media' },
      });
      const res = mockRes();
      const next = mockNext();

      await uploadController.uploadDocument(req, res, next);

      expect(res._json).toMatchObject({
        success: true,
        data: {
          url: '/uploads/media/doc-xyz.pdf',
          filename: 'doc-xyz.pdf',
          originalName: 'report.pdf',
          size: 2048,
          mimetype: 'application/pdf',
          category: 'media',
        },
      });
    });
  });
});
