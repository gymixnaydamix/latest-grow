import { Router, type IRouter } from 'express';
import { libraryController } from '../controllers/index.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  idParamSchema,
  schoolIdParamSchema,
  createLibraryItemSchema,
  updateLibraryItemSchema,
  libraryLoansQuerySchema,
  checkoutLibraryLoanSchema,
  returnLibraryLoanSchema,
} from '../schemas/validation.schemas.js';

const router: IRouter = Router();
router.use(authenticate);

router.get(
  '/schools/:schoolId/items',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL', 'TEACHER'),
  validate({ params: schoolIdParamSchema }),
  libraryController.listItems,
);
router.post(
  '/schools/:schoolId/items',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createLibraryItemSchema }),
  libraryController.createItem,
);
router.patch(
  '/items/:id',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validateCsrf,
  validate({ params: idParamSchema, body: updateLibraryItemSchema }),
  libraryController.updateItem,
);
router.delete(
  '/items/:id',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL'),
  validateCsrf,
  validate({ params: idParamSchema }),
  libraryController.deleteItem,
);

router.get(
  '/schools/:schoolId/loans',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL', 'TEACHER'),
  validate({ params: schoolIdParamSchema, query: libraryLoansQuerySchema }),
  libraryController.listLoans,
);
router.post(
  '/loans/checkout',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL', 'TEACHER'),
  validateCsrf,
  validate({ body: checkoutLibraryLoanSchema }),
  libraryController.checkout,
);
router.post(
  '/loans/:id/return',
  authorize('PROVIDER', 'ADMIN', 'SCHOOL', 'TEACHER'),
  validateCsrf,
  validate({ params: idParamSchema, body: returnLibraryLoanSchema }),
  libraryController.returnLoan,
);

export default router;
