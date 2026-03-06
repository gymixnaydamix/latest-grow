import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { prisma } from '../db/prisma.service.js';
import { config, isDevelopment } from '../config/index.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { cacheService } from './cache.service.js';
import type { UserRole } from '../api/middlewares/rbac.middleware.js';

const SALT_ROUNDS = 12;

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

function toProfile(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): UserProfile {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    avatar: user.avatar,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const authService = {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }): Promise<{ user: UserProfile; token: string }> {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    logger.info('User registered', { userId: user.id, role: user.role });

    return { user: toProfile(user), token };
  },

  async login(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    logger.info('User logged in', { userId: user.id });

    return { user: toProfile(user), token };
  },

  async me(userId: string): Promise<UserProfile> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return toProfile(user);
  },

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  },

  /**
   * Generate a password reset token and store it in Redis (15 min expiry).
   * In production, you would email the link. Returns the token for now.
   */
  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store hashed token in Redis with 15 min TTL
    await cacheService.set(`password-reset:${hashedToken}`, user.id, 900);

    logger.info('Password reset token generated', { userId: user.id });

    // In a real app: send email with `${frontendUrl}/reset-password?token=${resetToken}`
    // For development, return the token directly
    return {
      message: 'If that email exists, a reset link has been sent.',
      ...(isDevelopment() ? { resetToken } : {}),
    };
  },

  /**
   * Reset password using a valid token.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const userId = await cacheService.get<string>(`password-reset:${hashedToken}`);

    if (!userId) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Invalidate the token after use
    await cacheService.del(`password-reset:${hashedToken}`);

    logger.info('Password reset successful', { userId });
  },

  /**
   * Ensure all dev / demo users exist on startup (dev & staging only).
   * Accounts match the seed data so the same credentials work regardless of
   * whether `pnpm run seed` was executed.
   */
  async ensureDevUsers(): Promise<void> {
    if (!isDevelopment()) return;

    const devAccounts: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: UserRole;
    }[] = [
      { email: 'provider@growyourneed.dev', password: 'provider123', firstName: 'Super', lastName: 'Admin', role: 'PROVIDER' },
      { email: 'admin@greenfield.edu',      password: 'demo123',     firstName: 'Alice', lastName: 'Admin', role: 'ADMIN' },
      { email: 'teacher@greenfield.edu',     password: 'demo123',     firstName: 'Tanya', lastName: 'Teacher', role: 'TEACHER' },
      { email: 'student@greenfield.edu',     password: 'demo123',     firstName: 'Sam',   lastName: 'Student', role: 'STUDENT' },
      { email: 'student2@greenfield.edu',    password: 'demo123',     firstName: 'Emma',  lastName: 'Watson', role: 'STUDENT' },
      { email: 'parent@greenfield.edu',      password: 'demo123',     firstName: 'Pat',   lastName: 'Parent', role: 'PARENT' },
      { email: 'parent2@greenfield.edu',     password: 'demo123',     firstName: 'Jane',  lastName: 'Doe', role: 'PARENT' },
      { email: 'finance@greenfield.edu',     password: 'demo123',     firstName: 'Frank', lastName: 'Finance', role: 'FINANCE' },
      { email: 'marketing@greenfield.edu',   password: 'demo123',     firstName: 'Maya',  lastName: 'Marketing', role: 'MARKETING' },
      { email: 'school@greenfield.edu',      password: 'demo123',     firstName: 'Serena', lastName: 'Leader', role: 'SCHOOL' },
      { email: 'individual@greenfield.edu',  password: 'demo123',     firstName: 'Indi',  lastName: 'User', role: 'STUDENT' },
    ];

    let created = 0;
    for (const acct of devAccounts) {
      const existing = await prisma.user.findUnique({ where: { email: acct.email } });
      if (existing) continue;

      const passwordHash = await bcrypt.hash(acct.password, SALT_ROUNDS);
      await prisma.user.create({
        data: {
          email: acct.email,
          passwordHash,
          firstName: acct.firstName,
          lastName: acct.lastName,
          role: acct.role,
        },
      });
      created++;
    }

    if (created > 0) {
      logger.info(`Dev accounts: ${created} created (${devAccounts.length - created} already existed)`);
    }
  },
};
