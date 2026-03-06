import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

const { mockLibraryItem, mockLibraryLoan } = vi.hoisted(() => ({
  mockLibraryItem: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  mockLibraryLoan: { findMany: vi.fn(), create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: {
    libraryItem: mockLibraryItem,
    libraryLoan: mockLibraryLoan,
    $transaction: vi.fn((fn: any) => fn()),
  },
}));

import { libraryController } from '../../../api/controllers/library.controller.js';

describe('libraryController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('listItems', () => {
    it('returns library items', async () => {
      mockLibraryItem.findMany.mockResolvedValueOnce([{ id: 'li1', title: 'Biology 101' }]);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await libraryController.listItems(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: [{ id: 'li1' }] });
    });
  });

  describe('createItem', () => {
    it('creates a library item', async () => {
      const item = { id: 'li1', title: 'Math Book' };
      mockLibraryItem.create.mockResolvedValueOnce(item);

      const req = mockReq({ params: { schoolId: 's1' } as any, body: { title: 'Math Book', author: 'Author' } });
      const res = mockRes();
      const next = mockNext();

      await libraryController.createItem(req, res, next);
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: item });
    });
  });

  describe('updateItem', () => {
    it('updates a library item', async () => {
      const item = { id: 'li1', title: 'Updated' };
      mockLibraryItem.update.mockResolvedValueOnce(item);

      const req = mockReq({ params: { id: 'li1' } as any, body: { title: 'Updated' } });
      const res = mockRes();
      const next = mockNext();

      await libraryController.updateItem(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: item });
    });
  });

  describe('deleteItem', () => {
    it('deletes a library item', async () => {
      mockLibraryItem.delete.mockResolvedValueOnce({});

      const req = mockReq({ params: { id: 'li1' } as any });
      const res = mockRes();
      const next = mockNext();

      await libraryController.deleteItem(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: null });
    });
  });
});
