import { Router, type IRouter } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { providerController } from '../controllers/provider.controller.js';
import { requireActionReason, requireProviderPermission } from '../middlewares/provider-rbac.middleware.js';

const router: IRouter = Router();

router.use(authenticate);
router.use(authorize('PROVIDER'));

// Home + reference + search
router.get('/home', requireProviderPermission('provider.home.read'), providerController.getHome);
router.get('/reference', requireProviderPermission('provider.home.read'), providerController.getReference);
router.get('/search', requireProviderPermission('provider.search.read'), providerController.search);

// Tenants
router.get('/tenants', requireProviderPermission('provider.tenants.read'), providerController.listTenants);
router.get('/tenants/:tenantId', requireProviderPermission('provider.tenants.read'), providerController.getTenantDetail);
router.patch('/tenants/:tenantId/status', requireProviderPermission('provider.tenants.write'), validateCsrf, requireActionReason, providerController.updateTenantStatus);

// Onboarding
router.get('/onboarding', requireProviderPermission('provider.onboarding.read'), providerController.listOnboarding);
router.patch('/onboarding/tasks/:taskId', requireProviderPermission('provider.onboarding.write'), validateCsrf, requireActionReason, providerController.updateOnboardingTask);

// Billing and lifecycle
router.get('/billing/overview', requireProviderPermission('provider.billing.read'), providerController.getBillingOverview);
router.get('/billing/extras', requireProviderPermission('provider.billing.read'), providerController.getBillingExtras);
router.get('/plans', requireProviderPermission('provider.billing.read'), providerController.listPlans);
router.post('/plans', requireProviderPermission('provider.billing.write'), validateCsrf, requireActionReason, providerController.createPlan);
router.get('/subscriptions', requireProviderPermission('provider.billing.read'), providerController.listSubscriptions);
router.patch('/subscriptions/:subscriptionId/lifecycle', requireProviderPermission('provider.billing.write'), validateCsrf, requireActionReason, providerController.updateSubscriptionLifecycle);
router.get('/invoices', requireProviderPermission('provider.billing.read'), providerController.listInvoices);
router.get('/payments', requireProviderPermission('provider.billing.read'), providerController.listPayments);
router.get('/credits', requireProviderPermission('provider.billing.read'), providerController.listCredits);
router.post('/invoices/:invoiceId/retry', requireProviderPermission('provider.billing.write'), validateCsrf, requireActionReason, providerController.retryInvoice);
router.post('/approvals/:approvalId/decision', requireProviderPermission('provider.billing.write'), validateCsrf, requireActionReason, providerController.decideBillingApproval);
router.post('/gateways', requireProviderPermission('provider.billing.write'), validateCsrf, requireActionReason, providerController.createGateway);
router.patch('/gateways/:gatewayId', requireProviderPermission('provider.billing.write'), validateCsrf, requireActionReason, providerController.updateGateway);
router.post('/coupons', requireProviderPermission('provider.billing.write'), validateCsrf, requireActionReason, providerController.createCoupon);
router.patch('/coupons/:couponId', requireProviderPermission('provider.billing.write'), validateCsrf, requireActionReason, providerController.updateCoupon);

// Usage + limits
router.get('/usage', requireProviderPermission('provider.usage.read'), providerController.listUsage);
router.get('/limits', requireProviderPermission('provider.usage.read'), providerController.listLimits);

// Support
router.get('/support', requireProviderPermission('provider.support.read'), providerController.listSupport);
router.post('/support/tickets', requireProviderPermission('provider.support.write'), validateCsrf, requireActionReason, providerController.createSupportTicket);
router.patch('/support/tickets/:ticketId/status', requireProviderPermission('provider.support.write'), validateCsrf, requireActionReason, providerController.updateSupportStatus);

// Incidents + status
router.get('/incidents', requireProviderPermission('provider.incidents.read'), providerController.listIncidents);
router.post('/incidents', requireProviderPermission('provider.incidents.write'), validateCsrf, requireActionReason, providerController.createIncident);
router.get('/status', requireProviderPermission('provider.incidents.read'), providerController.getStatus);

// Releases + flags
router.get('/releases', requireProviderPermission('provider.releases.read'), providerController.listReleases);
router.get('/flags', requireProviderPermission('provider.releases.read'), providerController.listFlags);
router.patch('/flags/:flagId', requireProviderPermission('provider.releases.write'), validateCsrf, requireActionReason, providerController.updateFlag);

