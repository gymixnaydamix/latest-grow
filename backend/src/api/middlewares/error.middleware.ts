import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';
import { isProduction } from '../../config/index.js';

/**
 * Global error handler middleware. Must be registered last.
 * Catches all errors and returns a structured JSON response.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Log the error
  if (err instanceof AppError && err.isOperational) {
    logger.info('Operational error', {
      statusCode: err.statusCode,
      message: err.message,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error('Unexpected error', {
      message: err.message,
      stack: isProduction() ? undefined : err.stack,
      path: req.path,
      method: req.method,
    });
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details,
    });
    return;
  }

  // Unknown error — hide details in production
  res.status(500).json({
    success: false,
    error: isProduction() ? 'Internal server error' : err.message,
  });
}
