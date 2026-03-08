
import { randomUUID } from 'node:crypto';
import { prisma } from '../../db/prisma.service.js';
import { logger } from '../../utils/logger.js';

type TenantStatus = 'TRIAL' | 'ACTIVE' | 'PAYMENT_DUE' | 'SUSPENDED' | 'OFFBOARDING' | 'ARCHIVED';
type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
type TicketStatus = 'NEW' | 'IN_PROGRESS' | 'WAITING_ON_CUSTOMER' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
type IncidentSeverity = 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4';

type Tenant = {
  id: string;
  externalId: string;
  name: string;
  country: string;
  status: TenantStatus;
  health: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  billingStatus: 'GOOD' | 'DUE' | 'FAILED';
  onboardingStage: 'NEW' | 'PROVISIONING' | 'DATA_IMPORT' | 'TRAINING' | 'READY' | 'LIVE' | 'BLOCKED';
  planCode: 'starter' | 'growth' | 'enterprise';
  domain: string;
  customDomain: string | null;
  adminEmail: string;
  adminName: string;
  activeStudents: number;
  activeTeachers: number;
  activeParents: number;
  storageUsedGb: number;
  storageLimitGb: number;
  incidentsOpen: number;
  lastLoginAt: string;
  modules: string[];
};

type OnboardingTask = {
  id: string;
  tenantId: string;
  title: string;
  stage: Tenant['onboardingStage'];
  owner: string;
  type: string;
  status: 'PENDING' | 'DONE' | 'BLOCKED';
  blockerCode: string | null;
  dueAt: string;
};

type Plan = {
  id: string;
  code: string;
  name: string;
  status: 'ACTIVE' | 'DRAFT' | 'LEGACY';
  description: string;
  basePrice: number;
  perStudent: number;
  perTeacher: number;
  storageLimitGb: number;
  modules: string[];
};

type Subscription = {
  id: string;
  tenantId: string;
  planCode: string;
  state: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED';
  startedAt: string;
  trialEndsAt: string | null;
  renewalAt: string;
  graceEndsAt: string | null;
};

type Invoice = {
  id: string;
  tenantId: string;
  number: string;
  amount: number;
  status: 'ISSUED' | 'PAID' | 'OVERDUE' | 'FAILED';
  dueAt: string;
  paidAt: string | null;
  dunningStep: number;
  retryCount: number;
  discountPendingApproval: boolean;
};

type BillingApproval = {
  id: string;
  invoiceId: string;
  tenantId: string;
  type: 'DISCOUNT_EXCEPTION' | 'WRITE_OFF';
  requestedBy: string;
  requestedAt: string;
  impactAmount: number;
  note: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decidedAt: string | null;
  decidedBy: string | null;
};

type Payment = {
  id: string;
  invoiceId: string | null;
  tenantId: string;
  gatewayId: string;
  method: 'CARD' | 'ACH' | 'BANK_TRANSFER';
  amount: number;
  state: 'SUCCEEDED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  attemptedAt: string;
  providerRef: string;
  failureReason: string | null;
};

type PaymentGateway = {
  id: string;
  name: string;
  type: string;
  status: 'ACTIVE' | 'DEGRADED' | 'DISABLED';
  primary: boolean;
  settlementDays: number;
  successRate: number;
  monthlyVolume: number;
  methods: Array<'CARD' | 'ACH' | 'BANK_TRANSFER'>;
  supportedRegions: string[];
};

type Coupon = {
  id: string;
  code: string;
  description: string;
  type: 'PERCENT' | 'FLAT';
  discountValue: number;
  maxUses: number | null;
  uses: number;
  expiresAt: string | null;
  status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DISABLED';
  planCodes: string[];
  createdAt: string;
};

type Ticket = {
  id: string;
  tenantId: string;
  category: 'BILLING' | 'ONBOARDING' | 'BUG' | 'FEATURE_REQUEST' | 'URGENT';
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string;
  requesterEmail: string;
  slaTargetAt: string;
  createdAt: string;
};

type Incident = {
  id: string;
  code: string;
  title: string;
  severity: IncidentSeverity;
  status: 'OPEN' | 'MONITORING' | 'RESOLVED';
  commander: string;
  affectedServices: string[];
  tenantIds: string[];
  updatedAt: string;
};

type FeatureFlag = {
  id: string;
  key: string;
  name: string;
  targeting: 'GLOBAL' | 'PLAN' | 'TENANT' | 'PERCENTAGE';
  enabled: boolean;
  rolloutPercent: number;
  planCodes: string[];
  tenantIds: string[];
  scheduledAt: string | null;
  pausedByIncidentId: string | null;
  autoPauseOnIncident: boolean;
};

type AuditEvent = {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  tenantId: string | null;
  reason: string;
  createdAt: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
};

type ConsoleState = {
  tenants: Tenant[];
  onboardingTasks: OnboardingTask[];
  plans: Plan[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  billingApprovals: BillingApproval[];
  payments: Payment[];
  gateways: PaymentGateway[];
  coupons: Coupon[];
  tickets: Ticket[];
  incidents: Incident[];
  featureFlags: FeatureFlag[];
  templates: Array<Record<string, unknown>>;
  addons: Array<Record<string, unknown>>;
  integrations: Array<Record<string, unknown>>;
  integrationLogs: Array<Record<string, unknown>>;
  exportRequests: Array<Record<string, unknown>>;
  deletionRequests: Array<Record<string, unknown>>;
  providerUsers: Array<Record<string, unknown>>;
  providerRoles: Array<Record<string, unknown>>;
  audit: AuditEvent[];
  macros: Array<Record<string, unknown>>;
  kbArticles: Array<Record<string, unknown>>;
  maintenanceActions: Array<Record<string, unknown>>;
};

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const priorityHours: Record<TicketPriority, number> = { URGENT: 1, HIGH: 4, NORMAL: 12, LOW: 24 };
const severityOrder: Record<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

const iso = (offsetMs: number): string => new Date(Date.now() + offsetMs).toISOString();
const titleCase = (value: string): string => value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());

/* Local status → Prisma TenantStatus enum mapping */
const PRISMA_STATUS_MAP: Record<string, string> = { ACTIVE: 'ACTIVE', TRIAL: 'TRIAL', SUSPENDED: 'SUSPENDED', PAYMENT_DUE: 'SUSPENDED', OFFBOARDING: 'CHURNED', ARCHIVED: 'CHURNED' };

