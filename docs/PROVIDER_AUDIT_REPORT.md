# Provider Module — Exhaustive Audit Report

> Generated from a full read of **all 73 frontend view files**, **8 dialog files**, **backend controller (2,373 lines)**, **backend service (1,559 lines)**, **routes (340 lines)**, **hooks (3,137 lines)**, and **2 Zustand stores**.

---

## Executive Summary

| Metric | Value |
|---|---|
| Total provider frontend files | 73 `.tsx` |
| Total provider backend files | 3 (controller + service + routes) |
| Total hook file | 1 (3,137 lines, ~90 exported hooks) |
| `as any` casts (frontend views) | **28** across 9 files |
| `as never` casts (backend controller) | **11** |
| Backend data store | **100% in-memory** (`seedState()` — no Prisma/DB) |
| Controller endpoints returning hardcoded inline data | **≥12** |
| Frontend files with FALLBACK_ data | **16** |
| Dead buttons (empty `onClick`) | 0 |
| Dialogs with real API mutations | 8/8 |
| Console sections with real API hooks | 20/20 |

### CRITICAL (P0) — Architecture

The **entire backend provider module** is powered by an in-memory `seedState()` function in `provider-console.service.ts` (1,559 lines). There is **zero Prisma/database usage** — no imports, no queries, no writes. Every mutation operates on a mutable `let state` object that resets on server restart. This is the single biggest systemic risk and blocks production readiness for the entire provider module.

---

## 1. Backend Files

### 1.1 `backend/src/api/services/provider-console.service.ts` (1,559 lines)

| Check | Result |
|---|---|
| API Integration | **NONE** — 100% in-memory |
| Hardcoded data | **14 seed tenants**, 12+ seed invoices, seed tickets, incidents, flags, plans, subscriptions, templates, integrations, roles, users — all fabricated |
| `as any` / `as never` | 0 |
| Persistence | **None** — state resets on server restart |

**Severity: CRITICAL (P0)**

The entire service is a `seedState()` → mutable `let state` pattern. All CRUD operations (create, update, delete) mutate this JS object. Data is lost on every deploy / restart.

### 1.2 `backend/src/api/controllers/provider.controller.ts` (2,373 lines)

| Check | Result |
|---|---|
| API Integration | Delegates to `providerConsoleService` (in-memory) |
| `as never` casts | **11** (used to silence type narrowing on enum params) |
| Hardcoded inline data | **YES — significant** |

**Endpoints returning hardcoded inline objects (not from service):**

| Endpoint | Line Range | Issue |
|---|---|---|
| `getStatus` | ~650-670 | `components` array with hardcoded "Core API", "Web App", "Notifications", "Payments" + hardcoded `maintenance` window |
| `listReleases` | ~680-700 | Returns 2 hardcoded release objects (`2026.03.1`, `2026.03.2`) |
| `listSecurity` | ~730-750 | Returns hardcoded `suspiciousLogins` array with fake security event |
| `listCompliance` | ~770-780 | Hardcoded `retentionPolicy` object (`defaultDays: 365`, etc.) |
| `listDataOps` | ~790-810 | Hardcoded `repairTasks` and `migrationChecks` arrays |
| `listSettings` | ~870-890 | Hardcoded `defaultTenantSettings`, `notificationRules`, `legalTemplates` |
| `createUsageExport` | ~1060 | Returns fake `{ status: 'PROCESSING' }` — no real export |
| `updateLimit` / `createLimit` | ~1070-1100 | Echo back input as response, no persistence |
| `createTemplate` / `createConnector` | ~1270-1290 | Return `randomUUID()` + input — no persistence |
| `retryIntegration` | ~1300 | Returns `{ status: 'RETRYING' }` — no real retry |
| `revokeSessions` | ~1360 | Hardcoded `revokedCount: 5` when `all: true` |
| `exportTenants` / `exportAnalytics` | ~1030, ~1810 | Return fake `downloadUrl` — no real file generation |

**Severity: HIGH (P1)** — Many mutation endpoints are "echo-back" stubs that return fabricated success without real side effects.

### 1.3 `backend/src/api/routes/provider.routes.ts` (340 lines)

| Check | Result |
|---|---|
| Route coverage | **Excellent** — ~100+ routes |
| Middleware chain | `authenticate` → `authorize('PROVIDER')` → `requireProviderPermission` → `validateCsrf` → `requireActionReason` → `validate(schema)` |
| Missing endpoints | None identified |

**Severity: OK** — Routes are well-structured with proper middleware. No issues.

---

## 2. Hook File

### 2.1 `src/hooks/api/use-provider-console.ts` (3,137 lines)