// Templates + addons
router.get('/templates', requireProviderPermission('provider.tenants.read'), providerController.listTemplates);
router.get('/addons', requireProviderPermission('provider.tenants.read'), providerController.listAddons);

// Integrations
router.get('/integrations', requireProviderPermission('provider.releases.read'), providerController.listIntegrations);

// Security + compliance + data ops
router.get('/security', requireProviderPermission('provider.security.read'), providerController.listSecurity);
router.get('/compliance', requireProviderPermission('provider.compliance.read'), providerController.listCompliance);
router.get('/data-ops', requireProviderPermission('provider.data_ops.read'), providerController.listDataOps);
router.post('/data-ops/requests/:requestType/:requestId/complete', requireProviderPermission('provider.data_ops.write'), validateCsrf, requireActionReason, providerController.completeDataRequest);

// Team + settings + audit
router.get('/team', requireProviderPermission('provider.security.read'), providerController.listTeam);
router.get('/team/permissions', requireProviderPermission('provider.security.read'), providerController.getPermissionContext);
router.get('/settings', requireProviderPermission('provider.home.read'), providerController.listSettings);
router.get('/audit', requireProviderPermission('provider.audit.read'), providerController.listAudit);

// ── Tenant extended mutations ──
router.get('/tenants/lifecycle', requireProviderPermission('provider.tenants.read'), providerController.getTenantLifecycle);
router.get('/tenants/maintenance/actions', requireProviderPermission('provider.tenants.read'), providerController.listTenantMaintenanceActions);
router.patch('/tenants/:tenantId/profile', requireProviderPermission('provider.tenants.write'), validateCsrf, requireActionReason, providerController.updateTenantProfile);
router.patch('/tenants/:tenantId/modules', requireProviderPermission('provider.tenants.write'), validateCsrf, requireActionReason, providerController.toggleTenantModule);
router.post('/tenants/maintenance/actions', requireProviderPermission('provider.tenants.write'), validateCsrf, requireActionReason, providerController.createTenantMaintenanceAction);
router.patch('/tenants/maintenance/actions/:actionId/resolve', requireProviderPermission('provider.tenants.write'), validateCsrf, requireActionReason, providerController.resolveTenantMaintenanceAction);
router.post('/tenants/bulk/status', requireProviderPermission('provider.tenants.write'), validateCsrf, requireActionReason, providerController.bulkUpdateTenantStatus);
router.post('/tenants/export', requireProviderPermission('provider.tenants.read'), validateCsrf, providerController.exportTenants);

// ── Onboarding launch ──
router.post('/onboarding/launch', requireProviderPermission('provider.onboarding.write'), validateCsrf, requireActionReason, providerController.launchOnboarding);

// ── Usage extras ──
router.post('/usage/exports', requireProviderPermission('provider.usage.read'), validateCsrf, providerController.createUsageExport);
router.patch('/limits/:limitId', requireProviderPermission('provider.usage.write'), validateCsrf, requireActionReason, providerController.updateLimit);
router.post('/limits', requireProviderPermission('provider.usage.write'), validateCsrf, requireActionReason, providerController.createLimit);

// ── Support extras ──
router.get('/support/extras', requireProviderPermission('provider.support.read'), providerController.getSupportExtras);
router.patch('/support/macros/:macroId', requireProviderPermission('provider.support.write'), validateCsrf, requireActionReason, providerController.updateMacro);
router.patch('/support/kb/:articleId', requireProviderPermission('provider.support.write'), validateCsrf, requireActionReason, providerController.updateKbArticle);

// ── Incidents / maintenance ──
router.get('/incidents/maintenance', requireProviderPermission('provider.incidents.read'), providerController.listMaintenanceWindows);
router.post('/incidents/maintenance', requireProviderPermission('provider.incidents.write'), validateCsrf, requireActionReason, providerController.createMaintenanceWindow);

// ── Releases creation + Flags creation ──
router.post('/releases', requireProviderPermission('provider.releases.write'), validateCsrf, requireActionReason, providerController.createRelease);
router.post('/flags', requireProviderPermission('provider.releases.write'), validateCsrf, requireActionReason, providerController.createFlag);

