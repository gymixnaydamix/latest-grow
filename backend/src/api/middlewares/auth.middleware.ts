import type { Request, Response, NextFunction } from 'express';
import { authService, type JwtPayload } from '../../services/auth.service.js';
import { UnauthorizedError } from '../../utils/errors.js';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware.
 * Extracts JWT from HttpOnly cookie named "token" and attaches decoded payload to req.user.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    return next(new UnauthorizedError('Authentication required'));
  }

  try {
    const payload = authService.verifyToken(token);
    req.user = payload;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
