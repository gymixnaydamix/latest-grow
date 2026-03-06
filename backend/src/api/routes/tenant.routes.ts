import { Router, type IRouter } from 'express';
import {
  tenantController,
  platformPlanController,
  platformInvoiceController,
  paymentGatewayController,
} from '../controllers/tenant.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  idParamSchema,
  createTenantSchema,
  updateTenantSchema,
  tenantListQuerySchema,
  bulkImportTenantsSchema,
  sendInvitesSchema,
  createPlatformPlanSchema,
  updatePlatformPlanSchema,
  createPlatformInvoiceSchema,
  createPaymentGatewaySchema,
  updatePaymentGatewaySchema,
  tenantGeocodeQuerySchema,
} from '../schemas/tenant.schemas.js';

const router: IRouter = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Tenants
// ---------------------------------------------------------------------------

router.get(
  '/',
  authorize('PROVIDER'),
  validate({ query: tenantListQuerySchema }),
  tenantController.list,
);

router.get(
  '/stats',
  authorize('PROVIDER'),
  tenantController.stats,
);

router.get(
  '/export',
  authorize('PROVIDER'),
  tenantController.exportCsv,
);

router.get(
  '/geocode',
  authorize('PROVIDER'),
  validate({ query: tenantGeocodeQuerySchema }),
  tenantController.geocode,
);

router.get(
  '/:id',
  authorize('PROVIDER'),
  validate({ params: idParamSchema }),
  tenantController.getById,
);

router.post(
  '/',
  authorize('PROVIDER'),
  validateCsrf,
  validate({ body: createTenantSchema }),
  tenantController.create,
);

router.patch(
  '/:id',
  authorize('PROVIDER'),
  validateCsrf,
  validate({ params: idParamSchema, body: updateTenantSchema }),
  tenantController.update,
);

router.delete(
  '/:id',
  authorize('PROVIDER'),
  validateCsrf,
  validate({ params: idParamSchema }),
  tenantController.delete,
);

router.patch(
  '/:id/suspend',
  authorize('PROVIDER'),
  validateCsrf,
  validate({ params: idParamSchema }),
  tenantController.suspend,
);

router.post(
  '/bulk-import',
  authorize('PROVIDER'),
  validateCsrf,
  validate({ body: bulkImportTenantsSchema }),
  tenantController.bulkImport,
);

router.post(
  '/send-invites',
  authorize('PROVIDER'),
  validateCsrf,
  validate({ body: sendInvitesSchema }),
  tenantController.sendInvites,
);

// ---------------------------------------------------------------------------
// Platform Plans
// ---------------------------------------------------------------------------

router.get('/plans/all', authorize('PROVIDER'), platformPlanController.list);

router.post(
  '/plans',
  authorize('PROVIDER'),
  validateCsrf,
  validate({ body: createPlatformPlanSchema }),
  platformPlanController.create,
);

router.patch(
  '/plans/:id',
  authorize('PROVIDER'),
  validateCsrf,
  validate({ params: idParamSchema, body: updatePlatformPlanSchema }),
  platformPlanController.update,
);

router.delete(
  '/plans/:id',
  authorize('PROVIDER'),
  validateCsrf,
  validate({ params: idParamSchema }),
  platformPlanController.delete,
);

// ---------------------------------------------------------------------------
// Platform Invoices
// ---------------------------------------------------------------------------

router.get('/invoices/all', authorize('PROVIDER'), platformInvoiceController.list);
router.get('/invoices/stats', authorize('PROVIDER'), platformInvoiceController.stats);

router.post(
  '/invoices',
  authorize('PROVIDER'),
  validateCsrf,
  validate({ body: createPlatformInvoiceSchema }),
  platformInvoiceController.create,
);

router.patch(
  '/invoices/:id/mark-paid',
  authorize('PROVIDER'),
  validateCsrf,
  validate({ params: idParamSchema }),
  platformInvoiceController.markPaid,
);

router.delete(
  '/invoices/:id',
  authorize('PROVIDER'),
  validateCsrf,
  validate({ params: idParamSchema }),
  platformInvoiceController.delete,
);

// ---------------------------------------------------------------------------
// Payment Gateways
// ---------------------------------------------------------------------------

router.get('/gateways/all', authorize('PROVIDER'), paymentGatewayController.list);

router.post(
  '/gateways',
  authorize('PROVIDER'),
  validateCsrf,
  validate({ body: createPaymentGatewaySchema }),
  paymentGatewayController.create,
);

router.patch(
  '/gateways/:id',
  authorize('PROVIDER'),
  validateCsrf,
  validate({ params: idParamSchema, body: updatePaymentGatewaySchema }),
  paymentGatewayController.update,
);

router.delete(
  '/gateways/:id',
  authorize('PROVIDER'),
  validateCsrf,
  validate({ params: idParamSchema }),
  paymentGatewayController.delete,
);

export default router;