| Check | Result |
|---|---|
| `as any` | **0** |
| Query hooks | ~35+ properly wired to `/provider/*` endpoints |
| Mutation hooks | ~55+ with `onSuccess` cache invalidation |
| Missing hooks | None identified — every console section has corresponding hooks |
| Type safety | Strong — extensive DTO type exports |

**Severity: OK** — This file is production-quality in structure. The problem is the backend it talks to.

---

## 3. Stores

### 3.1 `src/store/provider-data.store.ts`

| Check | Result |
|---|---|
| Hardcoded defaults | `platformHealth: { uptime: 99.9, avgLatency: 45, errorRate: 0.1, activeUsers: 0 }` |
| Purpose | Cross-component state cache |

**Severity: LOW (P3)** — Defaults are only used before API data loads; they're overwritten in `ProviderHomeSection` via `useEffect`.

### 3.2 `src/store/provider-console.store.ts`

| Check | Result |
|---|---|
| Purpose | UI preferences (pinned/recent tenants, saved views) |
| Persistence | `zustand/persist` (localStorage) |

**Severity: OK** — Purely client-side UI state, appropriate use.

---

## 4. Dashboard View Files

### 4.1 `src/views/provider/sections/dashboard/shared.tsx` (177 lines)

Exports all `FALLBACK_*` constants used across dashboard:

| Constant | Line | Data |
|---|---|---|
| `FALLBACK_mrrSpark` | 137 | 12 hardcoded sparkline values |
| `FALLBACK_tenantSpark` | 138 | 12 hardcoded sparkline values |
| `FALLBACK_ltvSpark` | 139 | 12 hardcoded sparkline values |
| `FALLBACK_churnSpark` | 140 | 12 hardcoded sparkline values |
| `FALLBACK_mrrData` | 142-149 | 8 months of fake MRR data |
| `FALLBACK_trialData` | 151-158 | 8 months of fake trial data |
| `FALLBACK_alerts` | 160-168 | 3 fake alert objects |

**Severity: MEDIUM (P2)** — These fallbacks are used as defaults when API returns null, but some are used as **primary data sources** (see OverviewView below).

### 4.2 `src/views/provider/sections/dashboard/OverviewView.tsx` (306 lines)

| Check | Result |
|---|---|
| API hooks | `useTenantStats`, `useProviderBillingOverview` |
| `as any` | **1** — line 39: `(billingData as any)?.alerts` |
| Loading states | Missing — no loading spinner/skeleton |

**Issues:**

| Line | Severity | Issue |
|---|---|---|
| 39 | P2 | `(billingData as any)?.alerts` — DTO doesn't expose `alerts` field |
| 55 | P2 | `sparkline: FALLBACK_tenantSpark` — always uses fallback, never API data |
| 62 | P2 | `sparkline: FALLBACK_ltvSpark` — always fallback |
| 69 | P2 | `sparkline: FALLBACK_churnSpark` — always fallback |
| 82-90 | P1 | `FALLBACK_tickerItems` — hardcoded ticker ("North Star Academy renewed…"), **never overridden** by API |
| 198-212 | P1 | `FALLBACK_trialData` — always used as BarChart data, never replaced by API |
| 126-145 | P2 | Platform Controls sidebar buttons ("Bulk Import", "Export All", "Invite Admin", "API Settings") navigate but are not wired to actions |

### 4.3 `src/views/provider/sections/dashboard/AnalyticsView.tsx` (254 lines)

| Check | Result |
|---|---|
| API hooks | `usePlatformAnalytics`, `useProviderUsage` |
| `as any` | 0 |
| Loading states | Missing |

**Issues:**

| Line | Severity | Issue |
|---|---|---|
| ~30-50 | P1 | Heatmap grid — 7×24 grid of hardcoded values (never from API) |
| ~55-65 | P1 | Activity feed — hardcoded `activityFeed` array (never from API) |
| ~70-80 | P1 | Retention data — hardcoded `retentionWeeks` (never from API) |
| ~85-95 | P2 | Top pages — hardcoded with fallback (`/app/dashboard 24.1k` etc.) |
| ~100-110 | P2 | Device breakdown — hardcoded `58%/32%/10%` |
| ~115 | P2 | `"+21.4%"` growth badge — hardcoded string |
| ~120 | P2 | `"94.2%"` retention rate — hardcoded string |
| 72 | P3 | `const chartData = apiMrrData ?? FALLBACK_mrrData` — proper fallback |

### 4.4 `src/views/provider/sections/dashboard/MarketView.tsx` (231 lines)

| Check | Result |
|---|---|
| API hooks | `useMarketIntelligence`, `useProviderReports` |
| `as any` | **2** — lines 12-13: `(reportsData as any)?.features`, `(reportsData as any)?.opportunities` |
| Loading states | Missing |

