import { Router, type IRouter } from 'express';
import { authController } from '../controllers/index.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { generateCsrfToken, validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../schemas/validation.schemas.js';

const router: IRouter = Router();

// CSRF token endpoint — clients call this first to get a CSRF token
router.get('/csrf-token', generateCsrfToken);

// Public
router.post('/register', validateCsrf, validate({ body: registerSchema }), authController.register);
router.post('/login', validateCsrf, validate({ body: loginSchema }), authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', validateCsrf, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/reset-password', validateCsrf, validate({ body: resetPasswordSchema }), authController.resetPassword);

// Protected
router.get('/me', authenticate, authController.me);
router.patch('/profile', authenticate, validateCsrf, validate({ body: updateProfileSchema }), authController.updateProfile);

export default router;
