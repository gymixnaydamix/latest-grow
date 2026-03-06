import { z } from 'zod';

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(['PROVIDER', 'ADMIN', 'FINANCE', 'MARKETING', 'SCHOOL', 'TEACHER', 'STUDENT', 'PARENT']),
});

// ---------------------------------------------------------------------------
// Pagination schema
// ---------------------------------------------------------------------------

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional().default(''),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ---------------------------------------------------------------------------
// School schemas
// ---------------------------------------------------------------------------

export const createSchoolSchema = z.object({
  name: z.string().min(1, 'School name is required').max(200),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
});

export const updateBrandingSchema = z.object({
  logoUrl: z.string().url().nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
});

// ---------------------------------------------------------------------------
// Announcement schemas
// ---------------------------------------------------------------------------

export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  audience: z.array(z.enum(['PROVIDER', 'ADMIN', 'FINANCE', 'MARKETING', 'SCHOOL', 'TEACHER', 'STUDENT', 'PARENT'])).min(1),
  publishedAt: z.string().datetime().optional(),
});

// ---------------------------------------------------------------------------
// Course schemas
// ---------------------------------------------------------------------------

export const createCourseSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional().default(''),
  gradeLevel: z.string().min(1),
  semester: z.string().min(1),
  teacherId: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Assignment schemas
// ---------------------------------------------------------------------------

export const createAssignmentSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().optional().default(''),
  dueDate: z.string().datetime(),
  maxScore: z.number().positive().default(100),
  type: z.string().default('HOMEWORK'),
});

export const updateAssignmentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  maxScore: z.number().positive().optional(),
  type: z.string().optional(),
});

export const enrollCourseSchema = z.object({
  studentId: z.string().min(1).optional(),
});

export const courseListQuerySchema = z.object({
  search: z.string().optional(),
  semester: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'semester']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// ---------------------------------------------------------------------------
// Session schemas
// ---------------------------------------------------------------------------

export const createSessionSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().max(200).optional().default(''),
  type: z.enum(['LECTURE', 'LAB', 'TUTORIAL', 'EXAM']).optional().default('LECTURE'),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  room: z.string().optional().default(''),
  recurring: z.boolean().optional().default(true),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  notes: z.string().optional().default(''),
});

export const updateSessionSchema = z.object({
  title: z.string().max(200).optional(),
  type: z.enum(['LECTURE', 'LAB', 'TUTORIAL', 'EXAM']).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  room: z.string().optional(),
  recurring: z.boolean().optional(),
  notes: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Submission schemas
// ---------------------------------------------------------------------------

export const createSubmissionSchema = z.object({
  content: z.string().min(1),
});

export const gradeSubmissionSchema = z.object({
  score: z.number().min(0),
  feedback: z.string().optional().default(''),
});

// ---------------------------------------------------------------------------
// Attendance schemas
// ---------------------------------------------------------------------------

export const markAttendanceSchema = z.object({
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    }),
  ).min(1),
  date: z.string().datetime(),
});

// ---------------------------------------------------------------------------
// Finance schemas
// ---------------------------------------------------------------------------

export const createTuitionPlanSchema = z.object({
  name: z.string().min(1).max(200),
  gradeLevel: z.string().min(1),
  amount: z.number().positive(),
  frequency: z.string().default('MONTHLY'),
});

export const createInvoiceSchema = z.object({
  parentId: z.string().min(1),
  studentId: z.string().min(1),
  items: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
      total: z.number().positive(),
    }),
  ).min(1),
  totalAmount: z.number().positive(),
  dueDate: z.string().datetime(),
});

export const createBudgetSchema = z.object({
  department: z.string().min(1),
  fiscalYear: z.number().int().positive(),
  allocatedAmount: z.number().positive(),
});

export const processPayrollSchema = z.object({
  records: z.array(
    z.object({
      staffId: z.string().min(1),
      period: z.string().min(1),
      grossAmount: z.number().positive(),
      deductions: z.record(z.string(), z.number()).default({}),
    }),
  ).min(1),
});

export const createGrantSchema = z.object({
  name: z.string().min(1).max(200),
  amount: z.number().positive(),
  deadline: z.string().datetime(),
  status: z.string().default('APPLIED'),
  notes: z.string().optional().default(''),
});

// ---------------------------------------------------------------------------
// Operations schemas
// ---------------------------------------------------------------------------

export const createFacilitySchema = z.object({
  name: z.string().min(1).max(200),
  type: z.string().min(1),
  capacity: z.number().int().positive().default(0),
});

export const createBookingSchema = z.object({
  facilityId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  purpose: z.string().default(''),
});

