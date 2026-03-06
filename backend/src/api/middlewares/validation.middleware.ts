import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

interface ValidationTarget {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Zod validation middleware.
 * Validates req.body, req.query, and/or req.params against provided schemas.
 * On failure, returns 400 with structured details.
 */
export function validate(schemas: ValidationTarget) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: Record<string, string[]> = {};

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.body = formatZodErrors(result.error);
        req.body = req.body;
      } else {
        req.body = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.query = formatZodErrors(result.error);
      } else {
        (req as Request & { query: Record<string, unknown> }).query = result.data as Record<string, string>;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.params = formatZodErrors(result.error);
      } else {
        req.params = result.data as Record<string, string>;
      }
    }

    if (Object.keys(errors).length > 0) {
      logger.info('Validation failed', { path: req.path, errors });
      return next(new BadRequestError('Validation failed', errors));
    }

    next();
  };
}

function formatZodErrors(error: ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}