function seedState(): ConsoleState {
  const tenants: Tenant[] = [
    { id: 'tenant_northstar', externalId: 'SCH-1001', name: 'Northstar Academy', country: 'United States', status: 'TRIAL', health: 'WARNING', billingStatus: 'DUE', onboardingStage: 'READY', planCode: 'growth', domain: 'northstar.growschools.app', customDomain: 'portal.northstaracademy.edu', adminEmail: 'admin@northstaracademy.edu', adminName: 'Camila Perez', activeStudents: 980, activeTeachers: 88, activeParents: 740, storageUsedGb: 92, storageLimitGb: 100, incidentsOpen: 0, lastLoginAt: iso(-3 * HOUR_MS), modules: ['Admin', 'Teacher', 'Parent', 'Student', 'Transport'] },
    { id: 'tenant_cedar', externalId: 'SCH-1002', name: 'Cedar Valley Public School', country: 'United States', status: 'ACTIVE', health: 'HEALTHY', billingStatus: 'GOOD', onboardingStage: 'LIVE', planCode: 'enterprise', domain: 'cedarvalley.growschools.app', customDomain: null, adminEmail: 'nives@cedarvalley.edu', adminName: 'Nathan Ives', activeStudents: 2810, activeTeachers: 224, activeParents: 2021, storageUsedGb: 461, storageLimitGb: 800, incidentsOpen: 0, lastLoginAt: iso(-40 * 60 * 1000), modules: ['Admin', 'Teacher', 'Parent', 'Student', 'Transport', 'Payroll'] },
    { id: 'tenant_bright', externalId: 'SCH-1003', name: 'Bright Future Prep', country: 'Kenya', status: 'PAYMENT_DUE', health: 'CRITICAL', billingStatus: 'FAILED', onboardingStage: 'LIVE', planCode: 'growth', domain: 'brightfuture.growschools.app', customDomain: null, adminEmail: 'ops@brightfutureprep.sc.ke', adminName: 'Julius Ndegwa', activeStudents: 1210, activeTeachers: 94, activeParents: 801, storageUsedGb: 198, storageLimitGb: 200, incidentsOpen: 1, lastLoginAt: iso(-26 * HOUR_MS), modules: ['Admin', 'Teacher', 'Parent', 'Student'] },
    { id: 'tenant_horizon', externalId: 'SCH-1004', name: 'Horizon STEM Institute', country: 'United States', status: 'SUSPENDED', health: 'CRITICAL', billingStatus: 'FAILED', onboardingStage: 'LIVE', planCode: 'starter', domain: 'horizonstem.growschools.app', customDomain: null, adminEmail: 'principal@horizonstem.org', adminName: 'Priya Shah', activeStudents: 310, activeTeachers: 26, activeParents: 191, storageUsedGb: 44, storageLimitGb: 50, incidentsOpen: 0, lastLoginAt: iso(-11 * DAY_MS), modules: ['Admin', 'Teacher', 'Student'] },
    { id: 'tenant_maple', externalId: 'SCH-1005', name: 'Maple Leaf International School', country: 'Canada', status: 'ACTIVE', health: 'HEALTHY', billingStatus: 'GOOD', onboardingStage: 'LIVE', planCode: 'enterprise', domain: 'mapleleaf.growschools.app', customDomain: 'portal.mapleleafis.ca', adminEmail: 'it@mapleleafis.ca', adminName: 'Olivia Bright', activeStudents: 3381, activeTeachers: 272, activeParents: 2892, storageUsedGb: 611, storageLimitGb: 1000, incidentsOpen: 0, lastLoginAt: iso(-2 * HOUR_MS), modules: ['Admin', 'Teacher', 'Parent', 'Student', 'Hostel', 'Payroll'] },
    { id: 'tenant_desert', externalId: 'SCH-1006', name: 'Desert Bloom School', country: 'Morocco', status: 'ACTIVE', health: 'WARNING', billingStatus: 'GOOD', onboardingStage: 'LIVE', planCode: 'growth', domain: 'desertbloom.growschools.app', customDomain: null, adminEmail: 'admin@desertbloom.ma', adminName: 'Laila Bennani', activeStudents: 1402, activeTeachers: 107, activeParents: 930, storageUsedGb: 242, storageLimitGb: 250, incidentsOpen: 0, lastLoginAt: iso(-8 * HOUR_MS), modules: ['Admin', 'Teacher', 'Parent', 'Student', 'Transport'] },
    { id: 'tenant_pacific', externalId: 'SCH-1007', name: 'Pacific Crest Academy', country: 'Philippines', status: 'TRIAL', health: 'WARNING', billingStatus: 'DUE', onboardingStage: 'TRAINING', planCode: 'starter', domain: 'pacificcrest.growschools.app', customDomain: null, adminEmail: 'miguel@pacificcrest.edu.ph', adminName: 'Miguel Santos', activeStudents: 180, activeTeachers: 16, activeParents: 141, storageUsedGb: 12, storageLimitGb: 50, incidentsOpen: 0, lastLoginAt: iso(-7 * HOUR_MS), modules: ['Admin', 'Teacher', 'Parent', 'Student'] },
    { id: 'tenant_river', externalId: 'SCH-1008', name: 'Riverstone College', country: 'United Kingdom', status: 'ACTIVE', health: 'HEALTHY', billingStatus: 'GOOD', onboardingStage: 'LIVE', planCode: 'enterprise', domain: 'riverstone.growschools.app', customDomain: 'platform.riverstonecollege.ac.uk', adminEmail: 'aiden@riverstonecollege.ac.uk', adminName: 'Aiden Walsh', activeStudents: 2950, activeTeachers: 248, activeParents: 2040, storageUsedGb: 512, storageLimitGb: 900, incidentsOpen: 0, lastLoginAt: iso(-1 * HOUR_MS), modules: ['Admin', 'Teacher', 'Parent', 'Student', 'Transport'] },
    { id: 'tenant_atlas', externalId: 'SCH-1009', name: 'Atlas Learning Hub', country: 'UAE', status: 'OFFBOARDING', health: 'WARNING', billingStatus: 'DUE', onboardingStage: 'LIVE', planCode: 'growth', domain: 'atlashub.growschools.app', customDomain: null, adminEmail: 'yara@atlashub.ae', adminName: 'Yara Al Farsi', activeStudents: 1015, activeTeachers: 71, activeParents: 740, storageUsedGb: 208, storageLimitGb: 250, incidentsOpen: 0, lastLoginAt: iso(-3 * DAY_MS), modules: ['Admin', 'Teacher', 'Parent', 'Student'] },
    { id: 'tenant_greenfield', externalId: 'SCH-1010', name: 'Greenfield Academy', country: 'United States', status: 'ACTIVE', health: 'HEALTHY', billingStatus: 'GOOD', onboardingStage: 'LIVE', planCode: 'enterprise', domain: 'greenfield.growschools.app', customDomain: 'greenfield.edu', adminEmail: 'admin@greenfield.edu', adminName: 'Alice Admin', activeStudents: 1200, activeTeachers: 98, activeParents: 850, storageUsedGb: 355, storageLimitGb: 800, incidentsOpen: 0, lastLoginAt: iso(-1 * HOUR_MS), modules: ['Admin', 'Teacher', 'Parent', 'Student', 'Library'] },
    { id: 'tenant_sunrise', externalId: 'SCH-1011', name: 'Sunrise Montessori', country: 'India', status: 'TRIAL', health: 'WARNING', billingStatus: 'DUE', onboardingStage: 'BLOCKED', planCode: 'starter', domain: 'sunrisemontessori.growschools.app', customDomain: null, adminEmail: 'principal@sunrisemontessori.in', adminName: 'Anika Rao', activeStudents: 90, activeTeachers: 11, activeParents: 70, storageUsedGb: 8, storageLimitGb: 50, incidentsOpen: 0, lastLoginAt: iso(-1 * DAY_MS), modules: ['Admin', 'Teacher', 'Parent', 'Student'] },
    { id: 'tenant_beacon', externalId: 'SCH-1012', name: 'Beacon Hill School', country: 'Nigeria', status: 'TRIAL', health: 'WARNING', billingStatus: 'DUE', onboardingStage: 'PROVISIONING', planCode: 'growth', domain: 'beaconhill.growschools.app', customDomain: null, adminEmail: 'ops@beaconhill.sch.ng', adminName: 'Kunle Adebayo', activeStudents: 0, activeTeachers: 0, activeParents: 0, storageUsedGb: 4, storageLimitGb: 100, incidentsOpen: 0, lastLoginAt: iso(-2 * DAY_MS), modules: ['Admin', 'Teacher', 'Parent', 'Student'] },
    { id: 'tenant_summit', externalId: 'SCH-1013', name: 'Summit Charter School', country: 'United States', status: 'ACTIVE', health: 'HEALTHY', billingStatus: 'GOOD', onboardingStage: 'LIVE', planCode: 'growth', domain: 'summitcharter.growschools.app', customDomain: null, adminEmail: 'it@summitcharter.edu', adminName: 'Harper Cole', activeStudents: 801, activeTeachers: 55, activeParents: 610, storageUsedGb: 141, storageLimitGb: 200, incidentsOpen: 0, lastLoginAt: iso(-50 * 60 * 1000), modules: ['Admin', 'Teacher', 'Parent', 'Student'] },
    { id: 'tenant_lakeside', externalId: 'SCH-1014', name: 'Lakeside Prep (Archived)', country: 'United States', status: 'ARCHIVED', health: 'HEALTHY', billingStatus: 'GOOD', onboardingStage: 'LIVE', planCode: 'starter', domain: 'lakesideprep.growschools.app', customDomain: null, adminEmail: 'archive@lakesideprep.org', adminName: 'Archive Admin', activeStudents: 0, activeTeachers: 0, activeParents: 0, storageUsedGb: 21, storageLimitGb: 50, incidentsOpen: 0, lastLoginAt: iso(-90 * DAY_MS), modules: [] },
  ];

  const plans: Plan[] = [
    { id: 'plan_starter', code: 'starter', name: 'Starter', status: 'ACTIVE', description: 'Foundational tenant package for small schools piloting the platform.', basePrice: 299, perStudent: 0.8, perTeacher: 2.0, storageLimitGb: 50, modules: ['Admin', 'Teacher', 'Parent', 'Student'] },
    { id: 'plan_growth', code: 'growth', name: 'Growth', status: 'ACTIVE', description: 'Scaled operations plan with transport, library, and automation included.', basePrice: 799, perStudent: 1.2, perTeacher: 2.8, storageLimitGb: 200, modules: ['Admin', 'Teacher', 'Parent', 'Student', 'Transport', 'Library'] },
    { id: 'plan_enterprise', code: 'enterprise', name: 'Enterprise', status: 'ACTIVE', description: 'Enterprise-wide deployment with payroll, governance, and premium services.', basePrice: 1899, perStudent: 1.8, perTeacher: 3.6, storageLimitGb: 800, modules: ['Admin', 'Teacher', 'Parent', 'Student', 'Transport', 'Library', 'Payroll'] },
  ];

  const trialEndsByTenant: Record<string, number | null> = { tenant_northstar: 5, tenant_pacific: 3, tenant_sunrise: 7, tenant_beacon: 1 };
  const subscriptions: Subscription[] = tenants.map((tenant, idx) => ({
    id: `sub_${idx + 1}`,
    tenantId: tenant.id,
    planCode: tenant.planCode,
    state: tenant.status === 'SUSPENDED' ? 'SUSPENDED' : tenant.status === 'PAYMENT_DUE' ? 'PAST_DUE' : tenant.status === 'ARCHIVED' ? 'CANCELLED' : tenant.status === 'TRIAL' ? 'TRIAL' : 'ACTIVE',
    startedAt: iso(-(45 + idx * 3) * DAY_MS),
    trialEndsAt: trialEndsByTenant[tenant.id] !== undefined && trialEndsByTenant[tenant.id] !== null ? iso((trialEndsByTenant[tenant.id] as number) * DAY_MS) : null,
    renewalAt: iso((10 + idx) * DAY_MS),
    graceEndsAt: tenant.status === 'PAYMENT_DUE' ? iso(2 * DAY_MS) : null,
  }));

  const invoices: Invoice[] = [
    { id: 'inv_1001', tenantId: 'tenant_bright', number: 'INV-2026-1001', amount: 1780, status: 'FAILED', dueAt: iso(-5 * DAY_MS), paidAt: null, dunningStep: 2, retryCount: 2, discountPendingApproval: false },
    { id: 'inv_1002', tenantId: 'tenant_atlas', number: 'INV-2026-1002', amount: 990, status: 'OVERDUE', dueAt: iso(-1 * DAY_MS), paidAt: null, dunningStep: 1, retryCount: 1, discountPendingApproval: true },
    { id: 'inv_1003', tenantId: 'tenant_northstar', number: 'INV-2026-1003', amount: 1210, status: 'ISSUED', dueAt: iso(5 * DAY_MS), paidAt: null, dunningStep: 0, retryCount: 0, discountPendingApproval: false },
    { id: 'inv_1004', tenantId: 'tenant_cedar', number: 'INV-2026-1004', amount: 5900, status: 'PAID', dueAt: iso(-2 * DAY_MS), paidAt: iso(-4 * DAY_MS), dunningStep: 0, retryCount: 0, discountPendingApproval: false },
    { id: 'inv_1005', tenantId: 'tenant_horizon', number: 'INV-2026-1005', amount: 399, status: 'FAILED', dueAt: iso(-20 * DAY_MS), paidAt: null, dunningStep: 4, retryCount: 4, discountPendingApproval: false },
    { id: 'inv_1006', tenantId: 'tenant_beacon', number: 'INV-2026-1006', amount: 850, status: 'OVERDUE', dueAt: iso(-1 * DAY_MS), paidAt: null, dunningStep: 1, retryCount: 1, discountPendingApproval: false },
  ];

  const billingApprovals: BillingApproval[] = [
    { id: 'approval_1', invoiceId: 'inv_1002', tenantId: 'tenant_atlas', type: 'DISCOUNT_EXCEPTION', requestedBy: 'yara@atlashub.ae', requestedAt: iso(-6 * HOUR_MS), impactAmount: 120, note: 'Requested retention discount while tenant is offboarding two campuses.', status: 'PENDING', decidedAt: null, decidedBy: null },
    { id: 'approval_2', invoiceId: 'inv_1004', tenantId: 'tenant_cedar', type: 'WRITE_OFF', requestedBy: 'billing@provider.local', requestedAt: iso(-9 * DAY_MS), impactAmount: 80, note: 'Goodwill write-off after duplicated notification charges.', status: 'APPROVED', decidedAt: iso(-8 * DAY_MS), decidedBy: 'provider@growyourneed.dev' },
    { id: 'approval_3', invoiceId: 'inv_1001', tenantId: 'tenant_bright', type: 'DISCOUNT_EXCEPTION', requestedBy: 'ops@brightfutureprep.sc.ke', requestedAt: iso(-15 * DAY_MS), impactAmount: 150, note: 'Temporary bank migration support request.', status: 'REJECTED', decidedAt: iso(-14 * DAY_MS), decidedBy: 'billing@provider.local' },
  ];

  const gateways: PaymentGateway[] = [
    { id: 'gw_stripe', name: 'Stripe Global', type: 'CARD', status: 'ACTIVE', primary: true, settlementDays: 2, successRate: 98.7, monthlyVolume: 142300, methods: ['CARD', 'ACH'], supportedRegions: ['US', 'CA', 'UK', 'EU'] },
    { id: 'gw_adyen', name: 'Adyen Enterprise', type: 'CARD', status: 'ACTIVE', primary: false, settlementDays: 3, successRate: 97.9, monthlyVolume: 88400, methods: ['CARD', 'BANK_TRANSFER'], supportedRegions: ['US', 'EU', 'UAE'] },
    { id: 'gw_flutterwave', name: 'Flutterwave Africa', type: 'BANK_TRANSFER', status: 'DEGRADED', primary: false, settlementDays: 2, successRate: 93.2, monthlyVolume: 31600, methods: ['CARD', 'BANK_TRANSFER'], supportedRegions: ['NG', 'KE', 'MA'] },
  ];

  const payments: Payment[] = [
    { id: 'pay_1001', invoiceId: 'inv_1004', tenantId: 'tenant_cedar', gatewayId: 'gw_stripe', method: 'CARD', amount: 5900, state: 'SUCCEEDED', attemptedAt: iso(-4 * DAY_MS), providerRef: 'pi_20260301001', failureReason: null },
    { id: 'pay_1002', invoiceId: 'inv_1001', tenantId: 'tenant_bright', gatewayId: 'gw_flutterwave', method: 'CARD', amount: 1780, state: 'FAILED', attemptedAt: iso(-6 * DAY_MS), providerRef: 'pi_20260228017', failureReason: 'Issuer declined recurring charge' },
    { id: 'pay_1003', invoiceId: 'inv_1002', tenantId: 'tenant_atlas', gatewayId: 'gw_adyen', method: 'BANK_TRANSFER', amount: 990, state: 'PENDING', attemptedAt: iso(-20 * HOUR_MS), providerRef: 'trf_20260305008', failureReason: null },
    { id: 'pay_1004', invoiceId: 'inv_1005', tenantId: 'tenant_horizon', gatewayId: 'gw_stripe', method: 'ACH', amount: 399, state: 'FAILED', attemptedAt: iso(-19 * DAY_MS), providerRef: 'ach_20260215003', failureReason: 'Account frozen by issuing bank' },
    { id: 'pay_1005', invoiceId: null, tenantId: 'tenant_maple', gatewayId: 'gw_stripe', method: 'CARD', amount: 2400, state: 'REFUNDED', attemptedAt: iso(-11 * DAY_MS), providerRef: 'rf_20260222002', failureReason: 'Duplicate payment refunded' },
  ];

  const coupons: Coupon[] = [
    { id: 'coupon_1', code: 'SPRING15', description: 'Seasonal acquisition campaign for new Growth tenants.', type: 'PERCENT', discountValue: 15, maxUses: 40, uses: 12, expiresAt: iso(18 * DAY_MS), status: 'ACTIVE', planCodes: ['growth'], createdAt: iso(-10 * DAY_MS) },
    { id: 'coupon_2', code: 'ENTERPRISE500', description: 'Flat onboarding credit for enterprise migrations.', type: 'FLAT', discountValue: 500, maxUses: 10, uses: 3, expiresAt: iso(45 * DAY_MS), status: 'ACTIVE', planCodes: ['enterprise'], createdAt: iso(-22 * DAY_MS) },
    { id: 'coupon_3', code: 'TRIALSAVE', description: 'Retention save offer for at-risk trials.', type: 'PERCENT', discountValue: 20, maxUses: null, uses: 7, expiresAt: null, status: 'ACTIVE', planCodes: ['starter', 'growth'], createdAt: iso(-30 * DAY_MS) },
    { id: 'coupon_4', code: 'WELCOME2025', description: 'Legacy launch promo retained for audit history.', type: 'PERCENT', discountValue: 10, maxUses: 100, uses: 100, expiresAt: iso(-30 * DAY_MS), status: 'EXPIRED', planCodes: ['starter', 'growth', 'enterprise'], createdAt: iso(-420 * DAY_MS) },
  ];

  const onboardingTasks: OnboardingTask[] = [
    { id: 'ob_1', tenantId: 'tenant_beacon', stage: 'PROVISIONING', type: 'DOMAIN_CONFIGURED', title: 'Configure DNS domain', owner: 'ops@provider.local', status: 'BLOCKED', blockerCode: 'DOMAIN_VERIFICATION_PENDING', dueAt: iso(1 * DAY_MS) },
    { id: 'ob_2', tenantId: 'tenant_beacon', stage: 'PROVISIONING', type: 'BRANDING_APPLIED', title: 'Apply branding assets', owner: 'success@provider.local', status: 'PENDING', blockerCode: null, dueAt: iso(2 * DAY_MS) },
    { id: 'ob_3', tenantId: 'tenant_sunrise', stage: 'DATA_IMPORT', type: 'DATA_IMPORT_COMPLETED', title: 'Import base student data', owner: 'dataops@provider.local', status: 'BLOCKED', blockerCode: 'DATA_IMPORT_ERRORS', dueAt: iso(1 * DAY_MS) },
    { id: 'ob_4', tenantId: 'tenant_sunrise', stage: 'TRAINING', type: 'ADMIN_USER_ACTIVATED', title: 'Activate first admin account', owner: 'success@provider.local', status: 'BLOCKED', blockerCode: 'ADMIN_USER_NOT_ACTIVATED', dueAt: iso(2 * DAY_MS) },
    { id: 'ob_5', tenantId: 'tenant_northstar', stage: 'READY', type: 'GO_LIVE_CHECKLIST_SIGNED', title: 'Sign go-live checklist', owner: 'success@provider.local', status: 'PENDING', blockerCode: null, dueAt: iso(2 * DAY_MS) },
  ];

  const tickets: Ticket[] = [
    { id: 'ticket_1', tenantId: 'tenant_bright', category: 'BILLING', subject: 'Card charge failing after bank migration', priority: 'URGENT', status: 'ESCALATED', assignee: 'support@provider.local', requesterEmail: 'ops@brightfutureprep.sc.ke', slaTargetAt: iso(-2 * HOUR_MS), createdAt: iso(-3 * HOUR_MS) },
    { id: 'ticket_2', tenantId: 'tenant_sunrise', category: 'ONBOARDING', subject: 'CSV import fails at guardian mapping', priority: 'HIGH', status: 'IN_PROGRESS', assignee: 'dataops@provider.local', requesterEmail: 'principal@sunrisemontessori.in', slaTargetAt: iso(-2 * HOUR_MS), createdAt: iso(-7 * HOUR_MS) },
    { id: 'ticket_3', tenantId: 'tenant_desert', category: 'BUG', subject: 'Push notification queue delay above 20 minutes', priority: 'HIGH', status: 'IN_PROGRESS', assignee: 'ops@provider.local', requesterEmail: 'admin@desertbloom.ma', slaTargetAt: iso(-6 * HOUR_MS), createdAt: iso(-10 * HOUR_MS) },
    { id: 'ticket_4', tenantId: 'tenant_cedar', category: 'BILLING', subject: 'Request enterprise add-on discount renewal', priority: 'NORMAL', status: 'NEW', assignee: 'billing@provider.local', requesterEmail: 'nives@cedarvalley.edu', slaTargetAt: iso(11 * HOUR_MS), createdAt: iso(-1 * HOUR_MS) },
  ];

  const incidents: Incident[] = [
    { id: 'inc_1', code: 'INC-2026-031', title: 'Notification queue backlog in primary region', severity: 'SEV2', status: 'OPEN', commander: 'ops-commander@provider.local', affectedServices: ['notifications', 'queue-workers'], tenantIds: ['tenant_bright', 'tenant_desert', 'tenant_northstar', 'tenant_beacon'], updatedAt: iso(-20 * 60 * 1000) },
    { id: 'inc_2', code: 'INC-2026-019', title: 'Payments API timeout burst', severity: 'SEV3', status: 'MONITORING', commander: 'billing-ops@provider.local', affectedServices: ['payments'], tenantIds: ['tenant_bright', 'tenant_atlas'], updatedAt: iso(-12 * HOUR_MS) },
  ];

  const featureFlags: FeatureFlag[] = [
    { id: 'flag_1', key: 'attendance-v2', name: 'Attendance V2', targeting: 'GLOBAL', enabled: true, rolloutPercent: 100, planCodes: [], tenantIds: [], scheduledAt: null, pausedByIncidentId: null, autoPauseOnIncident: false },
    { id: 'flag_2', key: 'smart-notifications', name: 'Smart Notification Routing', targeting: 'PERCENTAGE', enabled: true, rolloutPercent: 35, planCodes: [], tenantIds: [], scheduledAt: iso(1 * DAY_MS), pausedByIncidentId: 'inc_1', autoPauseOnIncident: true },
    { id: 'flag_3', key: 'gradebook-v3', name: 'Gradebook V3', targeting: 'PLAN', enabled: true, rolloutPercent: 100, planCodes: ['enterprise'], tenantIds: [], scheduledAt: null, pausedByIncidentId: null, autoPauseOnIncident: false },
  ];

  return {
    tenants,
    onboardingTasks,
    plans,
    subscriptions,
    invoices,
    billingApprovals,
    payments,
    gateways,
    coupons,
    tickets,
    incidents,
    featureFlags,
    templates: [
      { id: 'tpl_1', type: 'SCHOOL_CONFIG', name: 'Small School Launch Kit', version: '1.3.0', status: 'ACTIVE' },
      { id: 'tpl_2', type: 'GRADING', name: 'K12 Percent Grading', version: '2.1.0', status: 'ACTIVE' },
    ],
    addons: [
      { id: 'addon_storage', code: 'addon_storage', name: 'Extra Storage Bundle', pricingType: 'USAGE', price: 49, status: 'ACTIVE' },
      { id: 'addon_sms', code: 'addon_sms', name: 'SMS Bundle Pack', pricingType: 'USAGE', price: 29, status: 'ACTIVE' },
      { id: 'addon_reporting', code: 'addon_reporting', name: 'Advanced Reporting Pack', pricingType: 'FLAT', price: 119, status: 'ACTIVE' },
      { id: 'addon_priority_support', code: 'addon_priority_support', name: 'Priority Support', pricingType: 'FLAT', price: 149, status: 'ACTIVE' },
    ],
    integrations: [
      { id: 'int_1', name: 'Twilio SMS Gateway', category: 'SMS', globalStatus: 'DEGRADED', enabledTenantIds: ['tenant_cedar', 'tenant_desert', 'tenant_northstar'] },
      { id: 'int_2', name: 'Postmark Email', category: 'EMAIL', globalStatus: 'HEALTHY', enabledTenantIds: ['tenant_cedar', 'tenant_maple', 'tenant_river', 'tenant_greenfield'] },
      { id: 'int_3', name: 'Stripe Billing Adapter', category: 'PAYMENTS', globalStatus: 'HEALTHY', enabledTenantIds: ['tenant_cedar', 'tenant_maple', 'tenant_bright'] },
    ],
    integrationLogs: [
      { id: 'ilog_1', integrationId: 'int_1', tenantId: 'tenant_desert', state: 'FAILED', latencyMs: 1200, error: 'Timeout while sending SMS batch', createdAt: iso(-20 * 60 * 1000) },
      { id: 'ilog_2', integrationId: 'int_2', tenantId: 'tenant_maple', state: 'SUCCESS', latencyMs: 180, error: null, createdAt: iso(-15 * 60 * 1000) },
      { id: 'ilog_3', integrationId: 'int_3', tenantId: 'tenant_bright', state: 'FAILED', latencyMs: 840, error: 'Issuer declined transaction', createdAt: iso(-90 * 60 * 1000) },
    ],
    exportRequests: [
      { id: 'exp_1', tenantId: 'tenant_atlas', requestType: 'FULL_EXPORT', state: 'PENDING', requestedBy: 'yara@atlashub.ae', createdAt: iso(-4 * HOUR_MS) },
      { id: 'exp_2', tenantId: 'tenant_horizon', requestType: 'CONFIG_EXPORT', state: 'IN_REVIEW', requestedBy: 'principal@horizonstem.org', createdAt: iso(-2 * DAY_MS) },
    ],
    deletionRequests: [
      { id: 'del_1', tenantId: 'tenant_atlas', mode: 'DELETE', legalBasis: 'GDPR Art.17', state: 'PENDING', requestedBy: 'yara@atlashub.ae', createdAt: iso(-5 * HOUR_MS) },
      { id: 'del_2', tenantId: 'tenant_lakeside', mode: 'ANONYMIZE', legalBasis: 'Contract termination', state: 'APPROVED', requestedBy: 'archive@lakesideprep.org', createdAt: iso(-7 * DAY_MS) },
    ],
    providerUsers: [
      { id: 'pu_1', email: 'provider@growyourneed.dev', displayName: 'Super Admin', roleKey: 'OWNER', status: 'ACTIVE', mfaEnforced: true },
      { id: 'pu_2', email: 'ops@provider.local', displayName: 'Ops Commander', roleKey: 'OPS_ADMIN', status: 'ACTIVE', mfaEnforced: true },
      { id: 'pu_3', email: 'billing@provider.local', displayName: 'Billing Lead', roleKey: 'BILLING_AGENT', status: 'ACTIVE', mfaEnforced: true },
      { id: 'pu_4', email: 'security@provider.local', displayName: 'Security Lead', roleKey: 'SECURITY_ADMIN', status: 'ACTIVE', mfaEnforced: true },
    ],
    providerRoles: [
      { id: 'role_owner', key: 'OWNER', name: 'Provider Owner', permissions: ['*'] },
      { id: 'role_ops', key: 'OPS_ADMIN', name: 'Operations Admin', permissions: ['tenants.manage', 'support.manage', 'incidents.manage', 'releases.manage', 'audit.view'] },
      { id: 'role_billing', key: 'BILLING_AGENT', name: 'Billing Agent', permissions: ['billing.manage', 'audit.view'] },
      { id: 'role_security', key: 'SECURITY_ADMIN', name: 'Security Admin', permissions: ['security.manage', 'audit.view', 'incidents.manage'] },
    ],
    audit: [],
    macros: [
      { id: 'macro_1', name: 'Billing Escalation', category: 'BILLING', template: 'Hi {{name}}, your billing issue has been escalated.', status: 'ACTIVE' },
      { id: 'macro_2', name: 'Welcome Onboarding', category: 'ONBOARDING', template: 'Welcome to GrowYourNeed, {{name}}! Let us help you get started.', status: 'ACTIVE' },
      { id: 'macro_3', name: 'SLA Breach Apology', category: 'SUPPORT', template: 'We apologize for the delayed response, {{name}}. Your case is now prioritized.', status: 'ACTIVE' },
    ],
    kbArticles: [
      { id: 'kb_1', title: 'How to configure SSO', category: 'SECURITY', status: 'PUBLISHED', views: 1240, createdAt: iso(-30 * DAY_MS) },
      { id: 'kb_2', title: 'Setting up transport routes', category: 'OPERATIONS', status: 'PUBLISHED', views: 890, createdAt: iso(-20 * DAY_MS) },
      { id: 'kb_3', title: 'Billing FAQ for tenants', category: 'BILLING', status: 'DRAFT', views: 0, createdAt: iso(-5 * DAY_MS) },
    ],
    maintenanceActions: [
      { id: 'ma_1', tenantId: 'tenant_bright', type: 'SCHEMA_MIGRATION', description: 'Migrate billing tables to v2026.3', status: 'IN_PROGRESS', createdAt: iso(-2 * DAY_MS) },
      { id: 'ma_2', tenantId: 'tenant_sunrise', type: 'DATA_CLEANUP', description: 'Remove duplicate guardian records', status: 'PENDING', createdAt: iso(-1 * DAY_MS) },
    ],
  };
}

