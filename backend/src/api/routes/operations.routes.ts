import { Router, type IRouter } from 'express';
import {
  facilityController,
  bookingController,
  policyController,
  eventController,
  goalController,
  complianceController,
  systemPromptController,
  maintenanceController,
} from '../controllers/index.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createFacilitySchema,
  updateFacilitySchema,
  createBookingSchema,
  createPolicySchema,
  updatePolicySchema,
  createEventSchema,
  updateEventSchema,
  createGoalSchema,
  updateGoalSchema,
  createComplianceReportSchema,
  createSystemPromptSchema,
  idParamSchema,
  schoolIdParamSchema,
  createMaintenanceRequestSchema,
  updateMaintenanceRequestSchema,
  maintenanceListQuerySchema,
  bookingListQuerySchema,
} from '../schemas/validation.schemas.js';

const router: IRouter = Router();
router.use(authenticate);

// Facilities
router.post(
  '/schools/:schoolId/facilities',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createFacilitySchema }),
  facilityController.create,
);
router.get('/schools/:schoolId/facilities', validate({ params: schoolIdParamSchema }), facilityController.list);
router.patch('/facilities/:id', authorize('PROVIDER', 'ADMIN'), validateCsrf, validate({ params: idParamSchema, body: updateFacilitySchema }), facilityController.update);
router.delete('/facilities/:id', authorize('PROVIDER', 'ADMIN'), validateCsrf, validate({ params: idParamSchema }), facilityController.delete);

// Bookings
router.post('/bookings', validateCsrf, validate({ body: createBookingSchema }), bookingController.create);
router.get('/facilities/:facilityId/bookings', bookingController.listByFacility);
router.get(
  '/schools/:schoolId/bookings',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validate({ params: schoolIdParamSchema, query: bookingListQuerySchema }),
  bookingController.listBySchool,
);

// Maintenance
router.post(
  '/schools/:schoolId/maintenance',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createMaintenanceRequestSchema }),
  maintenanceController.create,
);
router.get(
  '/schools/:schoolId/maintenance',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL', 'TEACHER'),
  validate({ params: schoolIdParamSchema, query: maintenanceListQuerySchema }),
  maintenanceController.list,
);
router.patch(
  '/maintenance/:id',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validateCsrf,
  validate({ params: idParamSchema, body: updateMaintenanceRequestSchema }),
  maintenanceController.update,
);
router.delete(
  '/maintenance/:id',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validateCsrf,
  validate({ params: idParamSchema }),
  maintenanceController.delete,
);

// Policies
router.post(
  '/schools/:schoolId/policies',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createPolicySchema }),
  policyController.create,
);
router.get('/schools/:schoolId/policies', validate({ params: schoolIdParamSchema }), policyController.list);
router.get('/policies/:id', validate({ params: idParamSchema }), policyController.getById);
router.patch('/policies/:id', authorize('PROVIDER', 'ADMIN'), validateCsrf, validate({ params: idParamSchema, body: updatePolicySchema }), policyController.update);

// Events
router.post(
  '/schools/:schoolId/events',
  authorize('PROVIDER', 'ADMIN', 'TEACHER'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createEventSchema }),
  eventController.create,
);
router.get('/schools/:schoolId/events', validate({ params: schoolIdParamSchema }), eventController.list);
router.get('/events/:id', validate({ params: idParamSchema }), eventController.getById);
router.patch('/events/:id', authorize('PROVIDER', 'ADMIN', 'TEACHER'), validateCsrf, validate({ params: idParamSchema, body: updateEventSchema }), eventController.update);
router.delete('/events/:id', authorize('PROVIDER', 'ADMIN'), validateCsrf, validate({ params: idParamSchema }), eventController.delete);

// Strategic Goals
router.post(
  '/schools/:schoolId/goals',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createGoalSchema }),
  goalController.create,
);
router.get('/schools/:schoolId/goals', validate({ params: schoolIdParamSchema }), goalController.list);
router.patch('/goals/:id', authorize('PROVIDER', 'ADMIN', 'SCHOOL'), validateCsrf, validate({ params: idParamSchema, body: updateGoalSchema }), goalController.update);

// Compliance Reports
router.post(
  '/schools/:schoolId/compliance',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createComplianceReportSchema }),
  complianceController.create,
);
router.get('/schools/:schoolId/compliance', validate({ params: schoolIdParamSchema }), complianceController.list);

// System Prompts
router.put(
  '/schools/:schoolId/system-prompts',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createSystemPromptSchema }),
  systemPromptController.upsert,
);
router.get('/schools/:schoolId/system-prompts', validate({ params: schoolIdParamSchema }), systemPromptController.list);

export default router;