**Issues:**

| Line | Severity | Issue |
|---|---|---|
| 12-13 | P2 | Two `as any` casts — DTO doesn't define `features`/`opportunities` |
| ~20-50 | P1 | Entire competitive matrix hardcoded (PowerSchool 89, Clever 82, etc.) |
| ~55-60 | P1 | NPS score `72` hardcoded — never from API |
| 66 | P2 | Market growth data derived from `FALLBACK_mrrData` (not API) |
| ~100-110 | P1 | Market Pulse keywords hardcoded ("AI Grading", "Competency-Based" etc.) |
| 67-81 | P3 | `FALLBACK_features` / `FALLBACK_opportunities` — proper fallback pattern |

### 4.5 `src/views/provider/sections/dashboard/SystemView.tsx` (242 lines)

| Check | Result |
|---|---|
| API hooks | `useSystemHealth`, `useSystemHealthAnalytics` |
| `as any` | **2** — lines 98, 107: `(analyticsHealth as any)?.events`, `(analyticsHealth as any)?.downDays` |
| Loading states | Missing |

**Issues:**

| Line | Severity | Issue |
|---|---|---|
| 98, 107 | P2 | Two `as any` casts — DTO doesn't expose `events`/`downDays` |
| ~30-50 | P1 | Deployment pipeline fully hardcoded (Build→Test→Staging→Production stages) |
| ~55-70 | P1 | Service statuses hardcoded (Core API "Operational", etc.) |
| ~75-85 | P1 | Resource gauges (CPU 67%, Memory 54%, Disk 42%, Network 28%) — hardcoded |
| ~90 | P2 | `"99.97%"` uptime badge — hardcoded |
| 91-99 | P3 | `FALLBACK_events` — proper fallback pattern |

---

## 5. Main Section View Files

### 5.1 `src/views/provider/sections/TenantsView.tsx` (407 lines)

| Check | Result |
|---|---|
| API hooks | `useTenants`, `useTenant`, `useTenantStats`, `useDeleteTenant`, `useSuspendTenant`, `useExportTenantsCsv` |
| `as any` | 0 |
| Loading states | Yes — has loading checks |

**Issues:**

| Line | Severity | Issue |
|---|---|---|
| ~240-250 | P2 | Sidebar "Recent Activity" feed hardcoded ("Springfield Academy renewed…", "New tenant added", etc.) |
| ~170 | P3 | `"+$820"` and `"+2"` stat card changes are hardcoded strings |

### 5.2 `src/views/provider/sections/PlansView.tsx` (343 lines)

| Check | Result |
|---|---|
| API hooks | `usePlatformPlans`, `useProviderBillingOverview`, `useTenantStats`, `useDeletePlatformPlan` |
| `as any` | 0 |
| Loading states | Partial |

**Issues:**

| Line | Severity | Issue |
|---|---|---|
| ~180-200 | P1 | Upgrade Funnel data hardcoded (42%, 28%, 35%, 68%) — never from API |
| ~210-230 | P1 | Quick Stats sidebar: LTV `$2.4K`, CAC `$180`, Payback `2.2mo`, Churn `2.1%` — all hardcoded |
| ~50 | P2 | `"+48.7%"` growth badge hardcoded |
| ~60 | P3 | `"+$820"` change hardcoded |
| ~140-150 | P3 | Plan sparklines use fallback arrays |

### 5.3 `src/views/provider/sections/InvoicesView.tsx` (307 lines)

| Check | Result |
|---|---|
| API hooks | `usePlatformInvoices`, `usePlatformInvoiceStats`, `useMarkInvoicePaid`, `useDeletePlatformInvoice` |
| `as any` | 0 |
| Loading states | Yes |

**Issues:**

| Line | Severity | Issue |
|---|---|---|
| ~70 | P3 | `"+$2.4K"` change hardcoded in KPI card |

### 5.4 `src/views/provider/sections/GatewaysView.tsx` (272 lines)

| Check | Result |
|---|---|
| API hooks | `usePaymentGateways`, `useDeletePaymentGateway` |
| `as any` | 0 |
| Loading states | Partial |

**Issues:**

| Line | Severity | Issue |
|---|---|---|
| ~100-110 | P1 | Gateway `transactions` and `volume` always display `"—"` |
| ~120-130 | P1 | KPI values computed as `gateways.length * hardcoded_multiplier` (e.g., `* 12450`) |
| ~140 | P1 | Success Rate `"99.2%"` hardcoded |
| ~150-160 | P1 | Health sidebar: uptime `"99.9%"`, latency `"45ms"` — hardcoded |
| ~80 | P2 | `"All Connected"` badge — hardcoded |

### 5.5 `src/views/provider/sections/PlatformCRMSection.tsx` (343 lines)