let state = seedState();

function getTenant(tenantId: string): Tenant {
  const tenant = state.tenants.find((entry) => entry.id === tenantId);
  if (!tenant) throw new Error('Tenant not found.');
  return tenant;
}

function getPlanByCode(planCode: string): Plan {
  const plan = state.plans.find((entry) => entry.code === planCode);
  if (!plan) throw new Error('Plan not found.');
  return plan;
}

function calculateSubscriptionMonthlyPrice(subscription: Subscription): number {
  const tenant = getTenant(subscription.tenantId);
  const plan = getPlanByCode(subscription.planCode);
  const recurring =
    plan.basePrice +
    tenant.activeStudents * plan.perStudent +
    tenant.activeTeachers * plan.perTeacher;
  return Math.round(recurring);
}

function currency(amount: number): string {
  return `$${Math.round(amount).toLocaleString()}`;
}

function invoiceAgingDays(dueAt: string): number {
  return Math.max(0, Math.ceil((Date.now() - new Date(dueAt).getTime()) / DAY_MS));
}

function requireReason(reason: unknown): string {
  const text = typeof reason === 'string' ? reason.trim() : '';
  if (!text) throw new Error('A reason is required for this action.');
  return text;
}

function logAudit(action: string, targetType: string, targetId: string, tenantId: string | null, actorEmail: string, reason: string, before: Record<string, unknown> | null, after: Record<string, unknown> | null): void {
  state.audit.unshift({
    id: randomUUID(),
    actorEmail,
    action,
    targetType,
    targetId,
    tenantId,
    reason,
    createdAt: new Date().toISOString(),
    before,
    after,
  });
  state.audit = state.audit.slice(0, 5000);
}

