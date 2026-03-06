import { Router, type IRouter } from 'express';
import {
  platformConfigController,
  featureFlagController,
  abTestController,
  integrationController,
  webhookController,
  apiKeyController,
  ipRuleController,
  platformRoleController,
  authSettingController,
  auditLogController,
  legalDocController,
  complianceCertController,
  notificationRuleController,
} from '../controllers/settings.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  idParamSchema,
  upsertPlatformConfigSchema,
  createFeatureFlagSchema,
  updateFeatureFlagSchema,
  createABTestSchema,
  updateABTestSchema,
  createIntegrationSchema,
  updateIntegrationSchema,
  createWebhookSchema,
  updateWebhookSchema,
  createApiKeySchema,
  createIpRuleSchema,
  createPlatformRoleSchema,
  updatePlatformRoleSchema,
  upsertAuthSettingSchema,
  createLegalDocSchema,
  updateLegalDocSchema,
  createComplianceCertSchema,
  updateComplianceCertSchema,
  upsertNotificationRuleSchema,
  batchNotificationRulesSchema,
} from '../schemas/validation.schemas.js';

const router: IRouter = Router();
router.use(authenticate);

// ──────── Platform Config ────────
router.get('/config', authorize('PROVIDER', 'ADMIN'), platformConfigController.list);
router.put('/config', authorize('PROVIDER'), validateCsrf, validate({ body: upsertPlatformConfigSchema }), platformConfigController.upsert);
router.put('/config/bulk', authorize('PROVIDER'), validateCsrf, platformConfigController.bulkUpsert);
router.delete('/config/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema }), platformConfigController.delete);

// ──────── Feature Flags ────────
router.get('/flags', authorize('PROVIDER', 'ADMIN'), featureFlagController.list);
router.post('/flags', authorize('PROVIDER'), validateCsrf, validate({ body: createFeatureFlagSchema }), featureFlagController.create);
router.patch('/flags/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema, body: updateFeatureFlagSchema }), featureFlagController.update);
router.patch('/flags/:id/toggle', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema }), featureFlagController.toggle);
router.delete('/flags/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema }), featureFlagController.delete);

// ──────── A/B Tests ────────
router.get('/ab-tests', authorize('PROVIDER', 'ADMIN'), abTestController.list);
router.post('/ab-tests', authorize('PROVIDER'), validateCsrf, validate({ body: createABTestSchema }), abTestController.create);
router.patch('/ab-tests/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema, body: updateABTestSchema }), abTestController.update);
router.delete('/ab-tests/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema }), abTestController.delete);

// ──────── Integrations ────────
router.get('/integrations', authorize('PROVIDER', 'ADMIN'), integrationController.list);
router.post('/integrations', authorize('PROVIDER'), validateCsrf, validate({ body: createIntegrationSchema }), integrationController.create);
router.patch('/integrations/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema, body: updateIntegrationSchema }), integrationController.update);
router.delete('/integrations/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema }), integrationController.delete);

// ──────── Webhooks ────────
router.get('/webhooks', authorize('PROVIDER', 'ADMIN'), webhookController.list);
router.post('/webhooks', authorize('PROVIDER'), validateCsrf, validate({ body: createWebhookSchema }), webhookController.create);
router.patch('/webhooks/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema, body: updateWebhookSchema }), webhookController.update);
router.delete('/webhooks/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema }), webhookController.delete);

// ──────── API Keys ────────
router.get('/api-keys', authorize('PROVIDER', 'ADMIN'), apiKeyController.list);
router.post('/api-keys', authorize('PROVIDER'), validateCsrf, validate({ body: createApiKeySchema }), apiKeyController.create);
router.patch('/api-keys/:id/revoke', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema }), apiKeyController.revoke);

// ──────── IP Rules ────────
router.get('/ip-rules', authorize('PROVIDER', 'ADMIN'), ipRuleController.list);
router.post('/ip-rules', authorize('PROVIDER'), validateCsrf, validate({ body: createIpRuleSchema }), ipRuleController.create);
router.delete('/ip-rules/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema }), ipRuleController.delete);

// ──────── Platform Roles ────────
router.get('/roles', authorize('PROVIDER', 'ADMIN'), platformRoleController.list);
router.post('/roles', authorize('PROVIDER'), validateCsrf, validate({ body: createPlatformRoleSchema }), platformRoleController.create);
router.patch('/roles/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema, body: updatePlatformRoleSchema }), platformRoleController.update);
router.delete('/roles/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema }), platformRoleController.delete);

// ──────── Auth Settings ────────
router.get('/auth-settings', authorize('PROVIDER', 'ADMIN'), authSettingController.list);
router.put('/auth-settings', authorize('PROVIDER'), validateCsrf, validate({ body: upsertAuthSettingSchema }), authSettingController.upsert);

// ──────── Audit Log ────────
router.get('/audit-log', authorize('PROVIDER', 'ADMIN'), auditLogController.list);

// ──────── Legal Documents ────────
router.get('/legal', authorize('PROVIDER', 'ADMIN'), legalDocController.list);
router.post('/legal', authorize('PROVIDER'), validateCsrf, validate({ body: createLegalDocSchema }), legalDocController.create);
router.get('/legal/:id', authorize('PROVIDER', 'ADMIN'), validate({ params: idParamSchema }), legalDocController.getById);
router.patch('/legal/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema, body: updateLegalDocSchema }), legalDocController.update);
router.delete('/legal/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema }), legalDocController.delete);

// ──────── Compliance Certs ────────
router.get('/compliance', authorize('PROVIDER', 'ADMIN'), complianceCertController.list);
router.post('/compliance', authorize('PROVIDER'), validateCsrf, validate({ body: createComplianceCertSchema }), complianceCertController.create);
router.patch('/compliance/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema, body: updateComplianceCertSchema }), complianceCertController.update);
router.delete('/compliance/:id', authorize('PROVIDER'), validateCsrf, validate({ params: idParamSchema }), complianceCertController.delete);

// ──────── Notification Rules ────────
router.get('/notifications', authorize('PROVIDER', 'ADMIN'), notificationRuleController.list);
router.put('/notifications', authorize('PROVIDER'), validateCsrf, validate({ body: upsertNotificationRuleSchema }), notificationRuleController.upsert);
router.put('/notifications/batch', authorize('PROVIDER'), validateCsrf, validate({ body: batchNotificationRulesSchema }), notificationRuleController.batchUpsert);

export default router;
