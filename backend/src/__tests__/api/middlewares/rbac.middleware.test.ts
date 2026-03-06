import { describe, it, expect } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';
import { authorize } from '../../../api/middlewares/rbac.middleware.js';

describe('authorize middleware', () => {
  it('calls next with ForbiddenError when no req.user', () => {
    const middleware = authorize('ADMIN');
    const next = mockNext();

    middleware(mockReq({ user: undefined }), mockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((next.mock.calls[0][0] as Error).message).toBe('No user context');
  });

  it('calls next() when user role is in allowed list', () => {
    const middleware = authorize('TEACHER', 'ADMIN');
    const next = mockNext();

    middleware(
      mockReq({ user: { userId: 'u1', email: 'a@b.com', role: 'TEACHER' } }),
      mockRes(),
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });

  it('calls next with ForbiddenError when role is not allowed', () => {
    const middleware = authorize('ADMIN');
    const next = mockNext();

    middleware(
      mockReq({ user: { userId: 'u1', email: 'a@b.com', role: 'STUDENT' } }),
      mockRes(),
      next,
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect((next.mock.calls[0][0] as Error).message).toContain("'STUDENT' is not authorized");
  });

  it('works with multiple allowed roles', () => {
    const middleware = authorize('TEACHER', 'SCHOOL', 'ADMIN');
    const next = mockNext();

    middleware(
      mockReq({ user: { userId: 'u1', email: 'a@b.com', role: 'SCHOOL' } }),
      mockRes(),
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });
});
