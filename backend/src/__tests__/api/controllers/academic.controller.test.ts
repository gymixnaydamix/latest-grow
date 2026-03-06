import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

const { mockCreate, mockFindMany, mockFindUnique, mockUpdate, mockDelete, mockCount } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockFindMany: vi.fn(),
  mockFindUnique: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
  mockCount: vi.fn(),
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: {
    course: { create: mockCreate, findMany: mockFindMany, findUnique: mockFindUnique, update: mockUpdate, delete: mockDelete },
    courseEnrollment: { create: vi.fn(), findMany: vi.fn(), delete: vi.fn() },
    assignment: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    submission: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
    grade: { create: vi.fn(), upsert: vi.fn(), findMany: vi.fn() },
    attendanceRecord: { createMany: vi.fn(), findMany: vi.fn(), count: mockCount, groupBy: vi.fn() },
    session: { create: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

import { courseController } from '../../../api/controllers/academic.controller.js';

describe('courseController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('create', () => {
    it('creates a course and returns 201', async () => {
      const course = { id: 'c1', name: 'Math', schoolId: 's1' };
      mockCreate.mockResolvedValueOnce(course);

      const req = mockReq({
        params: { schoolId: 's1' } as any,
        body: { name: 'Math', description: '', gradeLevel: '10', semester: 'Fall', teacherId: 't1' },
      });
      const res = mockRes();
      const next = mockNext();

      await courseController.create(req, res, next);

      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ name: 'Math', schoolId: 's1' }),
      }));
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: course });
    });

    it('calls next on error', async () => {
      mockCreate.mockRejectedValueOnce(new Error('fail'));
      const req = mockReq({ params: { schoolId: 's1' } as any, body: {} });
      const res = mockRes();
      const next = mockNext();

      await courseController.create(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('list', () => {
    it('returns courses for a school', async () => {
      const courses = [{ id: 'c1', name: 'Math' }];
      mockFindMany.mockResolvedValueOnce(courses);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await courseController.list(req, res, next);

      expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { schoolId: 's1' },
      }));
      expect(res._json).toMatchObject({ success: true, data: courses });
    });
  });

  describe('getById', () => {
    it('returns a course when found', async () => {
      const course = { id: 'c1', name: 'Math' };
      mockFindUnique.mockResolvedValueOnce(course);

      const req = mockReq({ params: { id: 'c1' } as any });
      const res = mockRes();
      const next = mockNext();

      await courseController.getById(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: course });
    });

    it('calls next with NotFoundError when course missing', async () => {
      mockFindUnique.mockResolvedValueOnce(null);
      const req = mockReq({ params: { id: 'x' } as any });
      const res = mockRes();
      const next = mockNext();

      await courseController.getById(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('not found') }));
    });
  });
});