| Check | Result |
|---|---|
| API hooks | `useCrmAccounts`, `useCrmDealsByStage`, `useCrmDealStats`, `useDeleteCrmAccount`, `useDeleteCrmDeal`, `useTouchCrmAccount`, `useUpdateCrmDeal` |
| `as any` | 0 |
| Loading states | Yes (11 references) |

**Severity: OK** — Well-wired with real API hooks.

### 5.6 `src/views/provider/sections/OverlaySettingSection.tsx` (356 lines)

| Check | Result |
|---|---|
| API hooks | `useUpdateOverlaySettings` |
| `as any` | 0 |
| Loading states | Partial |

**Severity: OK** — Properly wired to mutation.

---

## 6. Console Section Files

### 6.1 `src/views/provider/sections/console/ProviderHomeSection.tsx` (448 lines)

| Check | Result |
|---|---|
| API hooks | `useProviderHome`, `useProviderModuleData`, `useProviderTenants`, `useRetryProviderInvoice` |
| `as any` | 0 |
| Loading states | Partial (data synced to store, no explicit loading skeleton) |

**Severity: OK** — Fully wired. All KPIs derived from API data. Buttons trigger real mutations.

### 6.2 `src/views/provider/sections/console/ProviderTenantsSection.tsx` (1,850 lines)

| Check | Result |
|---|---|
| API hooks | `useProviderTenants`, `useProviderTenantDetail`, `useProviderTenantLifecycle`, `useProviderTenantMaintenanceActions`, `useBulkUpdateTenantStatus`, `useExportTenants`, `useCreateTenantMaintenanceAction`, `useResolveTenantMaintenanceAction`, `useToggleTenantModule`, `useUpdateProviderTenantStatus`, `useUpdateTenantProfile`, `useStartProviderDataImport` |
| `as any` | 0 |
| Loading states | Yes (17 references) |

**Severity: OK** — Comprehensive API wiring.

### 6.3 `src/views/provider/sections/console/ProviderSettingsSection.tsx` (1,091 lines)

| Check | Result |
|---|---|
| API hooks | **36 hooks** — full granular settings CRUD for general config, provisioning rules, retention policy, alert channels, escalation rules, quiet hours, SLA policies, legal templates V2, email templates V2, appearance theme/layout, custom CSS |
| `as any` | 0 |
| Loading states | Yes (57 references) |

**Severity: OK** — Most thoroughly wired section. All settings forms submit to real endpoints.

### 6.4 `src/views/provider/sections/console/ProviderCommsSection.tsx` (866 lines)

| Check | Result |
|---|---|
| API hooks | `useProviderComms`, `useProviderEmails`, `useProviderTenants`, `useComposeProviderEmail`, `useCreateProviderAnnouncement`, `useCreateProviderCommsTemplate`, `useDeleteProviderEmail`, `useSendProviderAnnouncement`, `useUpdateProviderCommsTemplate`, `useUpdateProviderEmail` |
| `as any` | 0 |
| Loading states | Yes (18 references) |
| Mutations | 17 mutation calls |

**Severity: OK** — Full email client implementation with CRUD.

### 6.5 `src/views/provider/sections/console/ProviderDataOpsSection.tsx` (744 lines)

| Check | Result |
|---|---|
| API hooks | `useProviderModuleData`, `useProviderDataOpsExtras`, `useProviderBackups`, `useCompleteProviderDataRequest`, `useStartProviderDataImport`, `useRunProviderRepairJob`, `useTriggerProviderBackup`, `useRestoreProviderSnapshot`, `useCreateProviderBackupSchedule`, `useExecuteProviderRunbook` |
| `as any` | 0 |
| Loading states | Yes (28 references) |

**Severity: OK** — Well-wired.

### 6.6 `src/views/provider/sections/console/ProviderSupportSection.tsx` (578 lines)

| Check | Result |
|---|---|
| API hooks | `useProviderModuleData`, `useProviderSupportExtras`, `useProviderTenants`, `useCreateProviderSupportTicket`, `useUpdateProviderSupportTicketStatus`, `useCreateProviderMacro`, `useDeleteProviderMacro`, `useUpdateProviderMacro`, `useCreateProviderKbArticle`, `useUpdateProviderKbArticle`, `useSendProviderCsatSurvey` |
| `as any` | 0 |
| Loading states | Yes (18 references) |

**Severity: OK** — Full support CRUD wired.

### 6.7 `src/views/provider/sections/console/ProviderSecuritySection.tsx` (545 lines)

