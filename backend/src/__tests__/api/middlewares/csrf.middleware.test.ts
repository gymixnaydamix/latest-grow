import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';
import { generateCsrfToken, validateCsrf } from '../../../api/middlewares/csrf.middleware.js';

describe('generateCsrfToken', () => {
  it('sets cookie and returns JSON with token', () => {
    const req = mockReq();
    const res = mockRes();

    generateCsrfToken(req, res);

    expect(res.cookie).toHaveBeenCalledWith(
      'csrfToken',
      expect.any(String),
      expect.objectContaining({ httpOnly: false, sameSite: 'strict' }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: { token: expect.any(String) } }),
    );
  });
});

describe('validateCsrf', () => {
  const TOKEN = 'a'.repeat(64);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips validation for GET requests', () => {
    const req = mockReq({ method: 'GET' });
    const res = mockRes();
    const next = mockNext();

    validateCsrf(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('skips validation for HEAD requests', () => {
    const req = mockReq({ method: 'HEAD' });
    const next = mockNext();
    validateCsrf(req, mockRes(), next);
    expect(next).toHaveBeenCalledWith();
  });

  it('passes when header matches cookie', () => {
    const req = mockReq({
      method: 'POST',
      headers: { 'x-csrf-token': TOKEN },
      cookies: { csrfToken: TOKEN },
    });
    const next = mockNext();

    validateCsrf(req, mockRes(), next);
    expect(next).toHaveBeenCalledWith();
  });

  it('fails when header is missing', () => {
    const req = mockReq({
      method: 'POST',
      headers: {},
      cookies: { csrfToken: TOKEN },
    });
    const next = mockNext();

    validateCsrf(req, mockRes(), next);
    expect(next).toHaveBeenCalledTimes(1);
    expect((next.mock.calls[0][0] as Error).message).toBe('CSRF token missing');
  });

  it('fails when cookie is missing', () => {
    const req = mockReq({
      method: 'POST',
      headers: { 'x-csrf-token': TOKEN },
      cookies: {},
    });
    const next = mockNext();

    validateCsrf(req, mockRes(), next);
    expect((next.mock.calls[0][0] as Error).message).toBe('CSRF token missing');
  });

  it('fails on length mismatch', () => {
    const req = mockReq({
      method: 'POST',
      headers: { 'x-csrf-token': 'short' },
      cookies: { csrfToken: TOKEN },
    });
    const next = mockNext();

    validateCsrf(req, mockRes(), next);
    expect((next.mock.calls[0][0] as Error).message).toBe('CSRF token mismatch');
  });

  it('fails when tokens differ (timing-safe comparison)', () => {
    const differentToken = 'b'.repeat(64);
    const req = mockReq({
      method: 'POST',
      headers: { 'x-csrf-token': differentToken },
      cookies: { csrfToken: TOKEN },
    });
    const next = mockNext();

    validateCsrf(req, mockRes(), next);
    expect((next.mock.calls[0][0] as Error).message).toBe('CSRF token mismatch');
  });
});
