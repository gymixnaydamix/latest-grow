import type { Request, Response, NextFunction } from 'express';
import { $Enums } from '@prisma/client';
import { ForbiddenError } from '../../utils/errors.js';

export type UserRole = $Enums.UserRole;

/**
 * Role-based access control middleware.
 * Usage: authorize('ADMIN', 'SCHOOL') — only allows users with those roles.
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('No user context'));
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return next(new ForbiddenError(`Role '${req.user.role}' is not authorized for this resource`));
    }

    next();
  };
}
