import { Router, type IRouter } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { uploadMiddleware, uploadController } from '../controllers/upload.controller.js';

const router: IRouter = Router();

// All upload routes require authentication + CSRF
router.post('/avatar', authenticate, validateCsrf, uploadMiddleware, uploadController.uploadAvatar);
router.post('/document', authenticate, validateCsrf, uploadMiddleware, uploadController.uploadDocument);

export default router;
