import { Router, type IRouter } from 'express';
import {
  applicantController,
  campaignController,
  staffController,
  studentManagementController,
  schoolUserController,
  parentSchoolController,
} from '../controllers/index.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createApplicantSchema,
  updateApplicantStageSchema,
  createCampaignSchema,
  idParamSchema,
  schoolIdParamSchema,
  schoolUsersQuerySchema,
  createSchoolUserSchema,
  updateSchoolUserSchema,
  updateSchoolUserStatusSchema,
  schoolUserParamSchema,
  parentChildrenUpdateSchema,
  schoolParentParamSchema,
  hardDeleteQuerySchema,
} from '../schemas/validation.schemas.js';

const router: IRouter = Router();
router.use(authenticate);

// Admissions Pipeline
router.post(
  '/schools/:schoolId/applicants',
  authorize('PROVIDER', 'ADMIN', 'MARKETING'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createApplicantSchema }),
  applicantController.create,
);
router.get('/schools/:schoolId/applicants', authorize('PROVIDER', 'ADMIN', 'MARKETING'), validate({ params: schoolIdParamSchema }), applicantController.list);
router.get('/applicants/:id', authorize('PROVIDER', 'ADMIN', 'MARKETING'), validate({ params: idParamSchema }), applicantController.getById);
router.patch(
  '/applicants/:id/stage',
  authorize('PROVIDER', 'ADMIN', 'MARKETING'),
  validateCsrf,
  validate({ params: idParamSchema, body: updateApplicantStageSchema }),
  applicantController.updateStage,
);
router.delete('/applicants/:id', authorize('PROVIDER', 'ADMIN'), validateCsrf, applicantController.delete);

// Campaigns
router.post(
  '/schools/:schoolId/campaigns',
  authorize('PROVIDER', 'ADMIN', 'MARKETING'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createCampaignSchema }),
  campaignController.create,
);
router.get('/schools/:schoolId/campaigns', authorize('PROVIDER', 'ADMIN', 'MARKETING'), validate({ params: schoolIdParamSchema }), campaignController.list);
router.get('/campaigns/:id', authorize('PROVIDER', 'ADMIN', 'MARKETING'), validate({ params: idParamSchema }), campaignController.getById);
router.patch('/campaigns/:id', authorize('PROVIDER', 'ADMIN', 'MARKETING'), validateCsrf, campaignController.update);

// Existing staff/student endpoints
router.get('/schools/:schoolId/staff', authorize('PROVIDER', 'ADMIN'), validate({ params: schoolIdParamSchema }), staffController.list);
router.get('/staff/:id', authorize('PROVIDER', 'ADMIN'), validate({ params: idParamSchema }), staffController.getById);
router.get('/schools/:schoolId/students', authorize('PROVIDER', 'ADMIN', 'TEACHER'), validate({ params: schoolIdParamSchema }), studentManagementController.list);
router.get('/all-students/:id', authorize('PROVIDER', 'ADMIN', 'TEACHER'), validate({ params: idParamSchema }), studentManagementController.getById);

// School user CRUD (Manage Staff / Students / Parents)
router.get(
  '/schools/:schoolId/users',
  authorize('PROVIDER', 'ADMIN'),
  validate({ params: schoolIdParamSchema, query: schoolUsersQuerySchema }),
  schoolUserController.list,
);
router.post(
  '/schools/:schoolId/users',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createSchoolUserSchema }),
  schoolUserController.create,
);
router.patch(
  '/schools/:schoolId/users/:userId',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ params: schoolUserParamSchema, body: updateSchoolUserSchema }),
  schoolUserController.update,
);
router.patch(
  '/schools/:schoolId/users/:userId/status',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ params: schoolUserParamSchema, body: updateSchoolUserStatusSchema }),
  schoolUserController.updateStatus,
);
router.delete(
  '/schools/:schoolId/users/:userId/membership',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ params: schoolUserParamSchema }),
  schoolUserController.removeMembership,
);
router.delete(
  '/schools/:schoolId/users/:userId',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ params: schoolUserParamSchema, query: hardDeleteQuerySchema }),
  schoolUserController.delete,
);

// Parent-child links
router.get(
  '/schools/:schoolId/parents/:parentId/children',
  authorize('PROVIDER', 'ADMIN'),
  validate({ params: schoolParentParamSchema }),
  parentSchoolController.listChildren,
);
router.put(
  '/schools/:schoolId/parents/:parentId/children',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ params: schoolParentParamSchema, body: parentChildrenUpdateSchema }),
  parentSchoolController.upsertChildren,
);

export default router;
