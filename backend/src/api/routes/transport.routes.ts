import { Router, type IRouter } from 'express';
import { transportController } from '../controllers/index.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  idParamSchema,
  schoolIdParamSchema,
  createTransportRouteSchema,
  updateTransportRouteSchema,
  createTransportStopSchema,
  updateTransportStopSchema,
  createTransportAssignmentSchema,
  updateTransportAssignmentSchema,
  createTransportEventSchema,
  transportTrackingQuerySchema,
} from '../schemas/validation.schemas.js';

const router: IRouter = Router();
router.use(authenticate);

router.get(
  '/schools/:schoolId/routes',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validate({ params: schoolIdParamSchema }),
  transportController.listRoutes,
);
router.post(
  '/schools/:schoolId/routes',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createTransportRouteSchema }),
  transportController.createRoute,
);
router.patch(
  '/routes/:id',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validateCsrf,
  validate({ params: idParamSchema, body: updateTransportRouteSchema }),
  transportController.updateRoute,
);
router.delete(
  '/routes/:id',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validateCsrf,
  validate({ params: idParamSchema }),
  transportController.deleteRoute,
);

router.post(
  '/routes/:id/stops',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validateCsrf,
  validate({ params: idParamSchema, body: createTransportStopSchema }),
  transportController.createStop,
);
router.patch(
  '/stops/:id',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validateCsrf,
  validate({ params: idParamSchema, body: updateTransportStopSchema }),
  transportController.updateStop,
);
router.delete(
  '/stops/:id',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validateCsrf,
  validate({ params: idParamSchema }),
  transportController.deleteStop,
);

router.get(
  '/schools/:schoolId/assignments',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validate({ params: schoolIdParamSchema }),
  transportController.listAssignments,
);
router.post(
  '/schools/:schoolId/assignments',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createTransportAssignmentSchema }),
  transportController.createAssignment,
);
router.patch(
  '/assignments/:id',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validateCsrf,
  validate({ params: idParamSchema, body: updateTransportAssignmentSchema }),
  transportController.updateAssignment,
);
router.delete(
  '/assignments/:id',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validateCsrf,
  validate({ params: idParamSchema }),
  transportController.deleteAssignment,
);

router.get(
  '/schools/:schoolId/tracking',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL', 'TEACHER'),
  validate({ params: schoolIdParamSchema, query: transportTrackingQuerySchema }),
  transportController.listTracking,
);
router.post(
  '/assignments/:id/events',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL', 'TEACHER'),
  validateCsrf,
  validate({ params: idParamSchema, body: createTransportEventSchema }),
  transportController.createEvent,
);

export default router;