| Check | Result |
|---|---|
| API hooks | `useProviderModuleData`, `useProviderPermissionContext`, `useProviderSecurityExtras`, `useProviderApiManagement`, `useSecurityData`, `useAddProviderIpRule`, `useRemoveProviderIpRule`, `useGenerateProviderApiKey`, `useRotateProviderApiKey`, `useRevokeProviderApiKey`, `useRevokeProviderSession`, `useRequestProviderComplianceReport` |
| `as any` | 0 |
| Loading states | Yes (19 references) |

**Severity: OK**

### 6.8 `src/views/provider/sections/console/ProviderIncidentsSection.tsx` (536 lines)

| Check | Result |
|---|---|
| API hooks | `useProviderModuleData`, `useProviderStatus`, `useProviderTenants`, `useProviderMaintenanceWindows`, `useCreateProviderIncident`, `useCreateProviderMaintenanceWindow`, `useResolveProviderIncident` |
| `as any` | 0 |
| Loading states | Yes (13 references) |

**Issues:**

| Line | Severity | Issue |
|---|---|---|
| 384 | P2 | `const uptimePct = ok ? '99.98' : '99.72'` — hardcoded uptime values |

### 6.9 Other Console Sections (all OK)

| File | Lines | Hooks | `as any` | Status |
|---|---|---|---|---|
| `ProviderAnalyticsSection.tsx` | 268 | 7 hooks + 3 mutations | 0 | OK |
| `ProviderApiMgmtSection.tsx` | 331 | 10 hooks + 7 mutations | 0 | OK |
| `ProviderAuditSection.tsx` | 242 | 3 hooks + 1 mutation | 0 | OK |
| `ProviderBackupSection.tsx` | 285 | 10 hooks + 6 mutations | 0 | OK |
| `ProviderBrandingSection.tsx` | 338 | 9 hooks + 6 mutations | 0 | OK |
| `ProviderNotificationsSection.tsx` | 229 | 4 hooks + 3 mutations | 0 | OK |
| `ProviderOnboardingSection.tsx` | 475 | 5 hooks + 3 mutations | **1** | See below |
| `ProviderReleasesSection.tsx` | 283 | 7 hooks + 4 mutations | 0 | OK |
| `ProviderTeamSection.tsx` | 293 | 9 hooks + 4 mutations | 0 | OK |
| `ProviderIntegrationsSection.tsx` | 364 | 11 hooks + 5 mutations | 0 | OK |
| `ProviderBillingSection.tsx` | 33 | Router only | 0 | OK |
| `onboarding-wizard-steps.tsx` | 697 | 3 hooks | 0 | OK* |

**ProviderOnboardingSection.tsx** — line 195: `(c as any).status === 'IN_PROGRESS'` — pipeline card type missing `status` field.

**onboarding-wizard-steps.tsx** — `FALLBACK_PLANS` at line 228 used when API returns empty; acceptable fallback pattern.

---

## 7. Billing Sub-Pages

All 8 billing sub-pages (`console/billing/*.tsx`) are wired to hooks from `useProviderBillingOverview`:

| File | Lines | Loading States | Mutations |
|---|---|---|---|
| `ApprovalsBillingPage.tsx` | 110 | 7 refs | `useDecideProviderBillingApproval` |
| `CouponsBillingPage.tsx` | 146 | 7 refs | `useCreateProviderCoupon`, `useUpdateProviderCoupon` |
| `DunningBillingPage.tsx` | 107 | 7 refs | `useRetryProviderInvoice` |
| `InvoicesBillingPage.tsx` | 105 | 5 refs | `useMarkInvoicePaid` |
| `PaymentsBillingPage.tsx` | 161 | 10 refs | `useRetryProviderInvoice`, `useRefundPayment` |
| `PlansBillingPage.tsx` | 194 | 7 refs | `useCreateProviderPlan` |
| `RevenueBillingPage.tsx` | 100 | 8 refs | None (read-only) |
| `SubscriptionsBillingPage.tsx` | 114 | 5 refs | `useUpdateProviderSubscriptionLifecycle` |

**Severity: OK** — All billing sub-pages are properly wired with loading states.

---

## 8. Dialog Files

All 8 dialogs are wired to real mutations:

| File | Lines | Mutation Hook |
|---|---|---|
| `AddTenantDialog.tsx` | 324 | `useCreateTenant` |
| `EditTenantDialog.tsx` | 324 | `useUpdateTenant` |
| `BulkImportDialog.tsx` | 198 | `useBulkImportTenants` |
| `ConfigureGatewayDialog.tsx` | 129 | `useCreatePaymentGateway`, `useUpdatePaymentGateway` |
| `CreateDealDialog.tsx` | 171 | `useCreateCrmDeal`, `useUpdateCrmDeal` |
| `CreateInvoiceDialog.tsx` | 114 | `useCreatePlatformInvoice` |
| `CreatePlanDialog.tsx` | 140 | `useCreatePlatformPlan`, `useUpdatePlatformPlan` |
| `SendInvitesDialog.tsx` | 130 | `useSendInvites` |