// ── Templates + connectors ──
router.post('/templates', requireProviderPermission('provider.tenants.write'), validateCsrf, requireActionReason, providerController.createTemplate);
router.post('/integrations/connectors', requireProviderPermission('provider.releases.write'), validateCsrf, requireActionReason, providerController.createConnector);
router.post('/integrations/logs/:logId/retry', requireProviderPermission('provider.releases.write'), validateCsrf, requireActionReason, providerController.retryIntegration);
router.get('/integrations/oauth-apps', requireProviderPermission('provider.releases.read'), providerController.listOAuthApps);
router.post('/integrations/oauth-apps', requireProviderPermission('provider.releases.write'), validateCsrf, requireActionReason, providerController.createOAuthApp);
router.patch('/integrations/webhooks/:webhookId', requireProviderPermission('provider.releases.write'), validateCsrf, requireActionReason, providerController.updateIntegrationWebhook);

// ── Security extras ──
router.get('/security/extras', requireProviderPermission('provider.security.read'), providerController.getSecurityExtras);
router.post('/security/ip-allowlist', requireProviderPermission('provider.security.write'), validateCsrf, requireActionReason, providerController.addIpRule);
router.delete('/security/ip-allowlist/:ruleId', requireProviderPermission('provider.security.write'), validateCsrf, requireActionReason, providerController.removeIpRule);
router.post('/security/sessions/revoke', requireProviderPermission('provider.security.write'), validateCsrf, requireActionReason, providerController.revokeSessions);

// ── API Management ──
router.get('/api-management', requireProviderPermission('provider.security.read'), providerController.getApiManagement);
router.post('/api-management/keys', requireProviderPermission('provider.security.write'), validateCsrf, requireActionReason, providerController.generateApiKey);
router.post('/api-management/keys/:keyId/rotate', requireProviderPermission('provider.security.write'), validateCsrf, requireActionReason, providerController.rotateApiKey);
router.post('/api-management/keys/:keyId/revoke', requireProviderPermission('provider.security.write'), validateCsrf, requireActionReason, providerController.revokeApiKey);
router.post('/api-management/webhooks', requireProviderPermission('provider.security.write'), validateCsrf, requireActionReason, providerController.createApiWebhook);
router.patch('/api-management/webhooks/:webhookId', requireProviderPermission('provider.security.write'), validateCsrf, requireActionReason, providerController.updateApiWebhook);
router.post('/api-management/webhooks/:webhookId/test', requireProviderPermission('provider.security.write'), validateCsrf, providerController.testApiWebhook);
router.patch('/api-management/rate-limits', requireProviderPermission('provider.security.write'), validateCsrf, requireActionReason, providerController.updateRateLimit);

// ── Settings mutations ──
router.patch('/settings', requireProviderPermission('provider.home.write'), validateCsrf, requireActionReason, providerController.updateSettings);
router.post('/settings/legal-templates', requireProviderPermission('provider.home.write'), validateCsrf, requireActionReason, providerController.createLegalTemplate);
router.patch('/settings/legal-templates/:templateId', requireProviderPermission('provider.home.write'), validateCsrf, requireActionReason, providerController.updateLegalTemplate);
router.post('/settings/email-templates', requireProviderPermission('provider.home.write'), validateCsrf, requireActionReason, providerController.createEmailTemplate);
router.patch('/settings/email-templates/:templateId', requireProviderPermission('provider.home.write'), validateCsrf, requireActionReason, providerController.updateEmailTemplate);
router.post('/settings/themes/apply', requireProviderPermission('provider.home.write'), validateCsrf, requireActionReason, providerController.applyTheme);
router.patch('/settings/custom-css', requireProviderPermission('provider.home.write'), validateCsrf, requireActionReason, providerController.saveCustomCss);

// ── Team mutations ──
router.post('/team/invite', requireProviderPermission('provider.security.write'), validateCsrf, requireActionReason, providerController.inviteTeamMember);
router.delete('/team/:userId', requireProviderPermission('provider.security.write'), validateCsrf, requireActionReason, providerController.removeTeamMember);
router.post('/team/roles', requireProviderPermission('provider.security.write'), validateCsrf, requireActionReason, providerController.createRole);
router.patch('/team/shifts', requireProviderPermission('provider.security.write'), validateCsrf, requireActionReason, providerController.updateShift);

// ── Audit exports ──
router.get('/audit/exports', requireProviderPermission('provider.audit.read'), providerController.listAuditExports);
router.post('/audit/exports', requireProviderPermission('provider.audit.write'), validateCsrf, requireActionReason, providerController.createAuditExport);

