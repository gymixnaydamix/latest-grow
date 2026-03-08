import { Router, type IRouter } from 'express';
import { messageController } from '../controllers/index.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  idParamSchema,
  schoolIdParamSchema,
  createMessageThreadSchema,
  sendThreadMessageSchema,
  threadIdParamSchema,
} from '../schemas/validation.schemas.js';

const router: IRouter = Router();
router.use(authenticate);

router.post(
  '/schools/:schoolId/threads',
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createMessageThreadSchema }),
  messageController.createThread,
);
router.get(
  '/schools/:schoolId/threads',
  validate({ params: schoolIdParamSchema }),
  messageController.listThreads,
);
router.get(
  '/threads/:id',
  validate({ params: idParamSchema }),
  messageController.getThread,
);
router.post(
  '/threads/:threadId/messages',
  validateCsrf,
  validate({ params: threadIdParamSchema, body: sendThreadMessageSchema }),
  messageController.sendMessage,
);
router.patch(
  '/threads/:id/star',
  validateCsrf,
  validate({ params: idParamSchema }),
  messageController.toggleStar,
);
router.patch(
  '/threads/:id/archive',
  validateCsrf,
  validate({ params: idParamSchema }),
  messageController.archiveThread,
);
router.delete(
  '/threads/:id',
  validateCsrf,
  validate({ params: idParamSchema }),
  messageController.deleteThread,
);

export default router;
