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

export const flexibleEntitySchema = z.record(z.string(), z.unknown());

// ---------------------------------------------------------------------------
// Academics
// ---------------------------------------------------------------------------

export const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(200),
  description: z.string().max(1000).optional(),
  gradeLevel: z.string().max(50).optional(),
  level: z.string().max(50).optional(),
  section: z.string().max(50).optional(),
  classTeacher: z.string().max(200).optional(),
  room: z.string().max(100).optional(),
  capacity: z.coerce.number().int().nonnegative().optional(),
  students: z.coerce.number().int().nonnegative().optional(),
  subjects: z.coerce.number().int().nonnegative().optional(),
  semester: z.string().max(50).optional(),
  teacherId: z.string().optional(),
  departmentId: z.string().optional(),
}).passthrough();

export const updateClassSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  gradeLevel: z.string().max(50).optional(),
  level: z.string().max(50).optional(),
  section: z.string().max(50).optional(),
  classTeacher: z.string().max(200).optional(),
  room: z.string().max(100).optional(),
  capacity: z.coerce.number().int().nonnegative().optional(),
  students: z.coerce.number().int().nonnegative().optional(),
  subjects: z.coerce.number().int().nonnegative().optional(),
  semester: z.string().max(50).optional(),
  teacherId: z.string().optional(),
  departmentId: z.string().optional(),
}).passthrough();

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
  parentId: z.string().optional(),
  studentId: z.string().optional(),
  student: z.string().optional(),
  grade: z.string().optional(),
  amount: z.union([z.number(), z.string()]).optional(),
  paid: z.union([z.number(), z.string()]).optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  items: z.array(z.unknown()).optional(),
  totalAmount: z.number().positive('Amount must be positive').optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  currency: z.string().max(10).default('USD'),
}).passthrough();

export const recordPaymentSchema = z.object({
  invoiceId: z.string().optional(),
  invoiceRef: z.string().optional(),
  amount: z.union([z.number(), z.string()]),
  method: z.string().min(1, 'Payment method is required').max(50),
  provider: z.string().max(100).optional(),
  transactionRef: z.string().max(200).optional(),
  reference: z.string().max(200).optional(),
  receivedDate: z.string().optional(),
  notes: z.string().optional(),
}).passthrough();

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

export const createRouteSchema = z.object({
  name: z.string().min(1, 'Route name is required').max(200),
  code: z.string().max(50).optional(),
  driverName: z.string().max(200).optional(),
  driver: z.string().max(200).optional(),
  vehicleNumber: z.string().max(50).optional(),
  vehicle: z.string().max(50).optional(),
  capacity: z.coerce.number().int().positive().optional(),
  students: z.coerce.number().int().nonnegative().optional(),
  stops: z.coerce.number().int().nonnegative().optional(),
  morningTime: z.string().optional(),
  afternoonTime: z.string().optional(),
  status: z.string().optional(),
}).passthrough();

export const reportIncidentSchema = z.object({
  assignmentId: z.string().optional(),
  route: z.string().optional(),
  vehicle: z.string().optional(),
  date: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  severity: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
  note: z.string().max(2000).optional(),
  recordedBy: z.string().optional(),
  actionTaken: z.string().optional(),
}).passthrough();

// ---------------------------------------------------------------------------
// Facilities
// ---------------------------------------------------------------------------

export const createMaintenanceRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  description: z.string().min(1, 'Description is required').max(5000),
  facilityId: z.string().optional(),
  room: z.string().optional(),
  type: z.string().optional(),
  vehicleId: z.string().optional(),
  status: z.string().optional(),
  reportedAt: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assignedTo: z.string().optional(),
  requestedBy: z.string().optional(),
}).passthrough();

export const bookFacilitySchema = z.object({
  facilityId: z.string().optional(),
  roomId: z.string().optional(),
  date: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  purpose: z.string().max(500).optional(),
  reservedBy: z.string().optional(),
  event: z.string().optional(),
  bookedBy: z.string().optional(),
  status: z.string().optional(),
}).passthrough();

// ---------------------------------------------------------------------------
// Communication
// ---------------------------------------------------------------------------

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().min(1, 'Body is required'),
  audience: z.union([z.array(z.string()), z.string()]).optional(),
  publish: z.boolean().default(false),
  priority: z.string().optional(),
  status: z.string().optional(),
}).passthrough();

export const sendBroadcastSchema = z.object({
  title: z.string().max(200).optional(),
  body: z.string().optional(),
  message: z.string().optional(),
  audience: z.union([z.array(z.string()), z.string()]).optional(),
}).passthrough();

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const saveProfileSchema = z.object({
  name: z.string().max(200).optional(),
  schoolName: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  regNumber: z.string().max(100).optional(),
  timezone: z.string().max(100).optional(),
  schoolHours: z.string().max(100).optional(),
  officeHours: z.string().max(100).optional(),
  foundedYear: z.string().max(20).optional(),
}).passthrough();

export const saveAcademicSchema = z.record(z.string(), z.unknown());

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
