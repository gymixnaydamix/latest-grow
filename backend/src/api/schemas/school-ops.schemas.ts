import { z } from 'zod';

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

export const markAttendanceSchema = z.object({
  studentId: z.string().uuid('Valid student ID is required'),
  courseId: z.string().uuid('Valid course ID is required'),
  date: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
});

export const approveCorrectionSchema = z.object({
  status: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Academics
// ---------------------------------------------------------------------------

export const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(200),
  description: z.string().max(1000).optional(),
  gradeLevel: z.string().max(50).optional(),
  semester: z.string().max(50).optional(),
  teacherId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
});

export const updateClassSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  gradeLevel: z.string().max(50).optional(),
  semester: z.string().max(50).optional(),
  teacherId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
});

// ---------------------------------------------------------------------------
// Exams
// ---------------------------------------------------------------------------

export const createExamSchema = z.object({
  title: z.string().min(1, 'Exam title is required').max(200),
  subject: z.string().min(1, 'Subject is required').max(200),
  instructions: z.string().max(5000).optional(),
  status: z.string().max(50).optional(),
});

export const updateMarksSchema = z.object({
  note: z.string().max(2000).optional(),
  room: z.string().max(100).optional(),
  date: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Finance Ops
// ---------------------------------------------------------------------------

export const generateInvoiceSchema = z.object({
  parentId: z.string().uuid('Valid parent ID is required'),
  studentId: z.string().uuid('Valid student ID is required'),
  items: z.array(z.unknown()).optional(),
  totalAmount: z.number().positive('Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  currency: z.string().max(10).default('USD'),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid('Valid invoice ID is required'),
  amount: z.number().positive('Amount must be positive'),
  method: z.string().min(1, 'Payment method is required').max(50),
  provider: z.string().max(100).optional(),
  transactionRef: z.string().max(200).optional(),
});

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

export const createRouteSchema = z.object({
  name: z.string().min(1, 'Route name is required').max(200),
  code: z.string().max(50).optional(),
  driverName: z.string().max(200).optional(),
  vehicleNumber: z.string().max(50).optional(),
  capacity: z.number().int().positive().optional(),
});

export const reportIncidentSchema = z.object({
  assignmentId: z.string().uuid('Valid assignment ID is required'),
  status: z.string().min(1, 'Status is required'),
  note: z.string().max(2000).optional(),
  recordedBy: z.string().uuid().optional(),
});

// ---------------------------------------------------------------------------
// Facilities
// ---------------------------------------------------------------------------

export const createMaintenanceRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(5000),
  facilityId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assignedTo: z.string().uuid().optional(),
  requestedBy: z.string().uuid().optional(),
});

export const bookFacilitySchema = z.object({
  facilityId: z.string().uuid('Valid facility ID is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  purpose: z.string().max(500).optional(),
  reservedBy: z.string().uuid().optional(),
});

// ---------------------------------------------------------------------------
// Communication
// ---------------------------------------------------------------------------

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().min(1, 'Body is required'),
  audience: z.array(z.string()).optional(),
  publish: z.boolean().default(false),
});

export const sendBroadcastSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().min(1, 'Body is required'),
  audience: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const saveProfileSchema = z.object({
  name: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
});

export const saveFeesSchema = z.record(z.string(), z.unknown());

// ---------------------------------------------------------------------------
// Staff / Leave
// ---------------------------------------------------------------------------

export const submitLeaveSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().max(2000).optional(),
  type: z.string().max(50).optional(),
}).passthrough();

export const approveLeaveSchema = z.object({
  status: z.string().optional(),
});
