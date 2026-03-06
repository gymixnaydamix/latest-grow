/* ─── Upload Controller ─── File upload handling ────────────────────
 * Handles avatar uploads, document uploads, and media files.
 * Uses multer for multipart form handling, stores in local /uploads dir.
 * In production, replace local storage with S3/Cloudflare R2.
 * ──────────────────────────────────────────────────────────────────── */
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { prisma } from '../../db/prisma.service.js';
import { logger } from '../../utils/logger.js';

// ---------------------------------------------------------------------------
// Multer config — local disk storage
// ---------------------------------------------------------------------------

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

// Ensure upload directories exist
for (const sub of ['avatars', 'documents', 'media']) {
  const dir = path.join(UPLOAD_DIR, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${crypto.randomUUID()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`));
  }
};

/** Multer upload middleware — single file, max 10 MB */
export const uploadMiddleware: RequestHandler = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).single('file');

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

export const uploadController = {
  /** Upload avatar and update user profile */
  async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      // Move to avatars subfolder
      const dest = path.join(UPLOAD_DIR, 'avatars', req.file.filename);
      fs.renameSync(req.file.path, dest);

      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      // Update user avatar in database
      await prisma.user.update({
        where: { id: req.user!.userId },
        data: { avatar: avatarUrl },
      });

      logger.info('Avatar uploaded', { userId: req.user!.userId, file: req.file.filename });

      res.json({
        success: true,
        data: {
          url: avatarUrl,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /** Upload a general document */
  async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      const subfolder = req.body.category || 'documents';
      const validSubfolders = ['documents', 'media'];
      const folder = validSubfolders.includes(subfolder) ? subfolder : 'documents';

      const dest = path.join(UPLOAD_DIR, folder, req.file.filename);
      fs.renameSync(req.file.path, dest);

      const fileUrl = `/uploads/${folder}/${req.file.filename}`;

      logger.info('Document uploaded', {
        userId: req.user!.userId,
        file: req.file.filename,
        category: folder,
      });

      res.json({
        success: true,
        data: {
          url: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          category: folder,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