// ── Analytics ──
router.post('/analytics/export', requireProviderPermission('provider.audit.read'), validateCsrf, providerController.exportAnalytics);
router.get('/analytics/reports', requireProviderPermission('provider.audit.read'), providerController.listAnalyticsReports);
router.post('/analytics/reports', requireProviderPermission('provider.audit.write'), validateCsrf, requireActionReason, providerController.createScheduledReport);
router.post('/analytics/reports/:reportId/run', requireProviderPermission('provider.audit.write'), validateCsrf, requireActionReason, providerController.runReport);

// ── Notifications ──
router.get('/notifications', requireProviderPermission('provider.home.read'), providerController.listNotifications);
router.post('/notifications/read', requireProviderPermission('provider.home.write'), validateCsrf, providerController.markNotificationRead);
router.post('/notifications/rules', requireProviderPermission('provider.home.write'), validateCsrf, requireActionReason, providerController.createNotificationRule);
router.patch('/notifications/rules/:ruleId', requireProviderPermission('provider.home.write'), validateCsrf, requireActionReason, providerController.updateNotificationRule);

// ── Comms ──
router.get('/comms', requireProviderPermission('provider.support.read'), providerController.listComms);
router.post('/comms/announcements', requireProviderPermission('provider.support.write'), validateCsrf, requireActionReason, providerController.createAnnouncement);
router.post('/comms/announcements/:announcementId/send', requireProviderPermission('provider.support.write'), validateCsrf, requireActionReason, providerController.sendAnnouncement);
router.post('/comms/messages', requireProviderPermission('provider.support.write'), validateCsrf, requireActionReason, providerController.sendMessage);
router.post('/comms/templates', requireProviderPermission('provider.support.write'), validateCsrf, requireActionReason, providerController.createCommsTemplate);
router.patch('/comms/templates/:templateId', requireProviderPermission('provider.support.write'), validateCsrf, requireActionReason, providerController.updateCommsTemplate);

// ── Branding ──
router.get('/branding', requireProviderPermission('provider.home.read'), providerController.getBranding);
router.post('/branding/themes', requireProviderPermission('provider.home.write'), validateCsrf, requireActionReason, providerController.createBrandTheme);
router.patch('/branding/themes/:themeId', requireProviderPermission('provider.home.write'), validateCsrf, requireActionReason, providerController.updateBrandTheme);
router.post('/branding/domains', requireProviderPermission('provider.home.write'), validateCsrf, requireActionReason, providerController.addDomain);
router.post('/branding/domains/:domainId/verify', requireProviderPermission('provider.home.write'), validateCsrf, requireActionReason, providerController.verifyDomain);
router.post('/branding/login-pages', requireProviderPermission('provider.home.write'), validateCsrf, requireActionReason, providerController.createLoginPage);
router.patch('/branding/login-pages/:pageId', requireProviderPermission('provider.home.write'), validateCsrf, requireActionReason, providerController.updateLoginPage);

// ── Backups / DR ──
router.get('/backups', requireProviderPermission('provider.data_ops.read'), providerController.listBackups);
router.post('/backups/schedules', requireProviderPermission('provider.data_ops.write'), validateCsrf, requireActionReason, providerController.createBackupSchedule);
router.post('/backups/schedules/:scheduleId/run', requireProviderPermission('provider.data_ops.write'), validateCsrf, requireActionReason, providerController.triggerBackup);
router.patch('/backups/schedules/:scheduleId', requireProviderPermission('provider.data_ops.write'), validateCsrf, requireActionReason, providerController.updateBackupSchedule);
router.post('/backups/snapshots/:snapshotId/restore', requireProviderPermission('provider.data_ops.write'), validateCsrf, requireActionReason, providerController.restoreSnapshot);
router.post('/backups/runbooks', requireProviderPermission('provider.data_ops.write'), validateCsrf, requireActionReason, providerController.createRunbook);
router.post('/backups/runbooks/:runbookId/execute', requireProviderPermission('provider.data_ops.write'), validateCsrf, requireActionReason, providerController.executeRunbook);

// ── DataOps extras ──
router.get('/data-ops/extras', requireProviderPermission('provider.data_ops.read'), providerController.getDataOpsExtras);
router.post('/data-ops/imports', requireProviderPermission('provider.data_ops.write'), validateCsrf, requireActionReason, providerController.startDataImport);
router.post('/data-ops/repair/:jobId/run', requireProviderPermission('provider.data_ops.write'), validateCsrf, requireActionReason, providerController.runRepairJob);

export default router;

