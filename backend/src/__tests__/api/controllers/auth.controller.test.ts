import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

const { mockRegister, mockLogin, mockFindMany } = vi.hoisted(() => ({
  mockRegister: vi.fn(),
  mockLogin: vi.fn(),
  mockFindMany: vi.fn(),
}));

vi.mock('../../../services/auth.service.js', () => ({
  authService: { register: mockRegister, login: mockLogin },
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: { schoolMember: { findMany: mockFindMany } },
}));

vi.mock('../../../config/index.js', () => ({
  config: { jwtExpiresIn: '7d', corsOrigins: ['http://localhost:3000'] },
  isProduction: () => false,
}));

import { authController } from '../../../api/controllers/auth.controller.js';

describe('authController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('register', () => {
    it('creates user and returns 201 with token cookie', async () => {
      const user = { id: 'u1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'STUDENT' };
      mockRegister.mockResolvedValueOnce({ user, token: 'tok123' });
      mockFindMany.mockResolvedValueOnce([]);

      const req = mockReq({ body: { email: 'a@b.com', password: 'password123', firstName: 'A', lastName: 'B', role: 'STUDENT' } });
      const res = mockRes();
      const next = mockNext();

      await authController.register(req, res, next);

      expect(mockRegister).toHaveBeenCalledWith(req.body);
      expect(res.cookie).toHaveBeenCalledWith('token', 'tok123', expect.objectContaining({ httpOnly: true }));
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: { user } });
    });

    it('calls next on error', async () => {
      mockRegister.mockRejectedValueOnce(new Error('dup'));
      const req = mockReq({ body: {} });
      const res = mockRes();
      const next = mockNext();

      await authController.register(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('login', () => {
    it('returns user and sets token cookie', async () => {
      const user = { id: 'u1', email: 'a@b.com', role: 'ADMIN' };
      mockLogin.mockResolvedValueOnce({ user, token: 'tok456' });
      mockFindMany.mockResolvedValueOnce([{ schoolId: 's1', school: { name: 'S' } }]);

      const req = mockReq({ body: { email: 'a@b.com', password: 'pass' } });
      const res = mockRes();
      const next = mockNext();

      await authController.login(req, res, next);

      expect(mockLogin).toHaveBeenCalledWith('a@b.com', 'pass');
      expect(res.cookie).toHaveBeenCalled();
      expect(res._json).toMatchObject({ success: true });
    });

    it('calls next on invalid credentials', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Invalid'));
      const req = mockReq({ body: { email: 'x', password: 'x' } });
      const res = mockRes();
      const next = mockNext();

      await authController.login(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