export const createPolicySchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional().default(''),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  type: z.enum(['ACADEMIC', 'SPORTS', 'CULTURAL', 'MEETING', 'HOLIDAY', 'OTHER']).default('OTHER'),
  audience: z.array(z.enum(['PROVIDER', 'ADMIN', 'FINANCE', 'MARKETING', 'SCHOOL', 'TEACHER', 'STUDENT', 'PARENT'])).min(1),
});

export const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional().default(''),
  targetDate: z.string().datetime(),
});

// ---------------------------------------------------------------------------
// Admissions & Marketing schemas
// ---------------------------------------------------------------------------

export const createApplicantSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  stage: z.enum(['INQUIRY', 'APPLICATION', 'REVIEW', 'ACCEPTED', 'ENROLLED', 'REJECTED']).default('INQUIRY'),
});

export const updateApplicantStageSchema = z.object({
  stage: z.enum(['INQUIRY', 'APPLICATION', 'REVIEW', 'ACCEPTED', 'ENROLLED', 'REJECTED']),
});

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  channel: z.enum(['EMAIL', 'SOCIAL', 'GOOGLE_ADS', 'OTHER']).default('EMAIL'),
  budget: z.number().min(0).default(0),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// ---------------------------------------------------------------------------
// Parent-specific schemas
// ---------------------------------------------------------------------------

export const updateDigestConfigSchema = z.object({
  frequency: z.enum(['DAILY', 'WEEKLY']),
  preferences: z.record(z.string(), z.boolean()).default({}),
});

export const createFeedbackSchema = z.object({
  category: z.string().min(1),
  body: z.string().min(1),
});

export const createVolunteerOpportunitySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional().default(''),
  date: z.string().datetime(),
  spotsAvailable: z.number().int().min(0).default(0),
});

// ---------------------------------------------------------------------------
// AI schemas
// ---------------------------------------------------------------------------

export const aiGenerateSchema = z.object({
  prompt: z.string().min(1).max(10000),
  maxTokens: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
  systemPrompt: z.string().optional(),
});

export const aiChatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1),
    }),
  ).min(1),
  maxTokens: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

// ---------------------------------------------------------------------------
// System schemas
// ---------------------------------------------------------------------------

export const createSystemPromptSchema = z.object({
  toolName: z.string().min(1).max(100),
  persona: z.string().min(1),
  instructions: z.string().optional().default(''),
});

export const createComplianceReportSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.string().min(1),
  content: z.record(z.string(), z.unknown()).default({}),
});

// ---------------------------------------------------------------------------
// Platform Settings schemas
// ---------------------------------------------------------------------------

export const upsertPlatformConfigSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
  label: z.string().max(200).default(''),
  group: z.enum(['general', 'branding', 'notification']).default('general'),
});

export const createFeatureFlagSchema = z.object({
  name: z.string().min(1).max(200),
  key: z.string().min(1).max(100).regex(/^[a-z0-9_]+$/, 'Key must be lowercase snake_case'),
  description: z.string().optional().default(''),
  enabled: z.boolean().default(false),
  rollout: z.number().int().min(0).max(100).default(0),
  environment: z.enum(['production', 'staging', 'development']).default('production'),
});

export const updateFeatureFlagSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  rollout: z.number().int().min(0).max(100).optional(),
  environment: z.enum(['production', 'staging', 'development']).optional(),
  archived: z.boolean().optional(),
});

export const createABTestSchema = z.object({
  name: z.string().min(1).max(200),
  key: z.string().min(1).max(100).regex(/^[a-z0-9_]+$/, 'Key must be lowercase snake_case'),
  variants: z.number().int().min(2).max(10).default(2),
  traffic: z.string().min(1).default('50/50'),
  endDate: z.string().datetime().optional(),
});

export const updateABTestSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  traffic: z.string().optional(),
  status: z.enum(['running', 'paused', 'completed']).optional(),
  winner: z.string().nullable().optional(),
});

export const createIntegrationSchema = z.object({
  name: z.string().min(1).max(200),
  provider: z.string().min(1).max(200),
  category: z.enum(['service', 'smtp', 'cdn', 'storage', 'monitoring', 'payment', 'search']).default('service'),
  description: z.string().optional().default(''),
  config: z.record(z.string(), z.unknown()).default({}),
});

export const updateIntegrationSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: z.enum(['active', 'inactive', 'error']).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  description: z.string().optional(),
});

export const createWebhookSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  events: z.string().min(1).default('*'),
  secret: z.string().optional().default(''),
});

export const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.string().optional(),
  status: z.enum(['active', 'inactive', 'failed']).optional(),
});

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(200),
  scopes: z.array(z.string()).min(1).default(['read']),
  expiresAt: z.string().datetime().optional(),
});