function refreshAutomations(): void {
  const severeOpenIncident = state.incidents.some((incident) => incident.status !== 'RESOLVED' && (incident.severity === 'SEV1' || incident.severity === 'SEV2'));
  for (const flag of state.featureFlags) {
    if (!flag.autoPauseOnIncident) continue;
    flag.pausedByIncidentId = severeOpenIncident ? state.incidents.find((incident) => incident.status !== 'RESOLVED')?.id ?? null : null;
  }

  const now = Date.now();
  for (const ticket of state.tickets) {
    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') continue;
    if (new Date(ticket.slaTargetAt).getTime() <= now && ticket.status !== 'ESCALATED') {
      ticket.status = 'ESCALATED';
    }
  }

  for (const subscription of state.subscriptions) {
    if (subscription.state !== 'PAST_DUE' || !subscription.graceEndsAt) continue;
    if (new Date(subscription.graceEndsAt).getTime() > now) continue;
    const tenant = getTenant(subscription.tenantId);
    tenant.status = 'SUSPENDED';
    tenant.billingStatus = 'FAILED';
    tenant.health = 'CRITICAL';
  }

  for (const coupon of state.coupons) {
    if (!coupon.expiresAt || coupon.status === 'DISABLED') continue;
    if (new Date(coupon.expiresAt).getTime() < now) {
      coupon.status = 'EXPIRED';
    }
  }
}

function actionInbox(): Array<Record<string, unknown>> {
  refreshAutomations();
  const now = Date.now();
  const items: Array<Record<string, unknown> & { _severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }> = [];

  for (const subscription of state.subscriptions) {
    if (subscription.state !== 'TRIAL' || !subscription.trialEndsAt) continue;
    const daysLeft = Math.ceil((new Date(subscription.trialEndsAt).getTime() - now) / DAY_MS);
    if (![1, 3, 7].includes(daysLeft)) continue;
    const tenant = getTenant(subscription.tenantId);
    items.push({ id: `trial_${tenant.id}_${daysLeft}`, type: 'TRIAL_ENDING', tenantId: tenant.id, tenantName: tenant.name, title: `Trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`, owner: 'billing@provider.local', status: 'OPEN', slaTargetAt: subscription.trialEndsAt, _severity: daysLeft <= 1 ? 'HIGH' : 'MEDIUM' });
  }

  for (const invoice of state.invoices) {
    if (invoice.status !== 'FAILED' && invoice.status !== 'OVERDUE') continue;
    const tenant = getTenant(invoice.tenantId);
    items.push({ id: `invoice_${invoice.id}`, type: 'BILLING_EXCEPTION', tenantId: tenant.id, tenantName: tenant.name, title: `${invoice.number} is ${invoice.status.toLowerCase()}`, owner: 'billing@provider.local', status: 'OPEN', slaTargetAt: invoice.dueAt, _severity: invoice.status === 'FAILED' ? 'CRITICAL' : 'HIGH' });
  }

  for (const task of state.onboardingTasks) {
    if (task.status !== 'BLOCKED') continue;
    const tenant = getTenant(task.tenantId);
    items.push({ id: `onboarding_${task.id}`, type: 'ONBOARDING_BLOCKER', tenantId: tenant.id, tenantName: tenant.name, title: `${task.title} (${task.blockerCode ?? 'BLOCKED'})`, owner: task.owner, status: 'OPEN', slaTargetAt: task.dueAt, _severity: 'HIGH' });
  }

  for (const ticket of state.tickets) {
    if (ticket.status !== 'ESCALATED') continue;
    const tenant = getTenant(ticket.tenantId);
    items.push({ id: `sla_${ticket.id}`, type: 'SLA_BREACH', tenantId: tenant.id, tenantName: tenant.name, title: ticket.subject, owner: ticket.assignee, status: ticket.status, slaTargetAt: ticket.slaTargetAt, _severity: ticket.priority === 'URGENT' ? 'CRITICAL' : 'HIGH' });
  }

  for (const tenant of state.tenants) {
    if (tenant.storageLimitGb > 0 && tenant.storageUsedGb / tenant.storageLimitGb >= 0.9) {
      items.push({ id: `usage_${tenant.id}`, type: 'USAGE_LIMIT', tenantId: tenant.id, tenantName: tenant.name, title: `Storage at ${Math.round((tenant.storageUsedGb / tenant.storageLimitGb) * 100)}%`, owner: 'ops@provider.local', status: 'OPEN', slaTargetAt: iso(6 * HOUR_MS), _severity: tenant.storageUsedGb >= tenant.storageLimitGb ? 'CRITICAL' : 'HIGH' });
    }
  }

  for (const request of state.exportRequests) {
    if (request.state !== 'PENDING') continue;
    const tenant = getTenant(String(request.tenantId));
    items.push({ id: `export_${request.id}`, type: 'DATA_EXPORT_REQUEST', tenantId: tenant.id, tenantName: tenant.name, title: `Pending ${String(request.requestType).toLowerCase()}`, owner: 'security@provider.local', status: request.state, slaTargetAt: iso(24 * HOUR_MS), _severity: 'MEDIUM' });
  }

  for (const request of state.deletionRequests) {
    if (request.state !== 'PENDING') continue;
    const tenant = getTenant(String(request.tenantId));
    items.push({ id: `delete_${request.id}`, type: 'DATA_DELETION_REQUEST', tenantId: tenant.id, tenantName: tenant.name, title: `Pending ${String(request.mode).toLowerCase()} request`, owner: 'security@provider.local', status: request.state, slaTargetAt: iso(36 * HOUR_MS), _severity: 'HIGH' });
  }

  for (const flag of state.featureFlags) {
    if (!flag.pausedByIncidentId) continue;
    items.push({ id: `flag_${flag.id}`, type: 'ROLLOUT_PAUSED', tenantId: null, tenantName: 'Global', title: `${flag.name} rollout paused by incident`, owner: 'release@provider.local', status: 'PAUSED', slaTargetAt: iso(8 * HOUR_MS), _severity: 'HIGH' });
  }

  return items
    .sort((a, b) => {
      const bySeverity = severityOrder[b._severity] - severityOrder[a._severity];
      if (bySeverity !== 0) return bySeverity;
      return new Date(String(a.slaTargetAt)).getTime() - new Date(String(b.slaTargetAt)).getTime();
    })
    .map(({ _severity, ...rest }) => ({ ...rest, severity: _severity }));
}

function billingPlansView(): Array<Record<string, unknown>> {
  return state.plans.map((plan) => {
    const planSubscriptions = state.subscriptions.filter((subscription) => subscription.planCode === plan.code && subscription.state !== 'CANCELLED');
    const activeTenants = planSubscriptions.filter((subscription) => subscription.state === 'ACTIVE' || subscription.state === 'TRIAL').length;
    const mrr = planSubscriptions.reduce((sum, subscription) => sum + calculateSubscriptionMonthlyPrice(subscription), 0);

    return {
      ...plan,
      monthlyPrice: plan.basePrice,
      subscriberCount: planSubscriptions.length,
      activeTenantCount: activeTenants,
      mrr,
      seats: planSubscriptions.reduce((sum, subscription) => {
        const tenant = getTenant(subscription.tenantId);
        return sum + tenant.activeStudents + tenant.activeTeachers;
      }, 0),
    };
  });
}

function billingSubscriptionsView(): Array<Record<string, unknown>> {
  return state.subscriptions.map((subscription) => {
    const tenant = getTenant(subscription.tenantId);
    const plan = getPlanByCode(subscription.planCode);
    return {
      ...subscription,
      tenantName: tenant.name,
      tenantStatus: tenant.status,
      tenantHealth: tenant.health,
      adminEmail: tenant.adminEmail,
      planName: plan.name,
      billingCycle: 'MONTHLY',
      seats: tenant.activeStudents + tenant.activeTeachers,
      monthlyPrice: calculateSubscriptionMonthlyPrice(subscription),
      collectionState:
        subscription.state === 'PAST_DUE'
          ? 'AT_RISK'
          : subscription.state === 'SUSPENDED'
            ? 'SUSPENDED'
            : subscription.state === 'TRIAL'
              ? 'TRIAL'
              : 'HEALTHY',
    };
  });
}

function billingInvoicesView(): Array<Record<string, unknown>> {
  return state.invoices.map((invoice) => {
    const tenant = getTenant(invoice.tenantId);
    return {
      ...invoice,
      tenantName: tenant.name,
      planCode: tenant.planCode,
      billingStatus: tenant.billingStatus,
      currency: 'USD',
      agingDays: invoice.status === 'PAID' ? 0 : invoiceAgingDays(invoice.dueAt),
      outstandingBalance: invoice.status === 'PAID' ? 0 : invoice.amount,
      risk:
        invoice.status === 'FAILED'
          ? 'CRITICAL'
          : invoice.status === 'OVERDUE'
            ? 'HIGH'
            : invoice.discountPendingApproval
              ? 'MEDIUM'
              : 'LOW',
    };
  });
}

function billingApprovalsView(): Array<Record<string, unknown>> {
  return state.billingApprovals.map((approval) => {
    const tenant = getTenant(approval.tenantId);
    const invoice = state.invoices.find((entry) => entry.id === approval.invoiceId);
    return {
      ...approval,
      tenantName: tenant.name,
      invoiceNumber: invoice?.number ?? 'Unknown invoice',
      invoiceAmount: invoice?.amount ?? 0,
    };
  });
}

function billingPaymentsView(): Array<Record<string, unknown>> {
  return state.payments.map((payment) => {
    const tenant = getTenant(payment.tenantId);
    const gateway = state.gateways.find((entry) => entry.id === payment.gatewayId);
    return {
      ...payment,
      tenantName: tenant.name,
      gatewayName: gateway?.name ?? payment.gatewayId,
    };
  });
}

