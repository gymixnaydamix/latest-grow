import type { Request, Response, NextFunction } from 'express';
import { authService } from '../../services/auth.service.js';
import { prisma } from '../../db/prisma.service.js';
import { config, isProduction } from '../../config/index.js';

/** Parse a duration string like "7d", "24h", "30m" into milliseconds. */
function parseDuration(dur: string): number {
  const match = dur.match(/^(\d+)\s*(d|h|m|s)$/i);
  if (!match) return 1000 * 60 * 60 * 24 * 7; // default 7 days
  const value = parseInt(match[1], 10);
  switch (match[2].toLowerCase()) {
    case 'd': return value * 86_400_000;
    case 'h': return value * 3_600_000;
    case 'm': return value * 60_000;
    case 's': return value * 1_000;
    default:  return 86_400_000 * 7;
  }
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction(),
  sameSite: 'strict' as const,
  maxAge: parseDuration(config.jwtExpiresIn),
  path: '/',
  domain: isProduction() ? config.corsOrigins[0]?.replace(/^https?:\/\//, '') : undefined,
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await authService.register(req.body);
      const memberships = await prisma.schoolMember.findMany({
        where: { userId: user.id },
        include: { school: true },
      });
      res.cookie('token', token, COOKIE_OPTIONS);
      res.status(201).json({ success: true, data: { user, memberships }, message: 'Registration successful' });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);
      const memberships = await prisma.schoolMember.findMany({
        where: { userId: user.id },
        include: { school: true },
      });
      res.cookie('token', token, COOKIE_OPTIONS);
      res.json({ success: true, data: { user, memberships }, message: 'Login successful' });
    } catch (error) {
      next(error);
    }
  },

  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie('token', { path: '/' });
      res.json({ success: true, data: null, message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.me(req.user!.userId);
      const memberships = await prisma.schoolMember.findMany({
        where: { userId: req.user!.userId },
        include: { school: true },
      });
      res.json({ success: true, data: { user, memberships } });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { firstName, lastName, avatar } = req.body;
      const user = await prisma.user.update({
        where: { id: req.user!.userId },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(avatar !== undefined && { avatar }),
        },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, avatar: true, isActive: true, createdAt: true, updatedAt: true,
        },
      });
      res.json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      res.json({ success: true, data: null, message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  },
};
