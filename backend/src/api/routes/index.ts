import { Router, type IRouter } from 'express';
import authRoutes from './auth.routes.js';
import schoolRoutes from './school.routes.js';
import academicRoutes from './academic.routes.js';
import financeRoutes from './finance.routes.js';
import operationsRoutes from './operations.routes.js';
import adminRoutes from './admin.routes.js';
import parentRoutes from './parent.routes.js';
import parentV2Routes from './parent-v2.routes.js';
import messageRoutes from './message.routes.js';
import aiRoutes from './ai.routes.js';
import settingsRoutes from './settings.routes.js';
import userManagementRoutes from './user-management.routes.js';
import transportRoutes from './transport.routes.js';
import libraryRoutes from './library.routes.js';
import tenantRoutes from './tenant.routes.js';
import crmRoutes from './crm.routes.js';
import uploadRoutes from './upload.routes.js';
import analyticsRoutes from './analytics.routes.js';
import wellnessRoutes from './wellness.routes.js';
import schoolOpsRoutes from './school-ops.routes.js';
import providerRoutes from './provider.routes.js';
import studentRoutes from './student.routes.js';
import teacherRoutes from './teacher.routes.js';
import gamificationRoutes from './gamification.routes.js';

const router: IRouter = Router();

router.use('/auth', authRoutes);
router.use('/schools', schoolRoutes);
router.use('/academic', academicRoutes);
router.use('/finance', financeRoutes);
router.use('/operations', operationsRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/schools', schoolOpsRoutes);
router.use('/parent/v2', parentV2Routes);
router.use('/parent', parentRoutes);
router.use('/messages', messageRoutes);
router.use('/ai', aiRoutes);
router.use('/settings', settingsRoutes);
router.use('/user-management', userManagementRoutes);
router.use('/transport', transportRoutes);
router.use('/library', libraryRoutes);
router.use('/tenants', tenantRoutes);
router.use('/crm', crmRoutes);
router.use('/upload', uploadRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/wellness', wellnessRoutes);
router.use('/provider', providerRoutes);
router.use('/student', studentRoutes);
router.use('/teacher', teacherRoutes);
router.use('/gamification', gamificationRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;


