import { Router, type IRouter } from 'express';
import { aiController } from '../controllers/index.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  aiGenerateSchema,
  aiChatSchema,
  aiPolicyGeneratorSchema,
  aiFeedbackAnalysisSchema,
  aiGradeAssistSchema,
  aiContentGeneratorSchema,
  aiGapDetectorSchema,
  aiCrisisDraftSchema,
  schoolIdParamSchema,
} from '../schemas/validation.schemas.js';

const router: IRouter = Router();
router.use(authenticate);

// Generic AI endpoints
router.post('/generate', validateCsrf, validate({ body: aiGenerateSchema }), aiController.generate);
router.post('/chat', validateCsrf, validate({ body: aiChatSchema }), aiController.chat);

// Specialized AI tools
router.post('/policy-generator', authorize('PROVIDER', 'ADMIN'), validateCsrf, validate({ body: aiPolicyGeneratorSchema }), aiController.generatePolicy);
router.post('/feedback-analysis', authorize('PROVIDER', 'ADMIN'), validateCsrf, validate({ body: aiFeedbackAnalysisSchema }), aiController.analyzeFeedback);
router.post('/grade-assist', authorize('TEACHER'), validateCsrf, validate({ body: aiGradeAssistSchema }), aiController.gradeAssist);
router.post('/content-generator', authorize('TEACHER'), validateCsrf, validate({ body: aiContentGeneratorSchema }), aiController.generateContent);
router.post('/gap-detector', authorize('TEACHER'), validateCsrf, validate({ body: aiGapDetectorSchema }), aiController.detectGaps);
router.post('/crisis-draft', authorize('PROVIDER', 'ADMIN'), validateCsrf, validate({ body: aiCrisisDraftSchema }), aiController.crisisDraft);
router.get(
  '/schools/:schoolId/predict-budget',
  authorize('PROVIDER', 'ADMIN', 'FINANCE'),
  validate({ params: schoolIdParamSchema }),
  aiController.predictBudget,
);

export default router;
