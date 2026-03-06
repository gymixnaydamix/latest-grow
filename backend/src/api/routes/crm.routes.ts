import { Router, type IRouter } from 'express';
import { crmDealController, crmAccountController } from '../controllers/crm.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  idParamSchema,
  createDealSchema,
  updateDealSchema,
  dealListQuerySchema,
  upsertAccountSchema,
  updateAccountSchema,
  accountListQuerySchema,
} from '../schemas/crm.schemas.js';

const router: IRouter = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// CRM Deals
// ---------------------------------------------------------------------------
router.get('/deals', authorize('PROVIDER'), validate({ query: dealListQuerySchema }), crmDealController.list);
router.get('/deals/stats', authorize('PROVIDER'), crmDealController.stats);
router.get('/deals/by-stage', authorize('PROVIDER'), crmDealController.byStage);
router.get('/deals/:id', authorize('PROVIDER'), validate({ params: idParamSchema }), crmDealController.getById);
router.post('/deals', authorize('PROVIDER'), validateCsrf, validate({ body: createDealSchema }), crmDealController.create);
router.patch('/deals/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema, body: updateDealSchema }), crmDealController.update);
router.delete('/deals/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema }), crmDealController.remove);

// ---------------------------------------------------------------------------
// CRM Accounts
// ---------------------------------------------------------------------------
router.get('/accounts', authorize('PROVIDER'), validate({ query: accountListQuerySchema }), crmAccountController.list);
router.post('/accounts', authorize('PROVIDER'), validateCsrf, validate({ body: upsertAccountSchema }), crmAccountController.upsert);
router.patch('/accounts/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema, body: updateAccountSchema }), crmAccountController.update);
router.delete('/accounts/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema }), crmAccountController.remove);
router.post('/accounts/:id/touch', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema }), crmAccountController.touch);

export default router;