**Severity: OK** — No dead dialogs.

---

## 9. Concierge Files

### 9.1 `ProviderConciergeAssistant.tsx` (213 lines)

| Check | Result |
|---|---|
| API hooks | `useProviderHome`, `useAIChat` |
| `as any` | **3** — lines 142, 145, 146 (filtering `actionInbox` items by `priority`/`type` fields not in DTO) |
| Loading states | 1 ref (AI chat) |

**Issues:**

| Line | Severity | Issue |
|---|---|---|
| 31-42 | P3 | `FALLBACK_TODAY_CHIPS` — used only when `homeData` is null (acceptable) |
| 43-46 | P3 | `FALLBACK_SLASH_CMDS` — always used (not API-backed — acceptable for AI assistant) |
| 109-120 | P3 | `todayTimelineItems` — hardcoded timeline schedule (decorative) |
| 142, 145, 146 | P2 | `as any` casts on `actionInbox` items — DTO missing `priority`, `type` fields |
| 158 | P2 | `notifySuccess` on Today timeline actions — decorative only, no API call |

### 9.2 `ProviderConciergeComms.tsx` (238 lines)

| Check | Result |
|---|---|
| API hooks | `useProviderComms`, `useProviderNotifications`, `useCreateProviderAnnouncement` |
| `as any` | **6** — lines 67-72 (casting API response shapes) |
| Mutations | 3 real mutation calls |

**Issues:**

| Line | Severity | Issue |
|---|---|---|
| 15-60 | P2 | 6 hardcoded `FALLBACK_*` arrays (broadcasts, tenant notices, release notes, incident updates, templates, delivery log) |
| 67-72 | P2 | 6 `as any` casts — backend DTOs don't match expected shapes for `releaseNotes`, `incidentUpdates`, `deliveries` |

### 9.3 `ProviderConciergeDev.tsx` (412 lines)

| Check | Result |
|---|---|
| API hooks | `useProviderReleases`, `useProviderModuleData`, `useCreateProviderRelease`, `useUpdateProviderFeatureFlag` |
| `as any` | **6** — lines 159-165 (casting `releasesData` and `moduleData`) |
| Mutations | 5 calls |

**Issues:**

| Line | Severity | Issue |
|---|---|---|
| 34-108 | P2 | `FALLBACK_DEV_ITEMS` — large hardcoded dev item list (used when API empty) |
| 159-165 | P2 | 6 `as any` casts — `releasesData.releases`, `moduleData.featureFlags` types not aligned |
| 328 | P2 | "Assign" button — `notifySuccess` only, **no API call** (decorative) |
| 337 | P3 | "View PR" — clipboard copy only, no API |
| 348 | P2 | "Unblock" button — `notifySuccess` only, **no API call** (decorative) |
| 358 | P2 | "QA Run" button — `notifySuccess` only, **no API call** (decorative) |
| 388 | P2 | "Update Status" button — `notifySuccess` only, **no API call** (decorative) |

### 9.4 `ProviderConciergeOps.tsx` (253 lines)

| Check | Result |
|---|---|
| API hooks | `useProviderModuleData`, `useUpdateProviderSupportTicketStatus`, `useProviderComms` |
| `as any` | **1** — line 102 |
| Mutations | 5 real calls |

**Issues:**

| Line | Severity | Issue |
|---|---|---|
| 25-60 | P2 | `FALLBACK_TICKETS` — hardcoded ticket list |
| 102 | P2 | `(moduleData?.tickets as any as Ticket[])` — type mismatch |

### 9.5 `ProviderConciergeSettings.tsx` (213 lines)

| Check | Result |
|---|---|
| API hooks | `useProviderSettings`, `useProviderPermissionContext`, `useUpdateProviderSettings` |
| `as any` | **6** — lines 78-83 |
| Mutations | 3 real calls |

**Issues:**

| Line | Severity | Issue |
|---|---|---|
| 12-65 | P2 | 6 `FALLBACK_*` arrays (permission items, routing rules, snippets, execution policies, notification prefs, audit rules) — used when settings don't expose these fields |
| 78-83 | P2 | 6 `as any` casts — backend DTO shapes don't match (`executionPolicies`, `notificationPrefs`, `auditRules` not in DTO) |

### 9.6 `ProviderConciergeTenants.tsx` (355 lines)

| Check | Result |
|---|---|
| API hooks | `useProviderTenants`, `useUpdateProviderTenantStatus`, `useSendProviderMessage` |
| `as any` | 0 |
| Mutations | 3 real calls |

**Issues:**

