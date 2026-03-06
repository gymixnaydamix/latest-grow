import { z } from 'zod';

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

export const explainAbsenceSchema = z.object({
  note: z.string().min(1, 'Note is required').max(2000),
});

export const submitAttendanceExplanationSchema = z.object({
  note: z.string().min(1, 'Note is required').max(2000),
});

// ---------------------------------------------------------------------------
// Messaging
// ---------------------------------------------------------------------------

export const createMessageThreadSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  body: z.string().min(1, 'Message body is required'),
  recipientIds: z.array(z.string().uuid()).min(1, 'At least one recipient is required'),
});

export const postMessageSchema = z.object({
  body: z.string().min(1, 'Message body is required'),
});

// ---------------------------------------------------------------------------
// Approvals
// ---------------------------------------------------------------------------

export const decideApprovalSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  note: z.string().max(2000).default(''),
});

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export const rsvpEventSchema = z.object({
  status: z.enum(['GOING', 'NOT_GOING']),
});

// ---------------------------------------------------------------------------
// Profile & Digest
// ---------------------------------------------------------------------------

export const updateProfilePreferencesSchema = z.object({
  locale: z.string().max(10).optional(),
  theme: z.string().max(20).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
});

export const updateDigestConfigSchema = z.object({
  frequency: z.enum(['DAILY', 'WEEKLY']),
  preferences: z.record(z.string(), z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// Feedback & Support
// ---------------------------------------------------------------------------

export const createFeedbackSchema = z.object({
  category: z.string().min(1, 'Category is required').max(100),
  body: z.string().min(1, 'Feedback body is required').max(5000),
});

export const createSupportTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  description: z.string().min(1, 'Description is required').max(5000),
  childId: z.string().uuid().optional(),
  category: z.string().max(100).default('GENERAL'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

export const replySupportTicketSchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000),
});

// ---------------------------------------------------------------------------
// Productivity
// ---------------------------------------------------------------------------

export const upsertPinSchema = z.object({
  itemId: z.string().min(1),
  label: z.string().min(1).max(200),
  moduleId: z.string().min(1),
  kind: z.string().max(50).default('PIN'),
  childId: z.string().uuid().optional(),
});

export const upsertWorkspaceItemSchema = z.object({
  itemId: z.string().min(1),
  label: z.string().min(1).max(200),
  moduleId: z.string().min(1),
  kind: z.string().max(50).optional(),
  childId: z.string().uuid().optional(),
});

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const markNotificationsReadSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one notification id is required'),
});