function billingGatewaysView(): Array<Record<string, unknown>> {
  return state.gateways.map((gateway) => ({
    ...gateway,
    monthlyVolume: currency(gateway.monthlyVolume),
  }));
}

function billingCouponsView(): Array<Record<string, unknown>> {
  return state.coupons.map((coupon) => ({
    ...coupon,
    discount: coupon.type === 'PERCENT' ? `${coupon.discountValue}%` : currency(coupon.discountValue),
    expires: coupon.expiresAt,
    revenueProtected: coupon.uses * coupon.discountValue * (coupon.type === 'PERCENT' ? 10 : 1),
  }));
}

function billingAnalytics(): Record<string, unknown> {
  const subscriptions = billingSubscriptionsView();
  const invoices = billingInvoicesView();
  const payments = billingPaymentsView();
  const coupons = billingCouponsView();
  const collectedThisMonth = payments
    .filter((payment) => String(payment.state) === 'SUCCEEDED' && new Date(String(payment.attemptedAt)).getUTCMonth() === new Date().getUTCMonth())
    .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const overdueAmount = invoices
    .filter((invoice) => String(invoice.status) === 'OVERDUE' || String(invoice.status) === 'FAILED')
    .reduce((sum, invoice) => sum + Number(invoice.amount ?? 0), 0);
  const totalMrr = subscriptions
    .filter((subscription) => String(subscription.state) !== 'CANCELLED')
    .reduce((sum, subscription) => sum + Number(subscription.monthlyPrice ?? 0), 0);

  const monthlyRevenue = Array.from({ length: 6 }).map((_, idx) => {
    const monthDate = new Date();
    monthDate.setUTCDate(1);
    monthDate.setUTCMonth(monthDate.getUTCMonth() - (5 - idx));
    const monthSeed = idx + 1;
    const billed = Math.round(totalMrr * (0.78 + monthSeed * 0.04));
    const collected = Math.round(billed * (0.89 + monthSeed * 0.01));
    return {
      month: monthDate.toISOString().slice(0, 7),
      label: monthDate.toLocaleString('en-US', { month: 'short' }),
      billed,
      collected,
    };
  });

  return {
    summary: {
      mrr: totalMrr,
      arr: totalMrr * 12,
      collectedThisMonth,
      overdueAmount,
      arpt: subscriptions.length > 0 ? Math.round(totalMrr / subscriptions.length) : 0,
      atRiskTenants: subscriptions.filter((subscription) => String(subscription.collectionState) === 'AT_RISK' || String(subscription.collectionState) === 'SUSPENDED').length,
      couponDiscountThisMonth: coupons.filter((coupon) => String(coupon.status) === 'ACTIVE').reduce((sum, coupon) => sum + Number(coupon.revenueProtected ?? 0), 0),
    },
    monthlyRevenue,
    revenueByPlan: billingPlansView().map((plan) => ({
      planCode: plan.code,
      planName: plan.name,
      tenants: plan.activeTenantCount,
      mrr: plan.mrr,
      billed: Math.round(Number(plan.mrr) * 1.12),
    })),
    dunningByStep: [1, 2, 3, 4, 5].map((step) => ({
      step,
      count: state.invoices.filter((invoice) => invoice.dunningStep === step).length,
      amount: state.invoices.filter((invoice) => invoice.dunningStep === step).reduce((sum, invoice) => sum + invoice.amount, 0),
    })),
    paymentMix: ['CARD', 'ACH', 'BANK_TRANSFER'].map((method) => ({
      method,
      count: state.payments.filter((payment) => payment.method === method).length,
      volume: state.payments.filter((payment) => payment.method === method && payment.state === 'SUCCEEDED').reduce((sum, payment) => sum + payment.amount, 0),
    })),
    regionRevenue: [...new Set(state.tenants.map((tenant) => tenant.country))].map((country) => {
      const tenantIds = state.tenants.filter((tenant) => tenant.country === country).map((tenant) => tenant.id);
      const billed = state.invoices.filter((invoice) => tenantIds.includes(invoice.tenantId)).reduce((sum, invoice) => sum + invoice.amount, 0);
      return {
        country,
        tenants: tenantIds.length,
        billed,
      };
    }).sort((a, b) => b.billed - a.billed),
  };
}