export const createIpRuleSchema = z.object({
  ip: z.string().min(1).max(45),
  label: z.string().max(200).default(''),
  type: z.enum(['whitelist', 'blocklist']).default('whitelist'),
});

export const createPlatformRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional().default(''),
  permissions: z.array(z.string()).default([]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1'),
});

export const updatePlatformRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const upsertAuthSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.record(z.string(), z.unknown()),
  label: z.string().max(200).default(''),
  category: z.enum(['general', 'sso', 'mfa', 'password', 'session']).default('general'),
});

export const createLegalDocSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().default(''),
  category: z.enum(['policy', 'dpa', 'compliance']).default('policy'),
  version: z.string().max(20).default('1.0'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

export const updateLegalDocSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().optional(),
  version: z.string().max(20).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const createComplianceCertSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional().default(''),
  status: z.enum(['compliant', 'in_progress', 'non_compliant']).default('compliant'),
  auditDate: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const updateComplianceCertSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['compliant', 'in_progress', 'non_compliant']).optional(),
  auditDate: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const upsertNotificationRuleSchema = z.object({
  event: z.string().min(1).max(100),
  label: z.string().max(200).default(''),
  email: z.boolean().default(true),
  push: z.boolean().default(false),
  inApp: z.boolean().default(true),
});

export const batchNotificationRulesSchema = z.object({
  rules: z.array(z.object({
    event: z.string().min(1),
    email: z.boolean(),
    push: z.boolean(),
    inApp: z.boolean(),
  })).min(1),
});

// ---------------------------------------------------------------------------
// User Management schemas
// ---------------------------------------------------------------------------

export const createUserSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(['PROVIDER', 'ADMIN', 'FINANCE', 'MARKETING', 'SCHOOL', 'TEACHER', 'STUDENT', 'PARENT']),
  avatar: z.string().url().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  role: z.enum(['PROVIDER', 'ADMIN', 'FINANCE', 'MARKETING', 'SCHOOL', 'TEACHER', 'STUDENT', 'PARENT']).optional(),
  avatar: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const bulkDeleteUsersSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required'),
});

export const bulkUpdateRoleSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required'),
  role: z.enum(['PROVIDER', 'ADMIN', 'FINANCE', 'MARKETING', 'SCHOOL', 'TEACHER', 'STUDENT', 'PARENT']),
});

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional().default(''),
  role: z.enum(['PROVIDER', 'ADMIN', 'FINANCE', 'MARKETING', 'SCHOOL', 'TEACHER', 'STUDENT', 'PARENT']).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'firstName', 'lastName', 'email', 'role']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ---------------------------------------------------------------------------
// Admin school users
// ---------------------------------------------------------------------------

export const schoolUsersQuerySchema = z.object({
  group: z.enum(['staff', 'students', 'parents']).default('staff'),
  search: z.string().optional().default(''),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const schoolUserParamSchema = z.object({
  schoolId: z.string().min(1),
  userId: z.string().min(1),
});

export const schoolParentParamSchema = z.object({
  schoolId: z.string().min(1),
  parentId: z.string().min(1),
});

export const createSchoolUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum(['ADMIN', 'TEACHER', 'FINANCE', 'MARKETING', 'SCHOOL', 'STUDENT', 'PARENT']),
  password: z.string().min(8).optional().default('changeme123'),
  isActive: z.boolean().optional().default(true),
});

export const updateSchoolUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  role: z.enum(['ADMIN', 'TEACHER', 'FINANCE', 'MARKETING', 'SCHOOL', 'STUDENT', 'PARENT']).optional(),
  isActive: z.boolean().optional(),
});

export const updateSchoolUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const hardDeleteQuerySchema = z.object({
  hard: z.enum(['true']).optional(),
});

export const parentChildrenUpdateSchema = z.object({
  childIds: z.array(z.string().min(1)).default([]),
});

// ---------------------------------------------------------------------------
// Academic school admin extensions
// ---------------------------------------------------------------------------

export const createDepartmentSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional().default(''),
  headId: z.string().optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  headId: z.string().nullable().optional(),
});

export const createCurriculumStandardSchema = z.object({
  code: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  description: z.string().optional().default(''),
  subject: z.string().optional().default(''),
  gradeLevel: z.string().optional().default(''),
});

export const updateCurriculumStandardSchema = z.object({
  code: z.string().min(1).max(100).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
});

export const courseCurriculumParamsSchema = z.object({
  courseId: z.string().min(1),
  standardId: z.string().min(1),
});

