import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

// Mock authService
vi.mock('../../../services/auth.service.js', () => ({
  authService: {
    verifyToken: vi.fn((token: string) => {
      if (token === 'valid-jwt') return { userId: 'u1', email: 'a@b.com', role: 'TEACHER' };
      throw new Error('invalid');
    }),
  },
}));

import { authenticate } from '../../../api/middlewares/auth.middleware.js';

describe('authenticate middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls next with UnauthorizedError when no token cookie', () => {
    const req = mockReq({ cookies: {} });
    const res = mockRes();
    const next = mockNext();

    authenticate(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect((next.mock.calls[0][0] as Error).message).toBe('Authentication required');
  });

  it('attaches payload to req.user and calls next on valid token', () => {
    const req = mockReq({ cookies: { token: 'valid-jwt' } });
    const res = mockRes();
    const next = mockNext();

    authenticate(req, res, next);
    expect(req.user).toEqual({ userId: 'u1', email: 'a@b.com', role: 'TEACHER' });
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next with UnauthorizedError on invalid token', () => {
    const req = mockReq({ cookies: { token: 'bad-token' } });
    const res = mockRes();
    const next = mockNext();

    authenticate(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect((next.mock.calls[0][0] as Error).message).toBe('Invalid or expired token');
  });
});
