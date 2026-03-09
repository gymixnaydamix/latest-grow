import { Router, type IRouter } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { gamificationController } from '../controllers/gamification.controller.js';
import {
  gamificationActionSchema,
  gamificationDraftSchema,
  gamificationPageParamsSchema,
  gamificationPageQuerySchema,
  gamificationRollbackSchema,
} from '../schemas/gamification.schemas.js';

const router: IRouter = Router();

router.use(authenticate);
router.use(authorize('PROVIDER', 'ADMIN', 'SCHOOL'));
router.use(validateCsrf);

router.get('/bootstrap', gamificationController.getBootstrap);
router.get('/pages/:pageId', validate({ params: gamificationPageParamsSchema, query: gamificationPageQuerySchema }), gamificationController.getPage);
router.patch('/pages/:pageId/draft', validate({ params: gamificationPageParamsSchema, body: gamificationDraftSchema }), gamificationController.saveDraft);
router.post('/pages/:pageId/publish', validate({ params: gamificationPageParamsSchema }), gamificationController.publish);
router.post('/pages/:pageId/rollback', validate({ params: gamificationPageParamsSchema, body: gamificationRollbackSchema }), gamificationController.rollback);
router.post('/pages/:pageId/export', validate({ params: gamificationPageParamsSchema }), gamificationController.export);
router.post('/pages/:pageId/actions', validate({ params: gamificationPageParamsSchema, body: gamificationActionSchema }), gamificationController.runAction);

export default router;
