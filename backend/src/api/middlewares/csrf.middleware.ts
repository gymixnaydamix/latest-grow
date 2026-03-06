import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../../utils/errors.js';

const CSRF_COOKIE_NAME = 'csrfToken';
const CSRF_HEADER_NAME = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Generate a CSRF token and set it as a cookie.
 * Frontend calls GET /api/security/csrf-token to obtain the token.
 */
export function generateCsrfToken(_req: Request, res: Response): void {
  const token = crypto.randomBytes(32).toString('hex');

  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // must be readable by JS for the double-submit pattern
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
    path: '/',
  });

  res.json({ success: true, data: { token } });
}

/**
 * CSRF validation middleware for mutating requests.
 * Compares the X-CSRF-Token header against the csrfToken cookie.
 */
export function validateCsrf(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const headerToken = req.headers[CSRF_HEADER_NAME] as string | undefined;
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME] as string | undefined;

  if (!headerToken || !cookieToken) {
    return next(new BadRequestError('CSRF token missing'));
  }

  // Constant-time comparison
  if (headerToken.length !== cookieToken.length) {
    return next(new BadRequestError('CSRF token mismatch'));
  }

  const headerBuf = Buffer.from(headerToken);
  const cookieBuf = Buffer.from(cookieToken);

  if (!crypto.timingSafeEqual(headerBuf, cookieBuf)) {
    return next(new BadRequestError('CSRF token mismatch'));
  }

  next();
}
