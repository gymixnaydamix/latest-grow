import { Router, type IRouter } from 'express';
import { wellnessController } from '../controllers/wellness.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  idParamSchema,
  createWellnessJournalSchema,
  createWellnessGoalSchema,
  updateWellnessGoalSchema,
} from '../schemas/validation.schemas.js';

const router: IRouter = Router();
router.use(authenticate);
router.use(validateCsrf);

// Wellness overview metrics
router.get('/metrics', wellnessController.getMetrics);

// Weekly wellness summary
router.get('/weekly', wellnessController.getWeeklySummary);

// Journal CRUD
router.get('/journal', wellnessController.listJournalEntries);
router.post('/journal', validate({ body: createWellnessJournalSchema }), wellnessController.createJournalEntry);

// Goals CRUD
router.get('/goals', wellnessController.listGoals);
router.post('/goals', validate({ body: createWellnessGoalSchema }), wellnessController.createGoal);
router.patch('/goals/:id', validate({ params: idParamSchema, body: updateWellnessGoalSchema }), wellnessController.updateGoal);

// Mind-body dashboard metrics
router.get('/mind-body', wellnessController.getMindBodyMetrics);

// Resources list
router.get('/resources', wellnessController.listResources);

export default router;
