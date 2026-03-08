import { Router, type IRouter } from 'express';
import {
  parentController,
  digestController,
  feedbackController,
  volunteerController,
  cafeteriaController,
} from '../controllers/index.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  updateDigestConfigSchema,
  createFeedbackSchema,
  idParamSchema,
  schoolIdParamSchema,
  studentIdParamSchema,
} from '../schemas/validation.schemas.js';

const router: IRouter = Router();
router.use(authenticate);

// ──────── Parent Dashboard ────────
router.get('/dashboard', authorize('PARENT'), parentController.dashboard);
router.get('/children/:studentId/progress', authorize('PARENT'), validate({ params: studentIdParamSchema }), parentController.getChildProgress);

// ──────── Digest Config ────────
router.get('/digest', authorize('PARENT'), digestController.get);
router.put(
  '/digest',
  authorize('PARENT'),
  validateCsrf,
  validate({ body: updateDigestConfigSchema }),
  digestController.upsert,
);

// ──────── Feedback ────────
router.post(
  '/schools/:schoolId/feedback',
  authorize('PARENT'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createFeedbackSchema }),
  feedbackController.create,
);
router.get('/my-feedback', authorize('PARENT'), feedbackController.listByParent);
router.get(
  '/schools/:schoolId/feedback',
  authorize('PROVIDER', 'ADMIN'),
  validate({ params: schoolIdParamSchema }),
  feedbackController.listBySchool,
);

// ──────── Volunteer ────────
router.get('/schools/:schoolId/volunteer', validate({ params: schoolIdParamSchema }), volunteerController.listOpportunities);
router.post(
  '/volunteer/:id/signup',
  authorize('PARENT'),
  validateCsrf,
  validate({ params: idParamSchema }),
  volunteerController.signUp,
);

// ──────── Cafeteria ────────
router.get('/schools/:schoolId/cafeteria/menu', validate({ params: schoolIdParamSchema }), cafeteriaController.getMenu);
router.get('/cafeteria/account/:studentId', authorize('PARENT'), validate({ params: studentIdParamSchema }), cafeteriaController.getAccount);

export default router;
