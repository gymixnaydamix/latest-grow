import { Router, type IRouter } from 'express';
import { schoolController } from '../controllers/index.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createSchoolSchema,
  updateBrandingSchema,
  idParamSchema,
} from '../schemas/validation.schemas.js';

const router: IRouter = Router();

// All school routes require authentication
router.use(authenticate);

router.post(
  '/',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ body: createSchoolSchema }),
  schoolController.create,
);

router.get('/:id', validate({ params: idParamSchema }), schoolController.getById);

router.patch(
  '/:id/branding',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ params: idParamSchema, body: updateBrandingSchema }),
  schoolController.updateBranding,
);

router.get('/:id/members', validate({ params: idParamSchema }), schoolController.getMembers);

router.get(
  '/:id/dashboard',
  validate({ params: idParamSchema }),
  schoolController.getDashboardKPIs,
);

export default router;
