import { Router, type IRouter } from 'express';
import {
  tuitionController,
  invoiceController,
  payrollController,
  budgetController,
  grantController,
  expenseController,
  financialReportingController,
} from '../controllers/index.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createTuitionPlanSchema,
  updateTuitionPlanSchema,
  createInvoiceSchema,
  updateInvoiceStatusSchema,
  processPayrollSchema,
  createBudgetSchema,
  updateBudgetSchema,
  createGrantSchema,
  updateGrantSchema,
  idParamSchema,
  schoolIdParamSchema,
  parentIdParamSchema,
  createExpenseRecordSchema,
  updateExpenseRecordSchema,
  reportRangeQuerySchema,
  reportExportQuerySchema,
} from '../schemas/validation.schemas.js';

const router: IRouter = Router();
router.use(authenticate);

// Tuition Plans
router.post(
  '/schools/:schoolId/tuition-plans',
  authorize('PROVIDER', 'ADMIN', 'FINANCE'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createTuitionPlanSchema }),
  tuitionController.create,
);
router.get('/schools/:schoolId/tuition-plans', validate({ params: schoolIdParamSchema }), tuitionController.list);
router.patch('/tuition-plans/:id', authorize('PROVIDER', 'ADMIN', 'FINANCE'), validateCsrf, validate({ params: idParamSchema, body: updateTuitionPlanSchema }), tuitionController.update);
router.delete('/tuition-plans/:id', authorize('PROVIDER', 'ADMIN', 'FINANCE'), validateCsrf, validate({ params: idParamSchema }), tuitionController.delete);

// Invoices
router.post(
  '/schools/:schoolId/invoices',
  authorize('PROVIDER', 'ADMIN', 'FINANCE'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createInvoiceSchema }),
  invoiceController.create,
);
router.get('/schools/:schoolId/invoices', validate({ params: schoolIdParamSchema }), invoiceController.list);
router.get('/invoices/:id', validate({ params: idParamSchema }), invoiceController.getById);
router.patch(
  '/invoices/:id/status',
  authorize('PROVIDER', 'ADMIN', 'FINANCE'),
  validateCsrf,
  validate({ params: idParamSchema, body: updateInvoiceStatusSchema }),
  invoiceController.updateStatus,
);
router.get('/parents/:parentId/invoices', validate({ params: parentIdParamSchema }), invoiceController.getByParent);

// Payroll
router.post(
  '/payroll',
  authorize('PROVIDER', 'ADMIN', 'FINANCE'),
  validateCsrf,
  validate({ body: processPayrollSchema }),
  payrollController.process,
);
router.get('/payroll', authorize('PROVIDER', 'ADMIN', 'FINANCE'), payrollController.list);

// Budgets
router.post(
  '/schools/:schoolId/budgets',
  authorize('PROVIDER', 'ADMIN', 'FINANCE'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createBudgetSchema }),
  budgetController.create,
);
router.get('/schools/:schoolId/budgets', validate({ params: schoolIdParamSchema }), budgetController.list);
router.patch('/budgets/:id', authorize('PROVIDER', 'ADMIN', 'FINANCE'), validateCsrf, validate({ params: idParamSchema, body: updateBudgetSchema }), budgetController.update);

// Grants
router.post(
  '/schools/:schoolId/grants',
  authorize('PROVIDER', 'ADMIN', 'FINANCE'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createGrantSchema }),
  grantController.create,
);
router.get('/schools/:schoolId/grants', validate({ params: schoolIdParamSchema }), grantController.list);
router.patch('/grants/:id', authorize('PROVIDER', 'ADMIN', 'FINANCE'), validateCsrf, validate({ params: idParamSchema, body: updateGrantSchema }), grantController.update);

// Expenses
router.post(
  '/schools/:schoolId/expenses',
  authorize('PROVIDER', 'ADMIN', 'FINANCE'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createExpenseRecordSchema }),
  expenseController.create,
);
router.get(
  '/schools/:schoolId/expenses',
  authorize('PROVIDER', 'ADMIN', 'FINANCE'),
  validate({ params: schoolIdParamSchema }),
  expenseController.list,
);
router.patch(
  '/expenses/:id',
  authorize('PROVIDER', 'ADMIN', 'FINANCE'),
  validateCsrf,
  validate({ params: idParamSchema, body: updateExpenseRecordSchema }),
  expenseController.update,
);
router.delete(
  '/expenses/:id',
  authorize('PROVIDER', 'ADMIN', 'FINANCE'),
  validateCsrf,
  validate({ params: idParamSchema }),
  expenseController.delete,
);

// Reporting
router.get(
  '/schools/:schoolId/reports/summary',
  authorize('PROVIDER', 'ADMIN', 'FINANCE'),
  validate({ params: schoolIdParamSchema, query: reportRangeQuerySchema }),
  financialReportingController.summary,
);
router.get(
  '/schools/:schoolId/reports/summary/export',
  authorize('PROVIDER', 'ADMIN', 'FINANCE'),
  validate({ params: schoolIdParamSchema, query: reportExportQuerySchema }),
  financialReportingController.exportSummary,
);

export default router;
