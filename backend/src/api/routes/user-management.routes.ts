import { Router, type IRouter } from 'express';
import { userManagementController } from '../controllers/user-management.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createUserSchema,
  updateUserSchema,
  bulkDeleteUsersSchema,
  bulkUpdateRoleSchema,
  idParamSchema,
} from '../schemas/validation.schemas.js';

const router: IRouter = Router();
router.use(authenticate);

// ──────── Stats ────────
router.get(
  '/stats',
  authorize('PROVIDER', 'ADMIN'),
  userManagementController.stats,
);

// ──────── Export (CSV) ────────
router.get(
  '/users/export',
  authorize('PROVIDER', 'ADMIN'),
  userManagementController.exportUsers,
);

// ──────── Bulk Operations ────────
router.post(
  '/users/bulk-delete',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ body: bulkDeleteUsersSchema }),
  userManagementController.bulkDelete,
);
router.post(
  '/users/bulk-role',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ body: bulkUpdateRoleSchema }),
  userManagementController.bulkUpdateRole,
);

// ──────── CRUD ────────
router.get(
  '/users',
  authorize('PROVIDER', 'ADMIN'),
  userManagementController.list,
);
router.get(
  '/users/:id',
  authorize('PROVIDER', 'ADMIN'),
  validate({ params: idParamSchema }),
  userManagementController.getById,
);
router.post(
  '/users',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ body: createUserSchema }),
  userManagementController.create,
);
router.patch(
  '/users/:id',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ params: idParamSchema, body: updateUserSchema }),
  userManagementController.update,
);
router.delete(
  '/users/:id',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ params: idParamSchema }),
  userManagementController.delete,
);

export default router;
