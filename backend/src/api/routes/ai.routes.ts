import { Router, type IRouter } from 'express';
import { aiController } from '../controllers/index.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  aiGenerateSchema,
  aiChatSchema,
  schoolIdParamSchema,
} from '../schemas/validation.schemas.js';

const router: IRouter = Router();
router.use(authenticate);

// Generic AI endpoints
router.post('/generate', validateCsrf, validate({ body: aiGenerateSchema }), aiController.generate);
router.post('/chat', validateCsrf, validate({ body: aiChatSchema }), aiController.chat);

// Specialized AI tools
router.post('/policy-generator', authorize('PROVIDER', 'ADMIN'), validateCsrf, aiController.generatePolicy);
router.post('/feedback-analysis', authorize('PROVIDER', 'ADMIN'), validateCsrf, aiController.analyzeFeedback);
router.post('/grade-assist', authorize('TEACHER'), validateCsrf, aiController.gradeAssist);
router.post('/content-generator', authorize('TEACHER'), validateCsrf, aiController.generateContent);
router.post('/gap-detector', authorize('TEACHER'), validateCsrf, aiController.detectGaps);
router.post('/crisis-draft', authorize('PROVIDER', 'ADMIN'), validateCsrf, aiController.crisisDraft);
router.get(
  '/schools/:schoolId/predict-budget',
  authorize('PROVIDER', 'ADMIN', 'FINANCE'),
  validate({ params: schoolIdParamSchema }),
  aiController.predictBudget,
);

export default router;
