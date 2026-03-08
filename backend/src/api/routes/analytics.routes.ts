import { Router, type Router as RouterType } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { updateOverlaySettingsSchema } from '../schemas/validation.schemas.js';
import {
  getOverviewMetrics,
  getPlatformAnalytics,
  getMarketIntelligence,
  getSystemHealth,
  getOverlaySettings,
  updateOverlaySettings,
} from '../controllers/analytics.controller.js';

const router: RouterType = Router();
router.use(authenticate);
router.use(authorize('PROVIDER'));

router.get('/overview', getOverviewMetrics);
router.get('/platform', getPlatformAnalytics);
router.get('/market', getMarketIntelligence);
router.get('/system', getSystemHealth);
router.get('/overlay-settings', getOverlaySettings);
router.put('/overlay-settings', validateCsrf, validate({ body: updateOverlaySettingsSchema }), updateOverlaySettings);

export default router;