export const courseIdParamSchema = z.object({
  courseId: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Finance school admin extensions
// ---------------------------------------------------------------------------

export const createExpenseRecordSchema = z.object({
  category: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  amount: z.coerce.number().positive(),
  vendor: z.string().optional().default(''),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID']).optional().default('DRAFT'),
  incurredAt: z.string().datetime(),
  notes: z.string().optional().default(''),
});

export const updateExpenseRecordSchema = z.object({
  category: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  amount: z.coerce.number().positive().optional(),
  vendor: z.string().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID']).optional(),
  incurredAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const reportRangeQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const reportExportQuerySchema = reportRangeQuerySchema.extend({
  format: z.enum(['csv']).default('csv'),
});

// ---------------------------------------------------------------------------
// Operations school admin extensions
// ---------------------------------------------------------------------------

export const maintenanceStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
export const maintenancePrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const createMaintenanceRequestSchema = z.object({
  facilityId: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  priority: maintenancePrioritySchema.optional().default('MEDIUM'),
  status: maintenanceStatusSchema.optional().default('OPEN'),
  assignedTo: z.string().optional(),
  notes: z.string().optional().default(''),
});

export const updateMaintenanceRequestSchema = z.object({
  facilityId: z.string().nullable().optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  priority: maintenancePrioritySchema.optional(),
  status: maintenanceStatusSchema.optional(),
  assignedTo: z.string().nullable().optional(),
  resolvedAt: z.string().datetime().nullable().optional(),
  notes: z.string().optional(),
});

export const maintenanceListQuerySchema = z.object({
  status: maintenanceStatusSchema.optional(),
  priority: maintenancePrioritySchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const bookingListQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  facilityId: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

export const transportAssignmentStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'REMOVED']);
export const transportTrackingStatusSchema = z.enum(['PICKED_UP', 'IN_TRANSIT', 'DROPPED_OFF', 'MISSED', 'CANCELLED']);

export const createTransportRouteSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().optional().default(''),
  driverName: z.string().optional().default(''),
  vehicleNumber: z.string().optional().default(''),
  capacity: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateTransportRouteSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().optional(),
  driverName: z.string().optional(),
  vehicleNumber: z.string().optional(),
  capacity: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const createTransportStopSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().optional().default(''),
  sequence: z.coerce.number().int().min(1),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).optional().default(''),
});

export const updateTransportStopSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().optional(),
  sequence: z.coerce.number().int().min(1).optional(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export const createTransportAssignmentSchema = z.object({
  routeId: z.string().min(1),
  userId: z.string().min(1),
  stopId: z.string().optional(),
  status: transportAssignmentStatusSchema.optional().default('ACTIVE'),
  notes: z.string().optional().default(''),
});

export const updateTransportAssignmentSchema = z.object({
  routeId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
  stopId: z.string().nullable().optional(),
  status: transportAssignmentStatusSchema.optional(),
  notes: z.string().optional(),
});

export const createTransportEventSchema = z.object({
  status: transportTrackingStatusSchema,
  note: z.string().optional().default(''),
});

export const transportTrackingQuerySchema = z.object({
  assignmentId: z.string().optional(),
  status: transportTrackingStatusSchema.optional(),
});

// ---------------------------------------------------------------------------
// Library
// ---------------------------------------------------------------------------

export const libraryLoanStatusSchema = z.enum(['OUT', 'RETURNED', 'OVERDUE']);

export const createLibraryItemSchema = z.object({
  title: z.string().min(1).max(300),
  author: z.string().optional().default(''),
  isbn: z.string().optional().default(''),
  category: z.string().optional().default(''),
  description: z.string().optional().default(''),
  shelfLocation: z.string().optional().default(''),
  totalCopies: z.coerce.number().int().min(1).default(1),
  availableCopies: z.coerce.number().int().min(0).default(1),
  publishedYear: z.coerce.number().int().min(1000).max(3000).optional(),
});

export const updateLibraryItemSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  author: z.string().optional(),
  isbn: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  shelfLocation: z.string().optional(),
  totalCopies: z.coerce.number().int().min(1).optional(),
  availableCopies: z.coerce.number().int().min(0).optional(),
  publishedYear: z.coerce.number().int().min(1000).max(3000).nullable().optional(),
});

export const libraryLoansQuerySchema = z.object({
  status: libraryLoanStatusSchema.optional(),
  borrowerId: z.string().optional(),
  itemId: z.string().optional(),
});

export const checkoutLibraryLoanSchema = z.object({
  schoolId: z.string().min(1),
  itemId: z.string().min(1),
  borrowerId: z.string().min(1),
  dueAt: z.string().datetime(),
  notes: z.string().optional().default(''),
});

export const returnLibraryLoanSchema = z.object({
  notes: z.string().optional().default(''),
});

// ---------------------------------------------------------------------------
// ID param schema
// ---------------------------------------------------------------------------

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const schoolIdParamSchema = z.object({
  schoolId: z.string().min(1),
});