| Line | Severity | Issue |
|---|---|---|
| 87-125 | P2 | `FALLBACK_TENANTS` — 6 hardcoded tenants used when API empty |

---

## 10. Settings Section Files

| File | Lines | Hooks | `as any` | Loading | Status |
|---|---|---|---|---|---|
| `ConfigurationSection.tsx` | 456 | `usePlatformConfigs`, `useUpsertConfig`, `useNotificationRules`, `useUpsertNotificationRule` | 0 | 10 refs | OK |
| `FeatureFlagsSection.tsx` | 422 | `useFeatureFlags`, `useCreateFlag`, `useDeleteFlag`, `useToggleFlag`, `useUpdateFlag`, `useABTests`, `useCreateABTest`, `useDeleteABTest`, `useUpdateABTest` | 0 | 11 refs | OK |
| `IntegrationsSection.tsx` | 434 | `useIntegrations`, `useApiKeys`, `useWebhooks`, `useCreateIntegration`, `useDeleteIntegration`, `useUpdateIntegration`, `useCreateApiKey`, `useRevokeApiKey`, `useCreateWebhook`, `useDeleteWebhook`, `useUpdateWebhook` | 0 | 11 refs | OK |
| `LegalSection.tsx` | 484 | `useLegalDocs`, `useComplianceCerts`, `useCreateLegalDoc`, `useDeleteLegalDoc`, `useUpdateLegalDoc`, `useCreateComplianceCert`, `useDeleteComplianceCert`, `useUpdateComplianceCert` | 0 | 12 refs | OK |
| `SecuritySection.tsx` | 513 | `useAuditLog`, `useAuthSettings`, `useIpRules`, `usePlatformRoles`, `useCreateIpRule`, `useDeleteIpRule`, `useCreateRole`, `useDeleteRole`, `useUpdateRole`, `useUpsertAuthSetting` | 0 | 12 refs | OK |

**Severity: OK** — All 5 settings sections are fully wired with CRUD hooks and loading states.

---

## 11. User Management Files

| File | Lines | Hooks | `as any` | Loading | Status |
|---|---|---|---|---|---|
| `AllUsersView.tsx` | 341 | `useUserList`, `useUserStats`, `useDeleteUser`, `useBulkDeleteUsers` | 0 | 2 refs | OK |
| `BulkOpsView.tsx` | 241 | `useCreateUser`, `useUserStats` | 0 | 1 ref | OK |
| `RolesView.tsx` | 207 | `useUserList`, `useUserStats`, `useBulkUpdateRole` | 0 | 3 refs | OK |
| `shared.tsx` | 300 | `useCreateUser`, `useUpdateUser`, `useBulkUpdateRole` | 0 | 6 refs | OK |

**Severity: OK** — All wired.

---

## 12. Severity Summary

### CRITICAL (P0) — 1 Issue

| # | File | Issue |
|---|---|---|
| 1 | `backend/src/api/services/provider-console.service.ts` | **Entire provider backend is in-memory** — 1,559 lines of seed data + mutable state, zero DB persistence. All data lost on restart. |

### HIGH (P1) — 14 Issues

| # | File | Issue |
|---|---|---|
| 1 | `provider.controller.ts` | ≥12 endpoints return hardcoded inline data or echo-back stubs |
| 2 | `OverviewView.tsx:82-90` | Ticker items permanently hardcoded, never overridden by API |
| 3 | `OverviewView.tsx:198-212` | Trial chart uses `FALLBACK_trialData` as sole data source |
| 4 | `AnalyticsView.tsx:~30-50` | Heatmap grid 100% hardcoded |
| 5 | `AnalyticsView.tsx:~55-65` | Activity feed 100% hardcoded |
| 6 | `AnalyticsView.tsx:~70-80` | Retention data 100% hardcoded |
| 7 | `MarketView.tsx:~20-50` | Competitive matrix 100% hardcoded |
| 8 | `MarketView.tsx:~55-60` | NPS score `72` hardcoded |
| 9 | `MarketView.tsx:~100-110` | Market Pulse keywords hardcoded |
| 10 | `SystemView.tsx:~30-50` | Deployment pipeline 100% hardcoded |
| 11 | `SystemView.tsx:~55-70` | Service statuses hardcoded |
| 12 | `SystemView.tsx:~75-85` | Resource gauges (CPU/Memory/Disk) hardcoded |
| 13 | `PlansView.tsx:~180-200` | Upgrade funnel data hardcoded |
| 14 | `GatewaysView.tsx` | Gateway stats (transactions, volume, success rate, uptime, latency) all hardcoded |

### MEDIUM (P2) — 22 Issues