export const providerConsoleService = {
  async getHome(): Promise<Record<string, unknown>> {
    try {
      const [tenantCount, activeTenants, trialTenants, invoices, recentTenants] = await Promise.all([
        prisma.tenant.count(),
        prisma.tenant.count({ where: { status: 'ACTIVE' } }),
        prisma.tenant.count({ where: { status: 'TRIAL' } }),
        prisma.platformInvoice.findMany({ where: { status: { in: ['PENDING', 'OVERDUE'] } }, take: 20, orderBy: { dueDate: 'asc' } }),
        prisma.tenant.findMany({ where: { status: { not: 'CHURNED' } }, orderBy: { updatedAt: 'desc' }, take: 20 }),
      ]);
      return {
        actionInbox: actionInbox(),
        tenantHealthWatchlist: recentTenants.map((t) => ({
          tenantId: t.id,
          tenantName: t.name,
          status: t.status === 'ACTIVE' ? 'HEALTHY' : t.status === 'TRIAL' ? 'WARNING' : 'CRITICAL',
          incidentsOpen: 0,
          billingStatus: t.status === 'SUSPENDED' ? 'FAILED' : 'GOOD',
          usagePct: Math.min(Math.round((t.userCount / Math.max(1, t.userCount + 50)) * 100), 100),
          lastActivityAt: t.updatedAt.toISOString(),
        })),
        onboardingPipeline: [
          { stage: 'TRIAL', label: 'Trial', count: trialTenants },
          { stage: 'ACTIVE', label: 'Active', count: activeTenants },
          { stage: 'TOTAL', label: 'Total', count: tenantCount },
        ],
        billingExceptions: invoices.map((inv) => ({
          id: inv.id,
          tenantId: inv.tenantId,
          amount: inv.amount,
          status: inv.status,
          dueAt: inv.dueDate.toISOString(),
        })),
        systemHealth: {
          uptimePct: 99.96,
          queueBacklog: 0,
          activeIncidents: state.incidents.filter((incident) => incident.status !== 'RESOLVED').length,
          emailDelivery: 'healthy',
          smsDelivery: 'healthy',
        },
      };
    } catch (err) {
      logger.warn("provider-console: DB query failed, using mock data", { error: String(err) });
      // Fallback to mock data if database is unavailable
      return {
        actionInbox: actionInbox(),
        tenantHealthWatchlist: state.tenants
          .filter((tenant) => tenant.status !== 'ARCHIVED')
          .map((tenant) => ({
            tenantId: tenant.id,
            tenantName: tenant.name,
            status: tenant.health,
            incidentsOpen: tenant.incidentsOpen,
            billingStatus: tenant.billingStatus,
            usagePct: Math.round((tenant.storageUsedGb / tenant.storageLimitGb) * 100),
            lastActivityAt: tenant.lastLoginAt,
          })),
        onboardingPipeline: ['NEW', 'PROVISIONING', 'DATA_IMPORT', 'TRAINING', 'READY', 'LIVE', 'BLOCKED'].map((stage) => ({
          stage,
          label: titleCase(stage),
          count: state.tenants.filter((tenant) => tenant.onboardingStage === stage).length,
        })),
        billingExceptions: state.invoices.filter((invoice) => invoice.status === 'FAILED' || invoice.status === 'OVERDUE' || invoice.discountPendingApproval),
        systemHealth: {
          uptimePct: 99.96,
          queueBacklog: state.tickets.filter((ticket) => ticket.status === 'ESCALATED').length * 8,
          activeIncidents: state.incidents.filter((incident) => incident.status !== 'RESOLVED').length,
          emailDelivery: 'healthy',
          smsDelivery: 'degraded',
        },
      };
    }
  },

  getReferenceData(): Record<string, unknown> {
    return {
      statuses: ['TRIAL', 'ACTIVE', 'PAYMENT_DUE', 'SUSPENDED', 'OFFBOARDING', 'ARCHIVED'],
      onboardingStages: ['NEW', 'PROVISIONING', 'DATA_IMPORT', 'TRAINING', 'READY', 'LIVE', 'BLOCKED'],
      ticketPriorities: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
      ticketStatuses: ['NEW', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'ESCALATED', 'RESOLVED', 'CLOSED'],
      incidentSeverities: ['SEV1', 'SEV2', 'SEV3', 'SEV4'],
      countries: [...new Set(state.tenants.map((tenant) => tenant.country))].sort(),
    };
  },

  search(query: string): Array<Record<string, string>> {
    const text = query.trim().toLowerCase();
    if (!text) return [];
    return state.tenants
      .filter((tenant) => tenant.name.toLowerCase().includes(text) || tenant.domain.toLowerCase().includes(text) || tenant.externalId.toLowerCase().includes(text) || tenant.adminEmail.toLowerCase().includes(text))
      .slice(0, 25)
      .map((tenant) => ({ id: tenant.id, externalId: tenant.externalId, name: tenant.name, domain: tenant.domain, adminEmail: tenant.adminEmail }));
  },

  async listTenants(filters: { country?: string; status?: TenantStatus; stage?: Tenant['onboardingStage']; search?: string }): Promise<Tenant[]> {
    try {
      const where: Record<string, unknown> = {};
      if (filters.status && PRISMA_STATUS_MAP[filters.status]) where.status = PRISMA_STATUS_MAP[filters.status];
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ];
      }
      const dbTenants = await prisma.tenant.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: 100,
        include: { school: { select: { id: true, name: true } } },
      });
      return dbTenants.map((t) => ({
        id: t.id,
        externalId: t.id.slice(0, 8).toUpperCase(),
        name: t.name,
        country: '',
        status: t.status as TenantStatus,
        health: t.status === 'ACTIVE' ? 'HEALTHY' as const : t.status === 'TRIAL' ? 'WARNING' as const : 'CRITICAL' as const,
        billingStatus: t.status === 'SUSPENDED' ? 'FAILED' as const : 'GOOD' as const,
        onboardingStage: t.status === 'ACTIVE' ? 'LIVE' as const : t.status === 'TRIAL' ? 'READY' as const : 'NEW' as const,
        planCode: (t.plan?.toLowerCase() ?? 'starter') as Tenant['planCode'],
        domain: `${t.name.toLowerCase().replace(/\s+/g, '')}.growschools.app`,
        customDomain: null,
        adminEmail: t.email,
        adminName: t.name,
        activeStudents: t.userCount,
        activeTeachers: 0,
        activeParents: 0,
        storageUsedGb: 0,
        storageLimitGb: 100,
        incidentsOpen: 0,
        lastLoginAt: t.updatedAt.toISOString(),
        modules: ['Admin', 'Teacher', 'Parent', 'Student'],
      }));
    } catch (err) {
      logger.warn("provider-console: DB query failed, using mock data", { error: String(err) });
      const text = filters.search?.trim().toLowerCase() ?? '';
      return state.tenants.filter((tenant) => {
        if (filters.country && tenant.country !== filters.country) return false;
        if (filters.status && tenant.status !== filters.status) return false;
        if (filters.stage && tenant.onboardingStage !== filters.stage) return false;
        if (!text) return true;
        return tenant.name.toLowerCase().includes(text) || tenant.domain.toLowerCase().includes(text) || tenant.externalId.toLowerCase().includes(text) || tenant.adminEmail.toLowerCase().includes(text);
      });
    }
  },

  async getTenantDetail(tenantId: string): Promise<Record<string, unknown>> {
    try {
      const [dbTenant, dbInvoices] = await Promise.all([
        prisma.tenant.findUnique({
          where: { id: tenantId },
          include: { school: { select: { id: true, name: true } }, invoices: { orderBy: { createdAt: 'desc' }, take: 20 } },
        }),
        prisma.platformInvoice.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 20 }),
      ]);
      if (dbTenant) {
        return {
          tenant: {
            id: dbTenant.id,
            name: dbTenant.name,
            email: dbTenant.email,
            plan: dbTenant.plan,
            status: dbTenant.status,
            mrr: dbTenant.mrr,
            userCount: dbTenant.userCount,
            school: dbTenant.school,
          },
          subscription: null,
          invoices: dbInvoices.map((inv) => ({
            id: inv.id,
            amount: inv.amount,
            status: inv.status,
            dueAt: inv.dueDate.toISOString(),
            paidAt: inv.paidAt?.toISOString() ?? null,
          })),
          onboardingTasks: state.onboardingTasks.filter((task) => task.tenantId === tenantId),
          supportTickets: state.tickets.filter((ticket) => ticket.tenantId === tenantId),
          incidents: state.incidents.filter((incident) => incident.tenantIds.includes(tenantId)),
          audit: state.audit.filter((entry) => entry.tenantId === tenantId).slice(0, 100),
        };
      }
    } catch (err) {
      logger.warn("provider-console: DB query failed, using mock data", { error: String(err) });
      // Fall through to mock data
    }
    const tenant = getTenant(tenantId);
    return {
      tenant,
      subscription: state.subscriptions.find((subscription) => subscription.tenantId === tenantId) ?? null,
      invoices: state.invoices.filter((invoice) => invoice.tenantId === tenantId),
      onboardingTasks: state.onboardingTasks.filter((task) => task.tenantId === tenantId),
      supportTickets: state.tickets.filter((ticket) => ticket.tenantId === tenantId),
      incidents: state.incidents.filter((incident) => incident.tenantIds.includes(tenantId)),
      audit: state.audit.filter((entry) => entry.tenantId === tenantId).slice(0, 100),
    };
  },

  async getBillingOverview(): Promise<Record<string, unknown>> {
    try {
      const [plans, invoices, gateways] = await Promise.all([
        prisma.platformPlan.findMany({ orderBy: { price: 'asc' } }),
        prisma.platformInvoice.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { tenant: { select: { id: true, name: true } } } }),
        prisma.paymentGateway.findMany(),
      ]);
      if (plans.length > 0 || invoices.length > 0) {
        return {
          plans: plans.map((p) => ({ id: p.id, name: p.name, price: p.price, maxUsers: p.maxUsers, features: p.features, isActive: p.isActive })),
          invoices: invoices.map((inv) => ({
            id: inv.id,
            tenantId: inv.tenantId,
            tenantName: inv.tenant?.name ?? 'Unknown',
            amount: inv.amount,
            status: inv.status,
            dueAt: inv.dueDate.toISOString(),
            paidAt: inv.paidAt?.toISOString() ?? null,
          })),
          gateways: gateways.map((g) => ({ id: g.id, name: g.name, status: g.status, transactions: g.transactions, volume: g.volume })),
          subscriptions: billingSubscriptionsView(),
          approvals: billingApprovalsView(),
          payments: billingPaymentsView(),
          coupons: billingCouponsView(),
          analytics: billingAnalytics(),
        };
      }
    } catch (err) {
      logger.warn("provider-console: DB query failed, using mock data", { error: String(err) });
      // Fall through to mock data
    }
    refreshAutomations();
    return {
      plans: billingPlansView(),
      subscriptions: billingSubscriptionsView(),
      invoices: billingInvoicesView(),
      approvals: billingApprovalsView(),
      payments: billingPaymentsView(),
      gateways: billingGatewaysView(),
      coupons: billingCouponsView(),
      analytics: billingAnalytics(),
    };
  },

  listModuleData(): Record<string, unknown> {
    refreshAutomations();
    return {
      plans: state.plans,
      subscriptions: state.subscriptions,
      invoices: state.invoices,
      billingApprovals: state.billingApprovals,
      payments: state.payments,
      gateways: state.gateways,
      coupons: state.coupons,
      tickets: state.tickets,
      incidents: state.incidents,
      featureFlags: state.featureFlags,
      onboardingTasks: state.onboardingTasks,
      templates: state.templates,
      addons: state.addons,
      integrations: state.integrations,
      integrationLogs: state.integrationLogs,
      exportRequests: state.exportRequests,
      deletionRequests: state.deletionRequests,
      providerUsers: state.providerUsers,
      providerRoles: state.providerRoles,
      audit: state.audit,
    };
  },

  updateTenantStatus(input: { tenantId: string; nextStatus: TenantStatus; actorEmail: string; reason: string }): Tenant {
    const tenant = getTenant(input.tenantId);
    const reason = requireReason(input.reason);
    const before = { status: tenant.status };
    tenant.status = input.nextStatus;
    tenant.billingStatus = input.nextStatus === 'SUSPENDED' ? 'FAILED' : tenant.billingStatus;
    tenant.health = input.nextStatus === 'SUSPENDED' ? 'CRITICAL' : tenant.health;
    logAudit('tenant.status.update', 'Tenant', tenant.id, tenant.id, input.actorEmail, reason, before, { status: tenant.status });
    return tenant;
  },

  updateOnboardingTask(input: { taskId: string; status: OnboardingTask['status']; blockerCode?: string | null; actorEmail: string; reason: string }): OnboardingTask {
    const task = state.onboardingTasks.find((entry) => entry.id === input.taskId);
    if (!task) throw new Error('Onboarding task not found.');
    const reason = requireReason(input.reason);
    const before = { status: task.status, blockerCode: task.blockerCode };
    task.status = input.status;
    task.blockerCode = input.blockerCode ?? null;
    if (task.status === 'BLOCKED') getTenant(task.tenantId).onboardingStage = 'BLOCKED';
    logAudit('onboarding.task.update', 'OnboardingTask', task.id, task.tenantId, input.actorEmail, reason, before, { status: task.status, blockerCode: task.blockerCode });
    return task;
  },

  retryInvoice(input: { invoiceId: string; actorEmail: string; reason: string }): Invoice {
    const invoice = state.invoices.find((entry) => entry.id === input.invoiceId);
    if (!invoice) throw new Error('Invoice not found.');
    const reason = requireReason(input.reason);
    const before = { status: invoice.status, dunningStep: invoice.dunningStep, retryCount: invoice.retryCount };
    invoice.retryCount += 1;
    const succeeds = invoice.retryCount % 2 === 0;
    invoice.status = succeeds ? 'PAID' : 'FAILED';
    invoice.dunningStep = succeeds ? invoice.dunningStep : invoice.dunningStep + 1;
    invoice.paidAt = succeeds ? new Date().toISOString() : null;
    const tenant = getTenant(invoice.tenantId);
    tenant.billingStatus = succeeds ? 'GOOD' : 'FAILED';
    tenant.status = succeeds ? (tenant.status === 'SUSPENDED' ? 'ACTIVE' : tenant.status) : 'PAYMENT_DUE';
    state.payments.unshift({
      id: randomUUID(),
      invoiceId: invoice.id,
      tenantId: invoice.tenantId,
      gatewayId: state.gateways.find((gateway) => gateway.primary)?.id ?? state.gateways[0]?.id ?? 'gw_unknown',
      method: 'CARD',
      amount: invoice.amount,
      state: succeeds ? 'SUCCEEDED' : 'FAILED',
      attemptedAt: new Date().toISOString(),
      providerRef: `retry_${invoice.number}_${invoice.retryCount}`,
      failureReason: succeeds ? null : 'Issuer declined retry attempt',
    });
    logAudit('billing.invoice.retry', 'Invoice', invoice.id, invoice.tenantId, input.actorEmail, reason, before, { status: invoice.status, dunningStep: invoice.dunningStep, retryCount: invoice.retryCount });
    return invoice;
  },

  createPlan(input: {
    name: string;
    code: string;
    description?: string;
    basePrice: number;
    perStudent: number;
    perTeacher: number;
    storageLimitGb: number;
    modules: string[];
    actorEmail: string;
    reason: string;
  }): Plan {
    const reason = requireReason(input.reason);
    const normalizedCode = input.code.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (!normalizedCode) throw new Error('Plan code is required.');
    if (state.plans.some((plan) => plan.code === normalizedCode)) {
      throw new Error('Plan code already exists.');
    }

    const plan: Plan = {
      id: randomUUID(),
      code: normalizedCode,
      name: input.name.trim(),
      status: 'DRAFT',
      description: input.description?.trim() || 'New provider-defined billing plan.',
      basePrice: Math.max(0, Math.round(input.basePrice)),
      perStudent: Math.max(0, Number(input.perStudent)),
      perTeacher: Math.max(0, Number(input.perTeacher)),
      storageLimitGb: Math.max(1, Math.round(input.storageLimitGb)),
      modules: input.modules.filter(Boolean),
    };

    if (!plan.name) throw new Error('Plan name is required.');

    state.plans.unshift(plan);
    logAudit('billing.plan.create', 'Plan', plan.id, null, input.actorEmail, reason, null, {
      code: plan.code,
      status: plan.status,
      basePrice: plan.basePrice,
    });
    return plan;
  },

  updateSubscriptionLifecycle(input: {
    subscriptionId: string;
    action: 'ACTIVATE' | 'SUSPEND' | 'RESUME' | 'CANCEL';
    actorEmail: string;
    reason: string;
  }): Subscription {
    const subscription = state.subscriptions.find((entry) => entry.id === input.subscriptionId);
    if (!subscription) throw new Error('Subscription not found.');
    const tenant = getTenant(subscription.tenantId);
    const reason = requireReason(input.reason);
    const before = { state: subscription.state, tenantStatus: tenant.status, billingStatus: tenant.billingStatus };

    if (input.action === 'ACTIVATE' || input.action === 'RESUME') {
      subscription.state = 'ACTIVE';
      subscription.graceEndsAt = null;
      tenant.status = 'ACTIVE';
      tenant.billingStatus = 'GOOD';
      tenant.health = tenant.incidentsOpen > 0 ? 'WARNING' : 'HEALTHY';
    }
    if (input.action === 'SUSPEND') {
      subscription.state = 'SUSPENDED';
      tenant.status = 'SUSPENDED';
      tenant.billingStatus = 'FAILED';
      tenant.health = 'CRITICAL';
    }
    if (input.action === 'CANCEL') {
      subscription.state = 'CANCELLED';
      tenant.status = 'OFFBOARDING';
      tenant.billingStatus = 'GOOD';
    }

    logAudit('billing.subscription.lifecycle', 'Subscription', subscription.id, subscription.tenantId, input.actorEmail, reason, before, {
      state: subscription.state,
      tenantStatus: tenant.status,
      billingStatus: tenant.billingStatus,
    });
    return subscription;
  },

  decideBillingApproval(input: {
    approvalId: string;
    decision: 'APPROVED' | 'REJECTED';
    actorEmail: string;
    reason: string;
  }): BillingApproval {
    const approval = state.billingApprovals.find((entry) => entry.id === input.approvalId);
    if (!approval) throw new Error('Billing approval not found.');
    const reason = requireReason(input.reason);
    const before = { status: approval.status };
    approval.status = input.decision;
    approval.decidedAt = new Date().toISOString();
    approval.decidedBy = input.actorEmail;

    const invoice = state.invoices.find((entry) => entry.id === approval.invoiceId);
    if (invoice) {
      invoice.discountPendingApproval = false;
      if (input.decision === 'APPROVED') {
        invoice.amount = Math.max(0, invoice.amount - approval.impactAmount);
      }
    }

    logAudit('billing.approval.decision', 'BillingApproval', approval.id, approval.tenantId, input.actorEmail, reason, before, {
      status: approval.status,
      invoiceId: approval.invoiceId,
    });
    return approval;
  },

  createGateway(input: {
    name: string;
    type: string;
    settlementDays: number;
    methods: Array<'CARD' | 'ACH' | 'BANK_TRANSFER'>;
    primary?: boolean;
    actorEmail: string;
    reason: string;
  }): PaymentGateway {
    const reason = requireReason(input.reason);
    const name = input.name.trim();
    if (!name) throw new Error('Gateway name is required.');
    if (input.primary) {
      for (const gateway of state.gateways) gateway.primary = false;
    }

    const gateway: PaymentGateway = {
      id: randomUUID(),
      name,
      type: input.type.trim() || 'CARD',
      status: 'ACTIVE',
      primary: Boolean(input.primary),
      settlementDays: Math.max(1, Math.round(input.settlementDays)),
      successRate: 99.1,
      monthlyVolume: 0,
      methods: input.methods.length > 0 ? input.methods : ['CARD'],
      supportedRegions: ['US'],
    };

    state.gateways.unshift(gateway);
    logAudit('billing.gateway.create', 'PaymentGateway', gateway.id, null, input.actorEmail, reason, null, {
      name: gateway.name,
      primary: gateway.primary,
    });
    return gateway;
  },

  updateGateway(input: {
    gatewayId: string;
    status?: PaymentGateway['status'];
    primary?: boolean;
    actorEmail: string;
    reason: string;
  }): PaymentGateway {
    const gateway = state.gateways.find((entry) => entry.id === input.gatewayId);
    if (!gateway) throw new Error('Gateway not found.');
    const reason = requireReason(input.reason);
    const before = { status: gateway.status, primary: gateway.primary };
    if (input.status) gateway.status = input.status;
    if (typeof input.primary === 'boolean' && input.primary) {
      for (const entry of state.gateways) entry.primary = false;
      gateway.primary = true;
    }
    logAudit('billing.gateway.update', 'PaymentGateway', gateway.id, null, input.actorEmail, reason, before, {
      status: gateway.status,
      primary: gateway.primary,
    });
    return gateway;
  },

  createCoupon(input: {
    code: string;
    description: string;
    type: 'PERCENT' | 'FLAT';
    discountValue: number;
    maxUses: number | null;
    expiresAt: string | null;
    planCodes: string[];
    actorEmail: string;
    reason: string;
  }): Coupon {
    const reason = requireReason(input.reason);
    const code = input.code.trim().toUpperCase();
    if (!code) throw new Error('Coupon code is required.');
    if (state.coupons.some((coupon) => coupon.code === code)) {
      throw new Error('Coupon code already exists.');
    }
    const coupon: Coupon = {
      id: randomUUID(),
      code,
      description: input.description.trim() || 'Provider created billing promotion.',
      type: input.type,
      discountValue: Math.max(0, Number(input.discountValue)),
      maxUses: input.maxUses == null ? null : Math.max(1, Math.round(input.maxUses)),
      uses: 0,
      expiresAt: input.expiresAt,
      status: input.expiresAt && new Date(input.expiresAt).getTime() < Date.now() ? 'EXPIRED' : 'ACTIVE',
      planCodes: input.planCodes,
      createdAt: new Date().toISOString(),
    };
    state.coupons.unshift(coupon);
    logAudit('billing.coupon.create', 'Coupon', coupon.id, null, input.actorEmail, reason, null, {
      code: coupon.code,
      type: coupon.type,
      discountValue: coupon.discountValue,
    });
    return coupon;
  },

  updateCoupon(input: {
    couponId: string;
    status: Coupon['status'];
    actorEmail: string;
    reason: string;
  }): Coupon {
    const coupon = state.coupons.find((entry) => entry.id === input.couponId);
    if (!coupon) throw new Error('Coupon not found.');
    const reason = requireReason(input.reason);
    const before = { status: coupon.status };
    coupon.status = input.status;
    logAudit('billing.coupon.update', 'Coupon', coupon.id, null, input.actorEmail, reason, before, {
      status: coupon.status,
    });
    return coupon;
  },

  createSupportTicket(input: { tenantId: string; category: Ticket['category']; subject: string; priority: TicketPriority; requesterEmail: string; actorEmail: string; reason: string }): Ticket {
    const tenant = getTenant(input.tenantId);
    const reason = requireReason(input.reason);
    const subject = input.subject.trim();
    if (!subject) throw new Error('Ticket subject is required.');
    const ticket: Ticket = {
      id: randomUUID(),
      tenantId: tenant.id,
      category: input.category,
      subject,
      priority: input.priority,
      status: 'NEW',
      assignee: 'support@provider.local',
      requesterEmail: input.requesterEmail,
      slaTargetAt: iso(priorityHours[input.priority] * HOUR_MS),
      createdAt: new Date().toISOString(),
    };
    state.tickets.unshift(ticket);
    logAudit('support.ticket.create', 'SupportTicket', ticket.id, tenant.id, input.actorEmail, reason, null, { category: ticket.category, priority: ticket.priority });
    return ticket;
  },

  updateSupportStatus(input: { ticketId: string; status: TicketStatus; actorEmail: string; reason: string }): Ticket {
    const ticket = state.tickets.find((entry) => entry.id === input.ticketId);
    if (!ticket) throw new Error('Ticket not found.');
    const reason = requireReason(input.reason);
    const before = { status: ticket.status };
    ticket.status = input.status;
    logAudit('support.ticket.status', 'SupportTicket', ticket.id, ticket.tenantId, input.actorEmail, reason, before, { status: ticket.status });
    return ticket;
  },

  createIncident(input: { title: string; severity: IncidentSeverity; affectedServices: string[]; tenantIds: string[]; actorEmail: string; reason: string }): Incident {
    const reason = requireReason(input.reason);
    const incident: Incident = {
      id: randomUUID(),
      code: `INC-${new Date().getUTCFullYear()}-${String(state.incidents.length + 21).padStart(3, '0')}`,
      title: input.title,
      severity: input.severity,
      status: 'OPEN',
      commander: input.actorEmail,
      affectedServices: input.affectedServices,
      tenantIds: input.tenantIds,
      updatedAt: new Date().toISOString(),
    };
    state.incidents.unshift(incident);
    for (const tenantId of input.tenantIds) {
      const tenant = getTenant(tenantId);
      tenant.incidentsOpen += 1;
      tenant.health = 'CRITICAL';
    }
    logAudit('incident.create', 'Incident', incident.id, null, input.actorEmail, reason, null, { severity: incident.severity, title: incident.title });
    refreshAutomations();
    return incident;
  },

  updateFeatureFlag(input: { flagId: string; enabled?: boolean; rolloutPercent?: number; scheduledAt?: string | null; actorEmail: string; reason: string }): FeatureFlag {
    const flag = state.featureFlags.find((entry) => entry.id === input.flagId);
    if (!flag) throw new Error('Feature flag not found.');
    const reason = requireReason(input.reason);
    const before = { enabled: flag.enabled, rolloutPercent: flag.rolloutPercent, scheduledAt: flag.scheduledAt };
    if (typeof input.enabled === 'boolean') flag.enabled = input.enabled;
    if (typeof input.rolloutPercent === 'number') flag.rolloutPercent = Math.max(0, Math.min(100, input.rolloutPercent));
    if (input.scheduledAt !== undefined) flag.scheduledAt = input.scheduledAt;
    logAudit('feature_flag.update', 'FeatureFlag', flag.id, null, input.actorEmail, reason, before, { enabled: flag.enabled, rolloutPercent: flag.rolloutPercent, scheduledAt: flag.scheduledAt });
    return flag;
  },

  listAudit(filters: { tenantId?: string; actorEmail?: string; action?: string }): AuditEvent[] {
    return state.audit.filter((entry) => {
      if (filters.tenantId && entry.tenantId !== filters.tenantId) return false;
      if (filters.actorEmail && entry.actorEmail !== filters.actorEmail) return false;
      if (filters.action && !entry.action.includes(filters.action)) return false;
      return true;
    });
  },

  completeDataRequest(input: { requestType: 'EXPORT' | 'DELETION'; requestId: string; actorEmail: string; reason: string }): Record<string, unknown> {
    const reason = requireReason(input.reason);
    if (input.requestType === 'EXPORT') {
      const request = state.exportRequests.find((entry) => String(entry.id) === input.requestId);
      if (!request) throw new Error('Export request not found.');
      const before = { state: request.state };
      request.state = 'COMPLETED';
      request.completedAt = new Date().toISOString();
      logAudit('data.export.complete', 'DataExportRequest', String(request.id), String(request.tenantId), input.actorEmail, reason, before, { state: request.state });
      return request;
    }

    const request = state.deletionRequests.find((entry) => String(entry.id) === input.requestId);
    if (!request) throw new Error('Deletion request not found.');
    const before = { state: request.state };
    request.state = 'COMPLETED';
    request.completedAt = new Date().toISOString();
    logAudit('data.deletion.complete', 'DataDeletionRequest', String(request.id), String(request.tenantId), input.actorEmail, reason, before, { state: request.state });
    return request;
  },

  /* ── Tenant extended ─────────────────────────────────────── */

  getTenantLifecycle(tenantId: string): Record<string, unknown> {
    const tenant = getTenant(tenantId);
    return {
      tenantId: tenant.id,
      name: tenant.name,
      status: tenant.status,
      domain: tenant.domain,
      events: [
        { type: 'CREATED', at: iso(-90 * DAY_MS) },
        { type: 'ACTIVATED', at: iso(-80 * DAY_MS) },
        { type: 'STATUS_CHANGE', to: tenant.status, at: new Date().toISOString() },
      ],
    };
  },

  listTenantMaintenanceActions(tenantId: string): Array<Record<string, unknown>> {
    return state.maintenanceActions.filter((a) => a.tenantId === tenantId);
  },

  updateTenantProfile(input: { tenantId: string; name?: string; domain?: string; adminEmail?: string; actorEmail: string; reason: string }): Record<string, unknown> {
    const tenant = getTenant(input.tenantId);
    const reason = requireReason(input.reason);
    const before = { name: tenant.name, domain: tenant.domain, adminEmail: tenant.adminEmail };
    if (input.name) tenant.name = input.name;
    if (input.domain) tenant.domain = input.domain;
    if (input.adminEmail) tenant.adminEmail = input.adminEmail;
    logAudit('tenant.profile.update', 'Tenant', tenant.id, tenant.id, input.actorEmail, reason, before, { name: tenant.name, domain: tenant.domain, adminEmail: tenant.adminEmail });
    return tenant;
  },

  toggleTenantModule(input: { tenantId: string; moduleKey: string; enabled: boolean; actorEmail: string; reason: string }): Record<string, unknown> {
    const reason = requireReason(input.reason);
    logAudit('tenant.module.toggle', 'Module', input.moduleKey, input.tenantId, input.actorEmail, reason, null, { enabled: input.enabled });
    return { tenantId: input.tenantId, moduleKey: input.moduleKey, enabled: input.enabled };
  },

  createTenantMaintenanceAction(input: { tenantId: string; type: string; description: string; actorEmail: string; reason: string }): Record<string, unknown> {
    const reason = requireReason(input.reason);
    const action: Record<string, unknown> = {
      id: `ma_${Date.now()}`,
      tenantId: input.tenantId,
      type: input.type,
      description: input.description,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    state.maintenanceActions.push(action);
    logAudit('tenant.maintenance.create', 'MaintenanceAction', String(action.id), input.tenantId, input.actorEmail, reason, null, action);
    return action;
  },

  resolveTenantMaintenanceAction(input: { actionId: string; actorEmail: string; reason: string }): Record<string, unknown> {
    const action = state.maintenanceActions.find((a) => a.id === input.actionId);
    if (!action) throw new Error('Maintenance action not found.');
    const reason = requireReason(input.reason);
    const before = { status: action.status };
    action.status = 'RESOLVED';
    (action as Record<string, unknown>).resolvedAt = new Date().toISOString();
    logAudit('tenant.maintenance.resolve', 'MaintenanceAction', String(action.id), String(action.tenantId), input.actorEmail, reason, before, { status: 'RESOLVED' });
    return action;
  },

  bulkUpdateTenantStatus(input: { tenantIds: string[]; status: string; actorEmail: string; reason: string }): { updated: number } {
    const reason = requireReason(input.reason);
    let updated = 0;
    for (const id of input.tenantIds) {
      const tenant = state.tenants.find((t) => t.id === id);
      if (tenant) {
        const before = { status: tenant.status };
        (tenant as Record<string, unknown>).status = input.status;
        logAudit('tenant.status.bulk', 'Tenant', tenant.id, tenant.id, input.actorEmail, reason, before, { status: input.status });
        updated++;
      }
    }
    return { updated };
  },

  /* ── Onboarding ────────────────────────────────────────── */

  launchOnboarding(input: { tenantName: string; planCode: string; adminEmail: string; country: string; actorEmail: string; reason: string }): Record<string, unknown> {
    const reason = requireReason(input.reason);
    const tenantId = `tenant_${Date.now()}`;
    logAudit('onboarding.launch', 'Tenant', tenantId, tenantId, input.actorEmail, reason, null, { tenantName: input.tenantName, planCode: input.planCode });
    return { tenantId, tenantName: input.tenantName, planCode: input.planCode, status: 'LAUNCHED', launchedAt: new Date().toISOString() };
  },

  /* ── Support extras ────────────────────────────────────── */

  getSupportExtras(): Record<string, unknown> {
    return {
      macros: state.macros,
      kbArticles: state.kbArticles,
      slaStats: { avgResponseTime: '2h 14m', breaches: 3, complianceRate: 94.2 },
      escalationRules: [
        { id: 'esc_1', name: 'P1 Auto-Escalate', trigger: 'priority=P1 AND age>30m', action: 'ESCALATE_MANAGER' },
        { id: 'esc_2', name: 'Stale Ticket', trigger: 'age>48h AND status=OPEN', action: 'NOTIFY_OWNER' },
      ],
    };
  },

  updateMacro(input: { macroId: string; name?: string; category?: string; template?: string; actorEmail: string; reason: string }): Record<string, unknown> {
    const macro = state.macros.find((m) => m.id === input.macroId);
    if (!macro) throw new Error('Macro not found.');
    const reason = requireReason(input.reason);
    const before = { name: macro.name, template: macro.template };
    if (input.name) macro.name = input.name;
    if (input.template) macro.template = input.template;
    if (input.category) macro.category = input.category;
    logAudit('support.macro.update', 'Macro', String(macro.id), null, input.actorEmail, reason, before, { name: macro.name, template: macro.template });
    return macro;
  },

  updateKbArticle(input: { articleId: string; title?: string; category?: string; status?: string; actorEmail: string; reason: string }): Record<string, unknown> {
    const article = state.kbArticles.find((a) => a.id === input.articleId);
    if (!article) throw new Error('KB article not found.');
    const reason = requireReason(input.reason);
    const before = { title: article.title, status: article.status };
    if (input.title) article.title = input.title;
    if (input.category) article.category = input.category;
    if (input.status) article.status = input.status;
    logAudit('support.kb.update', 'KbArticle', String(article.id), null, input.actorEmail, reason, before, { title: article.title, status: article.status });
    return article;
  },

  /* ── Incidents & maintenance windows ───────────────────── */

  listMaintenanceWindows(): Array<Record<string, unknown>> {
    return [
      { id: 'mw_1', title: 'Database maintenance', start: iso(7 * DAY_MS), end: iso(7 * DAY_MS + 4 * 3600_000), status: 'SCHEDULED' },
      { id: 'mw_2', title: 'Network upgrade', start: iso(14 * DAY_MS), end: iso(14 * DAY_MS + 2 * 3600_000), status: 'SCHEDULED' },
    ];
  },

  createMaintenanceWindow(input: { title: string; componentId?: string; startsAt: string; endsAt: string; scope?: string; actorEmail: string; reason: string }): Record<string, unknown> {
    const reason = requireReason(input.reason);
    const window = { id: `mw_${Date.now()}`, title: input.title, componentId: input.componentId ?? null, startsAt: input.startsAt, endsAt: input.endsAt, scope: input.scope ?? 'PUBLIC', status: 'SCHEDULED', createdAt: new Date().toISOString() };
    logAudit('maintenance.window.create', 'MaintenanceWindow', window.id, null, input.actorEmail, reason, null, window);
    return window;
  },

  /* ── Releases & feature flags creation ─────────────────── */

  createRelease(input: { version: string; channel?: string; scheduledAt?: string | null; actorEmail: string; reason: string }): Record<string, unknown> {
    const reason = requireReason(input.reason);
    const release = { id: `rel_${Date.now()}`, version: input.version, channel: input.channel ?? 'stable', scheduledAt: input.scheduledAt ?? null, status: 'DRAFT', createdAt: new Date().toISOString() };
    logAudit('release.create', 'Release', release.id, null, input.actorEmail, reason, null, release);
    return release;
  },

  createFeatureFlag(input: { key: string; name: string; rolloutPercent?: number; actorEmail: string; reason: string }): FeatureFlag {
    const reason = requireReason(input.reason);
    const pct = typeof input.rolloutPercent === 'number' ? Math.max(0, Math.min(100, input.rolloutPercent)) : 0;
    const flag: FeatureFlag = {
      id: `ff_${Date.now()}`,
      key: input.key,
      name: input.name,
      targeting: 'GLOBAL',
      enabled: pct > 0,
      rolloutPercent: pct,
      planCodes: [],
      tenantIds: [],
      scheduledAt: null,
      pausedByIncidentId: null,
      autoPauseOnIncident: false,
    };
    state.featureFlags.push(flag);
    logAudit('feature_flag.create', 'FeatureFlag', flag.id, null, input.actorEmail, reason, null, { key: flag.key, name: flag.name, enabled: flag.enabled });
    return flag;
  },

  /* ── OAuth & security ──────────────────────────────────── */

  listOAuthApps(): Array<Record<string, unknown>> {
    return [
      { id: 'oauth_1', name: 'Student Portal SSO', clientId: 'sp_client_abc', grantTypes: ['authorization_code'], status: 'ACTIVE', createdAt: iso(-60 * DAY_MS) },
      { id: 'oauth_2', name: 'Parent Mobile App', clientId: 'pm_client_def', grantTypes: ['authorization_code', 'refresh_token'], status: 'ACTIVE', createdAt: iso(-30 * DAY_MS) },
    ];
  },

  getSecurityExtras(): Record<string, unknown> {
    return {
      ipRules: [
        { id: 'ip_1', cidr: '10.0.0.0/8', type: 'ALLOW', description: 'Internal network' },
        { id: 'ip_2', cidr: '192.168.1.0/24', type: 'ALLOW', description: 'Office VPN' },
      ],
      activeSessions: 42,
      mfaAdoption: 87.5,
      lastSecurityScan: iso(-2 * DAY_MS),
    };
  },

  /* ── API management ────────────────────────────────────── */

  getApiManagement(): Record<string, unknown> {
    return {
      keys: [
        { id: 'key_1', name: 'Production Key', prefix: 'gyn_prod_', status: 'ACTIVE', createdAt: iso(-90 * DAY_MS), lastUsedAt: iso(-1 * DAY_MS) },
        { id: 'key_2', name: 'Staging Key', prefix: 'gyn_stg_', status: 'ACTIVE', createdAt: iso(-60 * DAY_MS), lastUsedAt: iso(-3 * DAY_MS) },
      ],
      webhooks: [
        { id: 'wh_1', url: 'https://hooks.example.com/events', events: ['tenant.created', 'invoice.paid'], status: 'ACTIVE' },
      ],
      rateLimits: { requestsPerMinute: 600, burstLimit: 100 },
      usage: { last24h: 12_450, last7d: 78_200, last30d: 312_000 },
    };
  },

  /* ── Audit exports ─────────────────────────────────────── */

  listAuditExports(): Array<Record<string, unknown>> {
    return [
      { id: 'ae_1', format: 'CSV', dateRange: { from: iso(-30 * DAY_MS), to: iso(0) }, status: 'COMPLETED', url: '/exports/audit_march.csv', createdAt: iso(-1 * DAY_MS) },
    ];
  },

  /* ── Analytics ─────────────────────────────────────────── */

  listAnalyticsReports(): Array<Record<string, unknown>> {
    return [
      { id: 'rpt_1', name: 'Monthly Tenant Growth', type: 'SCHEDULED', frequency: 'MONTHLY', lastRun: iso(-5 * DAY_MS), status: 'ACTIVE' },
      { id: 'rpt_2', name: 'Revenue by Plan', type: 'SCHEDULED', frequency: 'WEEKLY', lastRun: iso(-2 * DAY_MS), status: 'ACTIVE' },
      { id: 'rpt_3', name: 'Churn Analysis', type: 'AD_HOC', frequency: null, lastRun: iso(-10 * DAY_MS), status: 'COMPLETED' },
    ];
  },

  /* ── Notifications ─────────────────────────────────────── */

  listNotifications(): Array<Record<string, unknown>> {
    return [
      { id: 'notif_1', type: 'ALERT', title: 'High API error rate', message: 'Error rate exceeded 5% threshold.', read: false, createdAt: iso(-3600_000) },
      { id: 'notif_2', type: 'INFO', title: 'New tenant onboarded', message: 'Bright Academy completed onboarding.', read: true, createdAt: iso(-DAY_MS) },
      { id: 'notif_3', type: 'WARNING', title: 'SSL certificate expiring', message: 'Certificate for api.growyourneed.com expires in 14 days.', read: false, createdAt: iso(-2 * DAY_MS) },
    ];
  },

  /* ── Communications ────────────────────────────────────── */

  listComms(): Record<string, unknown> {
    return {
      announcements: [
        { id: 'ann_1', title: 'Platform maintenance scheduled', audience: 'ALL_TENANTS', status: 'SENT', sentAt: iso(-7 * DAY_MS) },
        { id: 'ann_2', title: 'New feature: Advanced reports', audience: 'ENTERPRISE', status: 'DRAFT', sentAt: null },
      ],
      messages: [
        { id: 'msg_1', to: 'admin@bright-academy.edu', subject: 'Billing update', status: 'DELIVERED', sentAt: iso(-3 * DAY_MS) },
      ],
      templates: [
        { id: 'ct_1', name: 'Welcome Email', type: 'EMAIL', subject: 'Welcome to {{platform}}', status: 'ACTIVE' },
        { id: 'ct_2', name: 'Invoice Reminder', type: 'EMAIL', subject: 'Invoice #{{invoiceId}} is due', status: 'ACTIVE' },
      ],
    };
  },

  /* ── Branding ──────────────────────────────────────────── */

  getBranding(): Record<string, unknown> {
    return {
      themes: [
        { id: 'theme_1', name: 'Default Light', primary: '#4F46E5', secondary: '#10B981', mode: 'LIGHT', active: true },
        { id: 'theme_2', name: 'Dark Mode', primary: '#6366F1', secondary: '#34D399', mode: 'DARK', active: false },
      ],
      customCss: '',
      domains: [
        { id: 'dom_1', domain: 'app.growyourneed.com', verified: true, primary: true },
        { id: 'dom_2', domain: 'portal.growyourneed.com', verified: true, primary: false },
      ],
      loginPages: [
        { id: 'lp_1', name: 'Default Login', logoUrl: '/assets/logo.svg', backgroundUrl: '/assets/bg.jpg', active: true },
      ],
    };
  },

  /* ── Backups & DR ──────────────────────────────────────── */

  listBackups(): Record<string, unknown> {
    return {
      schedules: [
        { id: 'bs_1', name: 'Nightly Full', frequency: 'DAILY', time: '02:00 UTC', retention: '30d', status: 'ACTIVE' },
        { id: 'bs_2', name: 'Weekly Incremental', frequency: 'WEEKLY', time: 'Sun 04:00 UTC', retention: '90d', status: 'ACTIVE' },
      ],
      snapshots: [
        { id: 'snap_1', type: 'FULL', size: '2.4 GB', createdAt: iso(-DAY_MS), status: 'AVAILABLE' },
        { id: 'snap_2', type: 'INCREMENTAL', size: '340 MB', createdAt: iso(-2 * DAY_MS), status: 'AVAILABLE' },
      ],
      runbooks: [
        { id: 'rb_1', name: 'Database Failover', steps: 5, lastTest: iso(-14 * DAY_MS), status: 'TESTED' },
        { id: 'rb_2', name: 'Full DR Recovery', steps: 12, lastTest: iso(-30 * DAY_MS), status: 'TESTED' },
      ],
    };
  },

  /* ── Data-ops extras ───────────────────────────────────── */

  getDataOpsExtras(): Record<string, unknown> {
    return {
      imports: [
        { id: 'imp_1', source: 'CSV Upload', records: 1200, status: 'COMPLETED', completedAt: iso(-5 * DAY_MS) },
      ],
      repairJobs: [
        { id: 'rj_1', type: 'ORPHAN_CLEANUP', affectedRecords: 34, status: 'COMPLETED', completedAt: iso(-3 * DAY_MS) },
        { id: 'rj_2', type: 'INDEX_REBUILD', affectedRecords: 0, status: 'PENDING', completedAt: null },
      ],
    };
  },

  resetStateForTests(): void {
    state = seedState();
  },
};

