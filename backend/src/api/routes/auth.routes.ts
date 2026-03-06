import { Router, type IRouter } from 'express';
import { authController } from '../controllers/index.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { generateCsrfToken, validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { loginSchema, registerSchema } from '../schemas/validation.schemas.js';

const router: IRouter = Router();

// CSRF token endpoint — clients call this first to get a CSRF token
router.get('/csrf-token', generateCsrfToken);

// Public
router.post('/register', validateCsrf, validate({ body: registerSchema }), authController.register);
router.post('/login', validateCsrf, validate({ body: loginSchema }), authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', validateCsrf, authController.forgotPassword);
router.post('/reset-password', validateCsrf, authController.resetPassword);

// Protected
router.get('/me', authenticate, authController.me);
router.patch('/profile', authenticate, validateCsrf, authController.updateProfile);

export default router;