| # | Category | Issue |
|---|---|---|
| 1-6 | `as any` in dashboard views | 5 casts accessing non-existent DTO fields (OverviewView ×1, MarketView ×2, SystemView ×2) |
| 7 | `ProviderOnboardingSection.tsx:195` | 1 `as any` cast — pipeline card missing `status` type |
| 8-10 | `as any` in concierge | 16 casts across 5 files: ConciergeAssistant ×3, ConciergeComms ×6, ConciergeDev ×6, ConciergeOps ×1 |
| 11-16 | Concierge fallback data | 6 concierge files with `FALLBACK_*` arrays for data the API doesn't return |
| 17-21 | Decorative buttons in ConciergeDev | 5 buttons that show `notifySuccess` only (Assign, Unblock, QA Run, Update Status, Today actions) |
| 22 | `ProviderIncidentsSection.tsx:384` | Hardcoded uptime `99.98` / `99.72` |

### LOW (P3) — 8 Issues

| # | File | Issue |
|---|---|---|
| 1 | `dashboard/shared.tsx` | 7 `FALLBACK_*` export constants (sparkline/chart defaults) |
| 2 | `provider-data.store.ts` | Hardcoded `platformHealth` defaults (overwritten by API) |
| 3 | `TenantsView.tsx:~240` | Hardcoded "Recent Activity" sidebar |
| 4 | `TenantsView.tsx:~170` | Hardcoded stat card change values (`"+$820"`, `"+2"`) |
| 5 | `InvoicesView.tsx:~70` | `"+$2.4K"` change hardcoded |
| 6 | `PlansView.tsx:~210-230` | Quick Stats sidebar (LTV/CAC/Payback/Churn) hardcoded |
| 7 | `OverviewView.tsx:55-69` | KPI sparklines always fallback (non-critical since MRR sparkline does use API) |
| 8 | `ConciergeAssistant.tsx:109-120` | `todayTimelineItems` hardcoded (decorative schedule) |

---

## 13. Missing Loading States

The following dashboard view files render data immediately **without** showing a loading skeleton or spinner:

- `OverviewView.tsx`
- `AnalyticsView.tsx`
- `MarketView.tsx`
- `SystemView.tsx`

All console sections and dialogs **do** handle loading states properly.

---

## 14. Forms Without Submit

**None found.** Every dialog and form in the provider module calls a real mutation hook.

---

## 15. `as any` Cast Locations (Complete)

| File | Line(s) | Expression |
|---|---|---|
| `OverviewView.tsx` | 39 | `(billingData as any)?.alerts` |
| `MarketView.tsx` | 12 | `(reportsData as any)?.features` |
| `MarketView.tsx` | 13 | `(reportsData as any)?.opportunities` |
| `SystemView.tsx` | 98 | `(analyticsHealth as any)?.events` |
| `SystemView.tsx` | 107 | `(analyticsHealth as any)?.downDays` |
| `ProviderOnboardingSection.tsx` | 195 | `(c as any).status` |
| `ProviderConciergeAssistant.tsx` | 142, 145, 146 | `(a as any).priority`, `(a as any).type` ×2 |
| `ProviderConciergeComms.tsx` | 67-72 | 6 casts on `commsData`/`notifData` sub-fields |
| `ProviderConciergeDev.tsx` | 159-165 | 6 casts on `releasesData`/`moduleData` |
| `ProviderConciergeOps.tsx` | 102 | `(moduleData?.tickets as any as Ticket[])` |
| `ProviderConciergeSettings.tsx` | 78-83 | 6 casts on `permCtx`/`settingsData` |

**Total: 28 `as any` casts across 11 files.**

---

## 16. Recommended Action Priority

1. **P0 — Migrate `provider-console.service.ts` to Prisma/DB** — Without this, no data persists across deploys. This blocks production readiness.
2. **P1 — Wire dashboard hardcoded data to API** — Add backend endpoints for analytics heatmaps, activity feeds, retention data, competitive matrix, NPS, deployment pipeline, gateway stats, and funnel data.
3. **P1 — Replace echo-back controller stubs** — Endpoints like `createTemplate`, `createConnector`, `retryIntegration`, `exportTenants`, `revokeSessions` need real implementations.
4. **P2 — Fix DTO types to eliminate `as any` casts** — Extend `ProviderBillingOverviewDTO` to include `alerts`, `ScheduledReportDTO` to include `features`/`opportunities`, `SystemHealthDTO` to include `events`/`downDays`, and `ProviderActionInboxItem` to include `priority`/`type`.
5. **P2 — Wire decorative concierge buttons** — ConciergeDev's Assign, Unblock, QA Run, Update Status buttons need real API calls.
6. **P3 — Add loading skeletons to dashboard views** — OverviewView, AnalyticsView, MarketView, SystemView lack loading states.
