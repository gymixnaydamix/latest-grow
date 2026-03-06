/* ────────────────────────────────────────────────────────────────────────────
 * Parent Portal V2 — Comprehensive Demo Data
 * Realistic school family scenarios with two children:
 *   Emma Parentson (student-001) — Grade 9-A
 *   Noah Parentson (student-002) — Grade 6-C
 * Current date context: March 5 2026
 * ────────────────────────────────────────────────────────────────────────── */

// ═══════════════════════════════════════ ENUMS / TYPES ═══════════════════════

export type ParentPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type AssignmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | 'RETURNED' | 'MISSING' | 'LATE';
export type ExamStatus = 'UPCOMING' | 'COMPLETED' | 'RESULT_PUBLISHED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type RsvpStatus = 'GOING' | 'NOT_GOING' | 'PENDING';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type AnnouncementCategory = 'ACADEMIC' | 'EVENT' | 'FINANCE' | 'TRANSPORT' | 'URGENT';

// ═══════════════════════════════════════ INTERFACES ══════════════════════════

export interface ParentChildDemo {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  section: string;
  gradeLevel: number;
  homeroomTeacher: string;
  emergencyContact: string;
  transportRoute: string;
  attendanceFlag: 'OK' | 'WATCH' | 'RISK';
  attendanceRate: number;
  unreadMessages: number;
  pendingApprovals: number;
  nextExam: string | null;
  averageGrade: number;
  photoUrl: string | null;
}

export interface ParentActionItemDemo {
  id: string;
  childId: string;
  title: string;
  dueDate: string;
  priority: ParentPriority;
  status: string;
  quickAction: string;
  module: string;
}

export interface ParentTimetableItemDemo {
  id: string;
  childId: string;
  weekday: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
  status: 'SCHEDULED' | 'SUBSTITUTE' | 'CANCELLED';
  note: string;
}

export interface ParentAssignmentDemo {
  id: string;
  childId: string;
  subject: string;
  title: string;
  dueDate: string;
  status: AssignmentStatus;
  teacherInstruction: string;
  attachmentCount: number;
  submittedAt: string | null;
  grade: number | null;
  maxGrade: number | null;
}

export interface ParentExamDemo {
  id: string;
  childId: string;
  subject: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  status: ExamStatus;
  instructions: string;
  resultScore: number | null;
  resultMax: number | null;
}

export interface ParentGradeDemo {
  id: string;
  childId: string;
  subject: string;
  assessment: string;
  type: 'QUIZ' | 'TEST' | 'EXAM' | 'PROJECT' | 'ESSAY' | 'LAB' | 'HOMEWORK';
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  teacherFeedback: string;
  gradedAt: string;
  published: boolean;
  strengths: string;
  areasForImprovement: string;
}

export interface ParentAttendanceDemo {
  id: string;
  childId: string;
  date: string;
  status: AttendanceStatus;
  note: string;
  subject: string | null;
  period: number | null;
  explanationSubmitted: boolean;
}

export interface ParentMessageThreadDemo {
  id: string;
  childId: string | null;
  subject: string;
  counterpart: string;
  counterpartRole: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  priority: ParentPriority;
  messageCount: number;
  hasAttachment: boolean;
}

export interface ParentAnnouncementDemo {
  id: string;
  childId: string | null;
  title: string;
  category: AnnouncementCategory;
  body: string;
  createdAt: string;
  read: boolean;
  saved: boolean;
  author: string;
  hasAttachment: boolean;
}

export interface ParentInvoiceDemo {
  id: string;
  childId: string;
  title: string;
  description: string;
  dueDate: string;
  issuedAt: string;
  currency: string;
  totalAmount: number;
  amountPaid: number;
  status: InvoiceStatus;
  lineItems: { label: string; amount: number }[];
}

export interface ParentPaymentDemo {
  id: string;
  invoiceId: string;
  childId: string;
  currency: string;
  amount: number;
  paidAt: string;
  method: string;
  reference: string;
}

export interface ParentReceiptDemo {
  id: string;
  invoiceId: string;
  childId: string;
  currency: string;
  amount: number;
  issuedAt: string;
  fileName: string;
}

export interface ParentApprovalDemo {
  id: string;
  childId: string;
  title: string;
  type: string;
  description: string;
  dueDate: string;
  status: ApprovalStatus;
  priority: ParentPriority;
  requestedBy: string;
  requestedAt: string;
}

export interface ParentTransportDemo {
  id: string;
  childId: string;
  routeName: string;
  pickupStop: string;
  dropStop: string;
  pickupWindow: string;
  dropWindow: string;
  vehicle: string;
  driverName: string;
  driverPhone: string;
  status: 'ON_TIME' | 'DELAYED' | 'ALERT';
  note: string;
  lastUpdated: string;
}

export interface ParentDocumentDemo {
  id: string;
  childId: string;
  title: string;
  category: string;
  status: 'AVAILABLE' | 'REQUESTED' | 'PENDING_UPLOAD' | 'PROCESSING';
  updatedAt: string;
  fileSize: string;
  downloadUrl: string | null;
}

export interface ParentEventDemo {
  id: string;
  childId: string | null;
  title: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  rsvpStatus: RsvpStatus;
  rsvpDeadline: string;
  organizer: string;
}

export interface ParentSupportTicketDemo {
  id: string;
  childId: string | null;
  category: string;
  subject: string;
  description: string;
  priority: ParentPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  responses: { author: string; message: string; createdAt: string }[];
}

export interface ParentCalendarItemDemo {
  id: string;
  childId: string | null;
  title: string;
  date: string;
  type: 'EXAM' | 'ASSIGNMENT_DUE' | 'EVENT' | 'FEE_DUE' | 'MEETING' | 'HOLIDAY';
  module: string;
}

// ═══════════════════════════════════════ CHILDREN ════════════════════════════

export const parentChildrenDemo: ParentChildDemo[] = [
  {
    id: 'student-001',
    firstName: 'Emma',
    lastName: 'Parentson',
    className: 'Grade 9',
    section: 'A',
    gradeLevel: 9,
    homeroomTeacher: 'Mr. Robert Johnson',
    emergencyContact: '+1 555-1102',
    transportRoute: 'North Loop A',
    attendanceFlag: 'WATCH',
    attendanceRate: 92,
    unreadMessages: 3,
    pendingApprovals: 2,
    nextExam: 'Quarterly Algebra Exam — Mar 12',
    averageGrade: 82,
    photoUrl: null,
  },
  {
    id: 'student-002',
    firstName: 'Noah',
    lastName: 'Parentson',
    className: 'Grade 6',
    section: 'C',
    gradeLevel: 6,
    homeroomTeacher: 'Ms. Angela Roberts',
    emergencyContact: '+1 555-1102',
    transportRoute: 'North Loop B',
    attendanceFlag: 'OK',
    attendanceRate: 97,
    unreadMessages: 1,
    pendingApprovals: 1,
    nextExam: 'Vocabulary Quiz — Mar 11',
    averageGrade: 91,
    photoUrl: null,
  },
];

// ═══════════════════════════════════════ ACTION ITEMS ════════════════════════

export const parentActionItemsDemo: ParentActionItemDemo[] = [
  { id: 'act-001', childId: 'student-001', title: 'Approve Museum Field Trip Consent Form', dueDate: '2026-03-08', priority: 'HIGH', status: 'PENDING_APPROVAL', quickAction: 'Approve form', module: 'approvals_forms' },
  { id: 'act-002', childId: 'student-001', title: 'Invoice INV-2026-104 is overdue — $1,000 remaining', dueDate: '2026-03-06', priority: 'HIGH', status: 'OVERDUE', quickAction: 'Pay invoice', module: 'fees_payments' },
  { id: 'act-003', childId: 'student-001', title: 'Biology Lab Safety Form not yet signed', dueDate: '2026-03-10', priority: 'HIGH', status: 'PENDING_DOCUMENT', quickAction: 'Upload document', module: 'documents' },
  { id: 'act-004', childId: 'student-001', title: 'Biology Lab Report - Cell Respiration is missing', dueDate: '2026-03-06', priority: 'HIGH', status: 'ASSIGNMENT_MISSING', quickAction: 'View assignment', module: 'assignments' },
  { id: 'act-005', childId: 'student-002', title: 'Submit absence explanation for March 4', dueDate: '2026-03-07', priority: 'MEDIUM', status: 'FOLLOW_UP', quickAction: 'Explain absence', module: 'attendance' },
  { id: 'act-006', childId: 'student-002', title: 'Read urgent transport route change notice', dueDate: '2026-03-05', priority: 'MEDIUM', status: 'UNREAD_URGENT', quickAction: 'Read notice', module: 'announcements' },
  { id: 'act-007', childId: 'student-002', title: 'Acknowledge Updated Photography Policy', dueDate: '2026-03-12', priority: 'MEDIUM', status: 'PENDING_APPROVAL', quickAction: 'Approve form', module: 'approvals_forms' },
  { id: 'act-008', childId: 'student-002', title: 'Plant Growth Observation assignment is late', dueDate: '2026-03-03', priority: 'MEDIUM', status: 'ASSIGNMENT_LATE', quickAction: 'View assignment', module: 'assignments' },
];

// ═══════════════════════════════════════ TIMETABLE ═══════════════════════════

export const parentTimetableDemo: ParentTimetableItemDemo[] = [
  // Emma — Monday
  { id: 'tt-e-m1', childId: 'student-001', weekday: 'Monday', startTime: '08:30', endTime: '09:20', subject: 'Mathematics', teacher: 'Mr. Johnson', room: 'A-201', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-m2', childId: 'student-001', weekday: 'Monday', startTime: '09:30', endTime: '10:20', subject: 'English Literature', teacher: 'Ms. Lee', room: 'A-305', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-m3', childId: 'student-001', weekday: 'Monday', startTime: '10:40', endTime: '11:30', subject: 'Biology', teacher: 'Dr. Patel', room: 'Lab 3', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-m4', childId: 'student-001', weekday: 'Monday', startTime: '11:40', endTime: '12:30', subject: 'History', teacher: 'Ms. Morgan', room: 'A-108', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-m5', childId: 'student-001', weekday: 'Monday', startTime: '13:30', endTime: '14:20', subject: 'Physical Education', teacher: 'Coach Williams', room: 'Gym A', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-m6', childId: 'student-001', weekday: 'Monday', startTime: '14:30', endTime: '15:20', subject: 'Art', teacher: 'Ms. Rivera', room: 'Art Studio', status: 'SCHEDULED', note: '' },
  // Emma — Tuesday
  { id: 'tt-e-t1', childId: 'student-001', weekday: 'Tuesday', startTime: '08:30', endTime: '09:20', subject: 'Chemistry', teacher: 'Mr. Adams', room: 'Lab 1', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-t2', childId: 'student-001', weekday: 'Tuesday', startTime: '09:30', endTime: '10:20', subject: 'Mathematics', teacher: 'Mr. Johnson', room: 'A-201', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-t3', childId: 'student-001', weekday: 'Tuesday', startTime: '10:40', endTime: '11:30', subject: 'French', teacher: 'Mme. Dupont', room: 'A-402', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-t4', childId: 'student-001', weekday: 'Tuesday', startTime: '11:40', endTime: '12:30', subject: 'Geography', teacher: 'Mr. Turner', room: 'A-210', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-t5', childId: 'student-001', weekday: 'Tuesday', startTime: '13:30', endTime: '14:20', subject: 'English Literature', teacher: 'Ms. Lee', room: 'A-305', status: 'SCHEDULED', note: '' },
  // Emma — Wednesday
  { id: 'tt-e-w1', childId: 'student-001', weekday: 'Wednesday', startTime: '08:30', endTime: '09:20', subject: 'Biology', teacher: 'Dr. Patel', room: 'Lab 3', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-w2', childId: 'student-001', weekday: 'Wednesday', startTime: '09:30', endTime: '10:20', subject: 'History', teacher: 'Ms. Morgan', room: 'A-108', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-w3', childId: 'student-001', weekday: 'Wednesday', startTime: '10:40', endTime: '11:30', subject: 'Mathematics', teacher: 'Mr. Johnson', room: 'A-201', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-w4', childId: 'student-001', weekday: 'Wednesday', startTime: '11:40', endTime: '12:30', subject: 'Music', teacher: 'Mr. Clarke', room: 'Music Room', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-w5', childId: 'student-001', weekday: 'Wednesday', startTime: '13:30', endTime: '14:20', subject: 'Computer Science', teacher: 'Ms. Nakamura', room: 'IT Lab 2', status: 'SCHEDULED', note: '' },
  // Emma — Thursday (current day)
  { id: 'tt-e-th1', childId: 'student-001', weekday: 'Thursday', startTime: '08:30', endTime: '09:20', subject: 'Mathematics', teacher: 'Mr. Johnson', room: 'A-201', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-th2', childId: 'student-001', weekday: 'Thursday', startTime: '09:30', endTime: '10:20', subject: 'English Literature', teacher: 'Substitute: Ms. Park', room: 'A-305', status: 'SUBSTITUTE', note: 'Ms. Lee is absent today — Ms. Park will cover.' },
  { id: 'tt-e-th3', childId: 'student-001', weekday: 'Thursday', startTime: '10:40', endTime: '11:30', subject: 'Chemistry', teacher: 'Mr. Adams', room: 'Lab 1', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-th4', childId: 'student-001', weekday: 'Thursday', startTime: '11:40', endTime: '12:30', subject: 'French', teacher: 'Mme. Dupont', room: 'A-402', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-th5', childId: 'student-001', weekday: 'Thursday', startTime: '13:30', endTime: '14:20', subject: 'Physical Education', teacher: 'Coach Williams', room: 'Gym A', status: 'CANCELLED', note: 'Cancelled — gym maintenance scheduled.' },
  // Emma — Friday
  { id: 'tt-e-f1', childId: 'student-001', weekday: 'Friday', startTime: '08:30', endTime: '09:20', subject: 'Geography', teacher: 'Mr. Turner', room: 'A-210', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-f2', childId: 'student-001', weekday: 'Friday', startTime: '09:30', endTime: '10:20', subject: 'Biology', teacher: 'Dr. Patel', room: 'Lab 3', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-f3', childId: 'student-001', weekday: 'Friday', startTime: '10:40', endTime: '11:30', subject: 'History', teacher: 'Ms. Morgan', room: 'A-108', status: 'SCHEDULED', note: '' },
  { id: 'tt-e-f4', childId: 'student-001', weekday: 'Friday', startTime: '11:40', endTime: '12:30', subject: 'Art', teacher: 'Ms. Rivera', room: 'Art Studio', status: 'SCHEDULED', note: '' },

  // Noah — Monday
  { id: 'tt-n-m1', childId: 'student-002', weekday: 'Monday', startTime: '08:30', endTime: '09:20', subject: 'Mathematics', teacher: 'Mr. Collins', room: 'C-101', status: 'SCHEDULED', note: '' },
  { id: 'tt-n-m2', childId: 'student-002', weekday: 'Monday', startTime: '09:30', endTime: '10:20', subject: 'English', teacher: 'Ms. Harper', room: 'C-205', status: 'SCHEDULED', note: '' },
  { id: 'tt-n-m3', childId: 'student-002', weekday: 'Monday', startTime: '10:40', endTime: '11:20', subject: 'Science', teacher: 'Dr. Patel', room: 'C-108', status: 'SCHEDULED', note: '' },
  { id: 'tt-n-m4', childId: 'student-002', weekday: 'Monday', startTime: '11:30', endTime: '12:10', subject: 'Social Studies', teacher: 'Ms. Roberts', room: 'C-303', status: 'SCHEDULED', note: '' },
  { id: 'tt-n-m5', childId: 'student-002', weekday: 'Monday', startTime: '13:00', endTime: '13:40', subject: 'Physical Education', teacher: 'Coach Williams', room: 'Gym B', status: 'SCHEDULED', note: '' },
  // Noah — Tuesday
  { id: 'tt-n-t1', childId: 'student-002', weekday: 'Tuesday', startTime: '08:30', endTime: '09:20', subject: 'Science', teacher: 'Dr. Patel', room: 'C-108', status: 'SCHEDULED', note: '' },
  { id: 'tt-n-t2', childId: 'student-002', weekday: 'Tuesday', startTime: '09:30', endTime: '10:20', subject: 'French', teacher: 'Ms. Roberts', room: 'C-402', status: 'SCHEDULED', note: '' },
  { id: 'tt-n-t3', childId: 'student-002', weekday: 'Tuesday', startTime: '10:40', endTime: '11:20', subject: 'Mathematics', teacher: 'Mr. Collins', room: 'C-101', status: 'SCHEDULED', note: '' },
  { id: 'tt-n-t4', childId: 'student-002', weekday: 'Tuesday', startTime: '11:30', endTime: '12:10', subject: 'Art', teacher: 'Ms. Rivera', room: 'Art Studio', status: 'SCHEDULED', note: '' },
  { id: 'tt-n-t5', childId: 'student-002', weekday: 'Tuesday', startTime: '13:00', endTime: '13:40', subject: 'Music', teacher: 'Mr. Clarke', room: 'Music Room', status: 'SCHEDULED', note: '' },
  // Noah — Wednesday
  { id: 'tt-n-w1', childId: 'student-002', weekday: 'Wednesday', startTime: '08:30', endTime: '09:20', subject: 'English', teacher: 'Ms. Harper', room: 'C-205', status: 'SCHEDULED', note: '' },
  { id: 'tt-n-w2', childId: 'student-002', weekday: 'Wednesday', startTime: '09:30', endTime: '10:20', subject: 'Mathematics', teacher: 'Mr. Collins', room: 'C-101', status: 'SCHEDULED', note: '' },
  { id: 'tt-n-w3', childId: 'student-002', weekday: 'Wednesday', startTime: '10:40', endTime: '11:20', subject: 'Social Studies', teacher: 'Ms. Roberts', room: 'C-303', status: 'SCHEDULED', note: '' },
  { id: 'tt-n-w4', childId: 'student-002', weekday: 'Wednesday', startTime: '11:30', endTime: '12:10', subject: 'Computer Basics', teacher: 'Ms. Nakamura', room: 'IT Lab 1', status: 'SCHEDULED', note: '' },
  // Noah — Thursday (current day)
  { id: 'tt-n-th1', childId: 'student-002', weekday: 'Thursday', startTime: '08:30', endTime: '09:20', subject: 'Science', teacher: 'Dr. Patel', room: 'C-108', status: 'SCHEDULED', note: '' },
  { id: 'tt-n-th2', childId: 'student-002', weekday: 'Thursday', startTime: '09:30', endTime: '10:20', subject: 'English', teacher: 'Ms. Harper', room: 'C-205', status: 'SCHEDULED', note: '' },
  { id: 'tt-n-th3', childId: 'student-002', weekday: 'Thursday', startTime: '10:40', endTime: '11:20', subject: 'French', teacher: 'Substitute: Mr. Benoit', room: 'C-402', status: 'SUBSTITUTE', note: 'Ms. Roberts attending training — Mr. Benoit is covering.' },
  { id: 'tt-n-th4', childId: 'student-002', weekday: 'Thursday', startTime: '11:30', endTime: '12:10', subject: 'Mathematics', teacher: 'Mr. Collins', room: 'C-101', status: 'CANCELLED', note: 'Teacher absent — self-study period assigned.' },
  // Noah — Friday
  { id: 'tt-n-f1', childId: 'student-002', weekday: 'Friday', startTime: '08:30', endTime: '09:20', subject: 'Science', teacher: 'Dr. Patel', room: 'C-108', status: 'SCHEDULED', note: '' },
  { id: 'tt-n-f2', childId: 'student-002', weekday: 'Friday', startTime: '09:30', endTime: '10:20', subject: 'French', teacher: 'Ms. Roberts', room: 'C-402', status: 'SCHEDULED', note: '' },
  { id: 'tt-n-f3', childId: 'student-002', weekday: 'Friday', startTime: '10:40', endTime: '11:20', subject: 'Social Studies', teacher: 'Ms. Roberts', room: 'C-303', status: 'SCHEDULED', note: '' },
  { id: 'tt-n-f4', childId: 'student-002', weekday: 'Friday', startTime: '11:30', endTime: '12:10', subject: 'Physical Education', teacher: 'Coach Williams', room: 'Gym B', status: 'SCHEDULED', note: '' },
];

// ═══════════════════════════════════════ ASSIGNMENTS ═════════════════════════

export const parentAssignmentsDemo: ParentAssignmentDemo[] = [
  // Emma
  { id: 'as-001', childId: 'student-001', subject: 'History', title: 'Cold War Source Analysis', dueDate: '2026-03-07', status: 'IN_PROGRESS', teacherInstruction: 'Attach two source citations and one summary paragraph. Use the document pack from class.', attachmentCount: 1, submittedAt: null, grade: null, maxGrade: null },
  { id: 'as-002', childId: 'student-001', subject: 'Biology', title: 'Lab Report - Cell Respiration', dueDate: '2026-03-06', status: 'MISSING', teacherInstruction: 'Upload lab notebook scan and results table. Include conclusion paragraph with error analysis.', attachmentCount: 2, submittedAt: null, grade: null, maxGrade: null },
  { id: 'as-003', childId: 'student-001', subject: 'English Literature', title: 'Macbeth Character Essay', dueDate: '2026-03-10', status: 'NOT_STARTED', teacherInstruction: 'Write a 500-word essay analyzing Lady Macbeth\'s role. Use three textual references.', attachmentCount: 0, submittedAt: null, grade: null, maxGrade: null },
  { id: 'as-004', childId: 'student-001', subject: 'Mathematics', title: 'Quadratic Equations Problem Set', dueDate: '2026-03-04', status: 'SUBMITTED', teacherInstruction: 'Complete all exercises on pages 112-114. Show working for full marks.', attachmentCount: 1, submittedAt: '2026-03-04T16:20:00.000Z', grade: null, maxGrade: null },
  { id: 'as-005', childId: 'student-001', subject: 'Chemistry', title: 'Periodic Table Poster Project', dueDate: '2026-03-01', status: 'GRADED', teacherInstruction: 'Create a poster highlighting transition metals. Include real-world applications.', attachmentCount: 1, submittedAt: '2026-02-28T14:00:00.000Z', grade: 17, maxGrade: 20 },
  { id: 'as-006', childId: 'student-001', subject: 'French', title: 'Journal Entry — Weekend Plans', dueDate: '2026-03-09', status: 'NOT_STARTED', teacherInstruction: 'Write 150 words in French describing a fictional weekend. Use passé composé tense.', attachmentCount: 0, submittedAt: null, grade: null, maxGrade: null },
  { id: 'as-007', childId: 'student-001', subject: 'Geography', title: 'Urbanization Case Study', dueDate: '2026-02-25', status: 'RETURNED', teacherInstruction: 'Revisions needed on section 3. Resubmit by March 12.', attachmentCount: 1, submittedAt: '2026-02-24T10:30:00.000Z', grade: 12, maxGrade: 20 },
  // Noah
  { id: 'as-008', childId: 'student-002', subject: 'Mathematics', title: 'Fractions Worksheet 4B', dueDate: '2026-03-09', status: 'NOT_STARTED', teacherInstruction: 'Complete questions 1-25. Show all working steps.', attachmentCount: 0, submittedAt: null, grade: null, maxGrade: null },
  { id: 'as-009', childId: 'student-002', subject: 'Science', title: 'Plant Growth Observation', dueDate: '2026-03-03', status: 'LATE', teacherInstruction: 'Submit observation sheet and photo log. Record measurements in centimeters.', attachmentCount: 1, submittedAt: null, grade: null, maxGrade: null },
  { id: 'as-010', childId: 'student-002', subject: 'English', title: 'Book Report — Island of the Blue Dolphins', dueDate: '2026-03-12', status: 'IN_PROGRESS', teacherInstruction: 'Write a 300-word summary and personal reflection. Include character analysis.', attachmentCount: 0, submittedAt: null, grade: null, maxGrade: null },
  { id: 'as-011', childId: 'student-002', subject: 'Social Studies', title: 'Ancient Egypt Timeline', dueDate: '2026-03-02', status: 'GRADED', teacherInstruction: 'Draw a timeline from 3000 BC to 30 BC with at least 10 events.', attachmentCount: 1, submittedAt: '2026-03-01T11:45:00.000Z', grade: 19, maxGrade: 20 },
  { id: 'as-012', childId: 'student-002', subject: 'French', title: 'Vocabulary Flash Cards — Animals', dueDate: '2026-03-08', status: 'SUBMITTED', teacherInstruction: 'Create 20 flash cards with French word, English translation, and drawing.', attachmentCount: 0, submittedAt: '2026-03-05T08:10:00.000Z', grade: null, maxGrade: null },
];

// ═══════════════════════════════════════ EXAMS ═══════════════════════════════

export const parentExamsDemo: ParentExamDemo[] = [
  { id: 'ex-001', childId: 'student-001', subject: 'Mathematics', title: 'Quarterly Algebra Exam', date: '2026-03-12', startTime: '09:00', endTime: '10:30', room: 'Hall B', status: 'UPCOMING', instructions: 'Bring calculator. No phones. Formula sheet provided.', resultScore: null, resultMax: null },
  { id: 'ex-002', childId: 'student-001', subject: 'Biology', title: 'Practical Skills Assessment', date: '2026-03-14', startTime: '11:00', endTime: '12:00', room: 'Lab 3', status: 'UPCOMING', instructions: 'Lab coat and safety goggles required. Review cell respiration protocol.', resultScore: null, resultMax: null },
  { id: 'ex-003', childId: 'student-001', subject: 'English Literature', title: 'Macbeth Comprehension Test', date: '2026-03-19', startTime: '08:30', endTime: '09:30', room: 'A-305', status: 'UPCOMING', instructions: 'Closed-book. Review Acts 1-3.', resultScore: null, resultMax: null },
  { id: 'ex-004', childId: 'student-001', subject: 'History', title: 'Cold War Unit Test', date: '2026-02-20', startTime: '10:00', endTime: '11:00', room: 'Hall A', status: 'RESULT_PUBLISHED', instructions: 'All notes allowed.', resultScore: 78, resultMax: 100 },
  { id: 'ex-005', childId: 'student-001', subject: 'Chemistry', title: 'Periodic Table Quiz', date: '2026-02-14', startTime: '08:30', endTime: '09:00', room: 'Lab 1', status: 'RESULT_PUBLISHED', instructions: 'Quick quiz. 25 multiple choice.', resultScore: 22, resultMax: 25 },
  // Noah
  { id: 'ex-006', childId: 'student-002', subject: 'French', title: 'Vocabulary Quiz — Chapter 4', date: '2026-03-11', startTime: '08:45', endTime: '09:30', room: 'C-402', status: 'UPCOMING', instructions: 'Spelling counts. Prepare animal + food vocabulary lists.', resultScore: null, resultMax: null },
  { id: 'ex-007', childId: 'student-002', subject: 'Mathematics', title: 'Fractions & Decimals Test', date: '2026-03-18', startTime: '09:00', endTime: '10:00', room: 'C-101', status: 'UPCOMING', instructions: 'No calculator. Show all working.', resultScore: null, resultMax: null },
  { id: 'ex-008', childId: 'student-002', subject: 'Science', title: 'Unit 3 — Energy and Forces', date: '2026-03-25', startTime: '10:30', endTime: '11:30', room: 'C-108', status: 'UPCOMING', instructions: 'Review chapters 7-9. Bring colored pencils for diagrams.', resultScore: null, resultMax: null },
  { id: 'ex-009', childId: 'student-002', subject: 'Science', title: 'Unit 2 — Plant Biology', date: '2026-02-12', startTime: '10:00', endTime: '11:00', room: 'C-108', status: 'RESULT_PUBLISHED', instructions: '', resultScore: 36, resultMax: 40 },
  { id: 'ex-010', childId: 'student-002', subject: 'English', title: 'Spelling Bee — Class Round', date: '2026-02-07', startTime: '13:00', endTime: '14:00', room: 'C-205', status: 'COMPLETED', instructions: '', resultScore: null, resultMax: null },
];

// ═══════════════════════════════════════ GRADES ══════════════════════════════

export const parentGradesDemo: ParentGradeDemo[] = [
  // Emma — multiple assessments
  { id: 'gr-001', childId: 'student-001', subject: 'Mathematics', assessment: 'Quiz 5 — Quadratic Forms', type: 'QUIZ', score: 18, maxScore: 20, percentage: 90, letterGrade: 'A', teacherFeedback: 'Strong algebraic manipulation. Minor factoring slip on Q4.', gradedAt: '2026-03-01', published: true, strengths: 'Factoring, equation solving', areasForImprovement: 'Check negative coefficient signs' },
  { id: 'gr-002', childId: 'student-001', subject: 'History', assessment: 'Cold War Essay Draft', type: 'ESSAY', score: 14, maxScore: 20, percentage: 70, letterGrade: 'B-', teacherFeedback: 'Needs deeper argument structure. Good use of primary sources but conclusion is weak.', gradedAt: '2026-02-27', published: true, strengths: 'Source integration, chronological accuracy', areasForImprovement: 'Thesis clarity, conclusion paragraph' },
  { id: 'gr-003', childId: 'student-001', subject: 'Chemistry', assessment: 'Periodic Table Poster', type: 'PROJECT', score: 17, maxScore: 20, percentage: 85, letterGrade: 'A-', teacherFeedback: 'Creative layout. Real-world examples were well chosen.', gradedAt: '2026-03-03', published: true, strengths: 'Visual design, real-world connections', areasForImprovement: 'Add atomic mass for all elements shown' },
  { id: 'gr-004', childId: 'student-001', subject: 'English Literature', assessment: 'Macbeth Act 1 Comprehension', type: 'TEST', score: 15, maxScore: 20, percentage: 75, letterGrade: 'B', teacherFeedback: 'Good thematic understanding. Character motivation answers need more textual evidence.', gradedAt: '2026-02-20', published: true, strengths: 'Theme identification, vocabulary', areasForImprovement: 'Use direct quotations for character analysis' },
  { id: 'gr-005', childId: 'student-001', subject: 'Biology', assessment: 'Cell Structure Lab Practical', type: 'LAB', score: 16, maxScore: 20, percentage: 80, letterGrade: 'B+', teacherFeedback: 'Microscope technique was excellent. Written conclusions need more precision.', gradedAt: '2026-02-22', published: true, strengths: 'Practical skills, observation recording', areasForImprovement: 'Conclusion writing, error analysis' },
  { id: 'gr-006', childId: 'student-001', subject: 'History', assessment: 'Cold War Unit Test', type: 'EXAM', score: 78, maxScore: 100, percentage: 78, letterGrade: 'B+', teacherFeedback: 'Solid understanding of key events. Essay section could explore more counter-arguments.', gradedAt: '2026-02-21', published: true, strengths: 'Factual recall, timeline accuracy', areasForImprovement: 'Analytical depth in long answers' },
  { id: 'gr-007', childId: 'student-001', subject: 'Geography', assessment: 'Urbanization Case Study', type: 'PROJECT', score: 12, maxScore: 20, percentage: 60, letterGrade: 'C', teacherFeedback: 'Returned for revisions. Section 3 lacks statistical data. Resubmit by March 12.', gradedAt: '2026-02-26', published: true, strengths: 'Introduction and topic selection', areasForImprovement: 'Data presentation, statistical analysis, citation format' },
  // Noah — multiple assessments
  { id: 'gr-008', childId: 'student-002', subject: 'Science', assessment: 'Unit 2 Test — Plant Biology', type: 'EXAM', score: 36, maxScore: 40, percentage: 90, letterGrade: 'A', teacherFeedback: 'Excellent concept recall. Diagram labeling was perfect.', gradedAt: '2026-02-13', published: true, strengths: 'Diagram skills, terminology recall', areasForImprovement: 'Explain photosynthesis process in own words' },
  { id: 'gr-009', childId: 'student-002', subject: 'Mathematics', assessment: 'Multiplication Speed Drill', type: 'QUIZ', score: 24, maxScore: 25, percentage: 96, letterGrade: 'A+', teacherFeedback: 'Outstanding speed and accuracy. One careless error on 7×8.', gradedAt: '2026-02-28', published: true, strengths: 'Speed, accuracy, mental math', areasForImprovement: 'Double-check times tables for 7 and 8' },
  { id: 'gr-010', childId: 'student-002', subject: 'Social Studies', assessment: 'Ancient Egypt Timeline', type: 'PROJECT', score: 19, maxScore: 20, percentage: 95, letterGrade: 'A', teacherFeedback: 'Beautifully presented. Included 12 events with excellent descriptions.', gradedAt: '2026-03-03', published: true, strengths: 'Research depth, visual presentation', areasForImprovement: 'Add more about daily life for full marks' },
  { id: 'gr-011', childId: 'student-002', subject: 'English', assessment: 'Paragraph Writing — My Hero', type: 'HOMEWORK', score: 14, maxScore: 15, percentage: 93, letterGrade: 'A', teacherFeedback: 'Vivid language. Great use of adjectives. Minor punctuation fix needed.', gradedAt: '2026-02-25', published: true, strengths: 'Descriptive writing, vocabulary range', areasForImprovement: 'Comma usage in compound sentences' },
  { id: 'gr-012', childId: 'student-002', subject: 'French', assessment: 'Vocabulary Test — Chapter 3', type: 'TEST', score: 17, maxScore: 20, percentage: 85, letterGrade: 'A-', teacherFeedback: 'Good retention. Spelling errors on 3 words.', gradedAt: '2026-02-18', published: true, strengths: 'Pronunciation notes, sentence usage', areasForImprovement: 'Accent marks on French words' },
];

// ═══════════════════════════════════════ ATTENDANCE ══════════════════════════

export const parentAttendanceDemo: ParentAttendanceDemo[] = [
  // Emma — March (reverse chronological)
  { id: 'att-e-05', childId: 'student-001', date: '2026-03-05', status: 'PRESENT', note: 'Present. On time.', subject: null, period: null, explanationSubmitted: false },
  { id: 'att-e-04', childId: 'student-001', date: '2026-03-04', status: 'ABSENT', note: 'No explanation submitted by parent.', subject: null, period: null, explanationSubmitted: false },
  { id: 'att-e-03', childId: 'student-001', date: '2026-03-03', status: 'PRESENT', note: 'On time.', subject: null, period: null, explanationSubmitted: false },
  { id: 'att-e-02', childId: 'student-001', date: '2026-03-02', status: 'LATE', note: 'Arrived 8 minutes late. Traffic delay.', subject: null, period: null, explanationSubmitted: true },
  { id: 'att-e-01', childId: 'student-001', date: '2026-03-01', status: 'PRESENT', note: 'On time.', subject: null, period: null, explanationSubmitted: false },
  // Emma — February
  { id: 'att-e-f28', childId: 'student-001', date: '2026-02-28', status: 'PRESENT', note: 'On time.', subject: null, period: null, explanationSubmitted: false },
  { id: 'att-e-f27', childId: 'student-001', date: '2026-02-27', status: 'PRESENT', note: 'On time.', subject: null, period: null, explanationSubmitted: false },
  { id: 'att-e-f26', childId: 'student-001', date: '2026-02-26', status: 'ABSENT', note: 'Parent-submitted: Medical appointment.', subject: null, period: null, explanationSubmitted: true },
  { id: 'att-e-f25', childId: 'student-001', date: '2026-02-25', status: 'EXCUSED', note: 'School-approved family event.', subject: null, period: null, explanationSubmitted: true },
  { id: 'att-e-f24', childId: 'student-001', date: '2026-02-24', status: 'PRESENT', note: 'On time.', subject: null, period: null, explanationSubmitted: false },
  { id: 'att-e-f23', childId: 'student-001', date: '2026-02-23', status: 'PRESENT', note: 'On time.', subject: null, period: null, explanationSubmitted: false },
  { id: 'att-e-f22', childId: 'student-001', date: '2026-02-22', status: 'LATE', note: 'Arrived 15 minutes late. Bus delay.', subject: null, period: null, explanationSubmitted: true },
  { id: 'att-e-f21', childId: 'student-001', date: '2026-02-21', status: 'PRESENT', note: 'On time.', subject: null, period: null, explanationSubmitted: false },
  // Noah — March
  { id: 'att-n-05', childId: 'student-002', date: '2026-03-05', status: 'PRESENT', note: 'Present. On time.', subject: null, period: null, explanationSubmitted: false },
  { id: 'att-n-04', childId: 'student-002', date: '2026-03-04', status: 'LATE', note: 'Arrived 12 minutes late. Parent car trouble.', subject: null, period: null, explanationSubmitted: false },
  { id: 'att-n-03', childId: 'student-002', date: '2026-03-03', status: 'PRESENT', note: 'On time.', subject: null, period: null, explanationSubmitted: false },
  { id: 'att-n-02', childId: 'student-002', date: '2026-03-02', status: 'PRESENT', note: 'On time.', subject: null, period: null, explanationSubmitted: false },
  { id: 'att-n-01', childId: 'student-002', date: '2026-03-01', status: 'PRESENT', note: 'On time.', subject: null, period: null, explanationSubmitted: false },
  // Noah — February
  { id: 'att-n-f28', childId: 'student-002', date: '2026-02-28', status: 'PRESENT', note: 'On time.', subject: null, period: null, explanationSubmitted: false },
  { id: 'att-n-f27', childId: 'student-002', date: '2026-02-27', status: 'PRESENT', note: 'On time.', subject: null, period: null, explanationSubmitted: false },
  { id: 'att-n-f26', childId: 'student-002', date: '2026-02-26', status: 'ABSENT', note: 'Parent-submitted: Medical appointment.', subject: null, period: null, explanationSubmitted: true },
  { id: 'att-n-f25', childId: 'student-002', date: '2026-02-25', status: 'PRESENT', note: 'On time.', subject: null, period: null, explanationSubmitted: false },
  { id: 'att-n-f24', childId: 'student-002', date: '2026-02-24', status: 'PRESENT', note: 'On time.', subject: null, period: null, explanationSubmitted: false },
];

// ═══════════════════════════════════════ MESSAGES ════════════════════════════

export const parentMessageThreadsDemo: ParentMessageThreadDemo[] = [
  { id: 'msg-001', childId: 'student-001', subject: 'Biology lab report — Emma needs to resubmit', counterpart: 'Dr. Patel', counterpartRole: 'Biology Teacher', lastMessage: 'The lab report for cell respiration is still missing. Emma had the data but never uploaded the final document. Could you check at home?', lastMessageAt: '2026-03-05T08:40:00.000Z', unreadCount: 1, priority: 'HIGH', messageCount: 4, hasAttachment: false },
  { id: 'msg-002', childId: 'student-001', subject: 'History essay outline feedback', counterpart: 'Ms. Morgan', counterpartRole: 'History Teacher', lastMessage: 'Please review Emma\'s revised outline. I\'ve attached comments on the thesis statement.', lastMessageAt: '2026-03-04T14:20:00.000Z', unreadCount: 1, priority: 'MEDIUM', messageCount: 6, hasAttachment: true },
  { id: 'msg-003', childId: 'student-001', subject: 'Attendance concern — Emma was absent March 4', counterpart: 'Mr. Robert Johnson', counterpartRole: 'Homeroom Teacher', lastMessage: 'Just flagging that Emma was marked absent yesterday without prior notice. Please submit the absence explanation at your convenience.', lastMessageAt: '2026-03-05T07:15:00.000Z', unreadCount: 1, priority: 'HIGH', messageCount: 1, hasAttachment: false },
  { id: 'msg-004', childId: 'student-002', subject: 'Transport delay notification for Route B', counterpart: 'Transport Desk', counterpartRole: 'Administration', lastMessage: 'Route B will run 15-20 minutes late this week due to planned roadworks on Pine Avenue. We apologize for the inconvenience.', lastMessageAt: '2026-03-05T06:15:00.000Z', unreadCount: 1, priority: 'MEDIUM', messageCount: 2, hasAttachment: false },
  { id: 'msg-005', childId: 'student-002', subject: 'Noah\'s science observation project', counterpart: 'Dr. Patel', counterpartRole: 'Science Teacher', lastMessage: 'Noah\'s plant growth observation is overdue. He mentioned the photos were on a lost USB drive. Could you help locate it?', lastMessageAt: '2026-03-04T10:00:00.000Z', unreadCount: 0, priority: 'MEDIUM', messageCount: 3, hasAttachment: false },
  { id: 'msg-006', childId: null, subject: 'School policy acknowledgement — updated digital media policy', counterpart: 'Administration', counterpartRole: 'School Office', lastMessage: 'Please sign the updated digital media and photography policy form before March 15. This applies to all enrolled families.', lastMessageAt: '2026-03-03T15:00:00.000Z', unreadCount: 0, priority: 'LOW', messageCount: 1, hasAttachment: true },
  { id: 'msg-007', childId: null, subject: 'Invoice payment confirmation — INV-2026-082', counterpart: 'Finance Department', counterpartRole: 'Accounts', lastMessage: 'Your payment of €980 for Noah\'s March tuition has been received. Receipt is attached.', lastMessageAt: '2026-02-28T09:15:00.000Z', unreadCount: 0, priority: 'LOW', messageCount: 2, hasAttachment: true },
];

// ═══════════════════════════════════════ ANNOUNCEMENTS ═══════════════════════

export const parentAnnouncementsDemo: ParentAnnouncementDemo[] = [
  { id: 'ann-001', childId: null, title: 'Parent-Teacher Meeting Day — March 20', category: 'EVENT', body: 'Booking slots are now open for individual parent-teacher meetings on March 20. Please book through the portal by March 15. Meetings are 15 minutes each. Priority given to parents of students with flagged attendance or academic concerns.', createdAt: '2026-03-04T10:00:00.000Z', read: false, saved: true, author: 'Principal Dr. Martinez', hasAttachment: false },
  { id: 'ann-002', childId: 'student-001', title: 'Biology Practical Safety Checklist Required', category: 'ACADEMIC', body: 'All Grade 9 students must submit a signed safety checklist before the March 14 lab assessment. Forms are available in the Documents section. Students without signed forms will not be permitted to participate in the practical exam.', createdAt: '2026-03-03T09:30:00.000Z', read: false, saved: false, author: 'Dr. Patel — Biology Department', hasAttachment: true },
  { id: 'ann-003', childId: 'student-002', title: 'Route B Morning Pickup Time Change', category: 'TRANSPORT', body: 'Morning pickup at Pine Avenue has shifted from 07:10 to 07:20 for this week only due to roadworks. Afternoon drop-off times remain unchanged. Please ensure your child is ready by 07:15.', createdAt: '2026-03-05T05:45:00.000Z', read: false, saved: false, author: 'Transport Coordinator', hasAttachment: false },
  { id: 'ann-004', childId: null, title: 'March Fee Payment Reminder', category: 'FINANCE', body: 'This is a friendly reminder that all March tuition invoices are due by their stated dates. Families with overdue balances are encouraged to contact the finance office for installment plan options. Late fees may apply after 14 days.', createdAt: '2026-03-01T08:00:00.000Z', read: true, saved: false, author: 'Finance Department', hasAttachment: false },
  { id: 'ann-005', childId: null, title: 'Spring Sports Teams — Registration Open', category: 'EVENT', body: 'Registration for spring football, swimming, and athletics teams is open until March 10. Sign-up sheets are available at reception or online via the Events module. Practices begin March 17.', createdAt: '2026-02-28T11:00:00.000Z', read: true, saved: false, author: 'Coach Williams — Athletics Dept', hasAttachment: false },
  { id: 'ann-006', childId: 'student-001', title: 'Grade 9 Museum Field Trip — Permission Required', category: 'URGENT', body: 'The Grade 9 History class field trip to the National Museum is scheduled for March 22. Consent forms must be signed and submitted by March 8. Students without signed consent will remain at school with alternative work.', createdAt: '2026-03-02T14:00:00.000Z', read: false, saved: false, author: 'Ms. Morgan — History Department', hasAttachment: true },
  { id: 'ann-007', childId: 'student-002', title: 'Grade 6 Science Showcase — Volunteers Needed', category: 'EVENT', body: 'The annual Grade 6 Science Showcase is on March 18. We are looking for 4 parent volunteers to help set up displays and guide visitors. Please RSVP through the Events module if interested.', createdAt: '2026-03-01T12:30:00.000Z', read: true, saved: true, author: 'Dr. Patel — Science Department', hasAttachment: false },
  { id: 'ann-008', childId: null, title: 'Updated School Digital Media Policy', category: 'ACADEMIC', body: 'The school\'s digital media and photography policy has been updated. All families must acknowledge the new terms by March 15. The policy governs use of student images in school publications and social media. Review and sign through the Approvals module.', createdAt: '2026-02-25T16:00:00.000Z', read: true, saved: false, author: 'Administration', hasAttachment: true },
];

// ═══════════════════════════════════════ INVOICES ════════════════════════════

export const parentInvoicesDemo: ParentInvoiceDemo[] = [
  {
    id: 'INV-2026-104',
    childId: 'student-001',
    title: 'March Tuition — Emma Parentson',
    description: 'Monthly tuition fee for Grade 9-A including lab access and library.',
    dueDate: '2026-03-06',
    issuedAt: '2026-02-20',
    currency: 'USD',
    totalAmount: 1450,
    amountPaid: 450,
    status: 'OVERDUE',
    lineItems: [
      { label: 'Base Tuition — Grade 9', amount: 1200 },
      { label: 'Lab Access Fee', amount: 150 },
      { label: 'Library & Resource Fee', amount: 100 },
    ],
  },
  {
    id: 'INV-2026-118',
    childId: 'student-001',
    title: 'Lab Materials Fee — Biology Practical',
    description: 'Consumable materials for the Cell Respiration practical assessment.',
    dueDate: '2026-03-15',
    issuedAt: '2026-03-01',
    currency: 'USD',
    totalAmount: 120,
    amountPaid: 0,
    status: 'ISSUED',
    lineItems: [
      { label: 'Lab Kit — Cell Respiration Module', amount: 85 },
      { label: 'Safety Equipment Deposit', amount: 35 },
    ],
  },
  {
    id: 'INV-2026-125',
    childId: 'student-001',
    title: 'Museum Field Trip Fee',
    description: 'Grade 9 History class trip to the National Museum including transport and entry.',
    dueDate: '2026-03-18',
    issuedAt: '2026-03-03',
    currency: 'USD',
    totalAmount: 45,
    amountPaid: 0,
    status: 'ISSUED',
    lineItems: [
      { label: 'Museum Entry', amount: 15 },
      { label: 'Bus Charter (roundtrip)', amount: 25 },
      { label: 'Activity Pack', amount: 5 },
    ],
  },
  {
    id: 'INV-2026-082',
    childId: 'student-002',
    title: 'March Tuition — Noah Parentson',
    description: 'Monthly tuition fee for Grade 6-C including resource access.',
    dueDate: '2026-03-10',
    issuedAt: '2026-02-18',
    currency: 'EUR',
    totalAmount: 980,
    amountPaid: 980,
    status: 'PAID',
    lineItems: [
      { label: 'Base Tuition — Grade 6', amount: 880 },
      { label: 'Resource & Activity Fee', amount: 100 },
    ],
  },
  {
    id: 'INV-2026-091',
    childId: 'student-002',
    title: 'Transport Fee Q2 — Noah Parentson',
    description: 'Quarterly school bus transport — North Loop B (Jan-Mar 2026).',
    dueDate: '2026-01-15',
    issuedAt: '2026-01-05',
    currency: 'EUR',
    totalAmount: 350,
    amountPaid: 350,
    status: 'PAID',
    lineItems: [
      { label: 'Bus Pass Q2 2026 — North Loop B', amount: 350 },
    ],
  },
  {
    id: 'INV-2025-396',
    childId: 'student-001',
    title: 'February Tuition — Emma Parentson',
    description: 'Monthly tuition fee for Grade 9-A.',
    dueDate: '2026-02-06',
    issuedAt: '2026-01-20',
    currency: 'USD',
    totalAmount: 1450,
    amountPaid: 1450,
    status: 'PAID',
    lineItems: [
      { label: 'Base Tuition — Grade 9', amount: 1200 },
      { label: 'Lab Access Fee', amount: 150 },
      { label: 'Library & Resource Fee', amount: 100 },
    ],
  },
];

// ═══════════════════════════════════════ PAYMENTS ════════════════════════════

export const parentPaymentsDemo: ParentPaymentDemo[] = [
  { id: 'pay-001', invoiceId: 'INV-2026-104', childId: 'student-001', currency: 'USD', amount: 450, paidAt: '2026-03-01T14:20:00.000Z', method: 'Visa ending 4242 (Stripe)', reference: 'pi_3Qx1abc001' },
  { id: 'pay-002', invoiceId: 'INV-2026-082', childId: 'student-002', currency: 'EUR', amount: 980, paidAt: '2026-02-28T09:10:00.000Z', method: 'Mastercard ending 8520 (Stripe)', reference: 'pi_3Qx2def002' },
  { id: 'pay-003', invoiceId: 'INV-2026-091', childId: 'student-002', currency: 'EUR', amount: 350, paidAt: '2026-01-12T10:05:00.000Z', method: 'Bank Transfer', reference: 'BT-091-2026' },
  { id: 'pay-004', invoiceId: 'INV-2025-396', childId: 'student-001', currency: 'USD', amount: 1450, paidAt: '2026-02-04T16:30:00.000Z', method: 'Visa ending 4242 (Stripe)', reference: 'pi_3Qx3ghi003' },
];

// ═══════════════════════════════════════ RECEIPTS ════════════════════════════

export const parentReceiptsDemo: ParentReceiptDemo[] = [
  { id: 'rcp-001', invoiceId: 'INV-2026-082', childId: 'student-002', currency: 'EUR', amount: 980, issuedAt: '2026-02-28T09:12:00.000Z', fileName: 'receipt-INV-2026-082.pdf' },
  { id: 'rcp-002', invoiceId: 'INV-2026-104', childId: 'student-001', currency: 'USD', amount: 450, issuedAt: '2026-03-01T14:22:00.000Z', fileName: 'receipt-INV-2026-104-partial.pdf' },
  { id: 'rcp-003', invoiceId: 'INV-2026-091', childId: 'student-002', currency: 'EUR', amount: 350, issuedAt: '2026-01-12T10:08:00.000Z', fileName: 'receipt-INV-2026-091.pdf' },
  { id: 'rcp-004', invoiceId: 'INV-2025-396', childId: 'student-001', currency: 'USD', amount: 1450, issuedAt: '2026-02-04T16:32:00.000Z', fileName: 'receipt-INV-2025-396.pdf' },
];

// ═══════════════════════════════════════ APPROVALS ═══════════════════════════

export const parentApprovalsDemo: ParentApprovalDemo[] = [
  { id: 'apr-001', childId: 'student-001', title: 'Museum Field Trip Consent — March 22', type: 'PERMISSION_SLIP', description: 'Grade 9 History class trip to the National Museum. Students will depart at 08:00 and return by 15:30. Bus transport included. All students must bring packed lunch.', dueDate: '2026-03-08', status: 'PENDING', priority: 'HIGH', requestedBy: 'Ms. Morgan — History', requestedAt: '2026-03-02T14:00:00.000Z' },
  { id: 'apr-002', childId: 'student-001', title: 'Biology Lab Safety Acknowledgement', type: 'SAFETY_FORM', description: 'Parent acknowledgement of lab safety protocols for the Cell Respiration practical assessment. Student must wear lab coat and safety goggles at all times.', dueDate: '2026-03-10', status: 'PENDING', priority: 'HIGH', requestedBy: 'Dr. Patel — Biology', requestedAt: '2026-03-03T09:00:00.000Z' },
  { id: 'apr-003', childId: 'student-002', title: 'Updated Photography & Digital Media Policy', type: 'POLICY_ACKNOWLEDGMENT', description: 'All families must acknowledge the updated school policy regarding use of student images in publications, yearbooks, and social media. Review the full document before signing.', dueDate: '2026-03-12', status: 'PENDING', priority: 'MEDIUM', requestedBy: 'Administration', requestedAt: '2026-02-25T16:00:00.000Z' },
  { id: 'apr-004', childId: 'student-001', title: 'Spring Football Team — Registration Consent', type: 'ACTIVITY_CONSENT', description: 'Emma has expressed interest in joining the spring football team. Practices are Mon/Wed 16:00-17:30. Please confirm if she may participate.', dueDate: '2026-03-10', status: 'PENDING', priority: 'LOW', requestedBy: 'Coach Williams — Athletics', requestedAt: '2026-03-04T11:00:00.000Z' },
  { id: 'apr-005', childId: 'student-002', title: 'Annual Medical Information Update', type: 'MEDICAL_UPDATE', description: 'Please confirm or update Noah\'s medical information including allergies, medications, and emergency contact numbers for the school year.', dueDate: '2026-03-20', status: 'PENDING', priority: 'LOW', requestedBy: 'School Nurse — Ms. Campbell', requestedAt: '2026-03-01T08:00:00.000Z' },
];

// ═══════════════════════════════════════ TRANSPORT ═══════════════════════════

export const parentTransportDemo: ParentTransportDemo[] = [
  {
    id: 'trp-001',
    childId: 'student-001',
    routeName: 'North Loop A',
    pickupStop: 'Maple Street',
    dropStop: 'Academy Gate 2',
    pickupWindow: '07:05 – 07:15',
    dropWindow: '15:25 – 15:35',
    vehicle: 'Bus 12 (Reg: AB-1234)',
    driverName: 'Karim El Amrani',
    driverPhone: '+1 555-8801',
    status: 'ON_TIME',
    note: 'No incidents reported this week. Bus running on schedule.',
    lastUpdated: '2026-03-05T06:50:00.000Z',
  },
  {
    id: 'trp-002',
    childId: 'student-002',
    routeName: 'North Loop B',
    pickupStop: 'Pine Avenue',
    dropStop: 'Academy Gate 1',
    pickupWindow: '07:20 – 07:30',
    dropWindow: '15:10 – 15:20',
    vehicle: 'Bus 9 (Reg: CD-5088)',
    driverName: 'Nadia Toure',
    driverPhone: '+1 555-8802',
    status: 'DELAYED',
    note: 'Morning service delayed 15-20 min due to roadworks on Pine Avenue. Expected to clear by end of week.',
    lastUpdated: '2026-03-05T06:15:00.000Z',
  },
];

// ═══════════════════════════════════════ DOCUMENTS ═══════════════════════════

export const parentDocumentsDemo: ParentDocumentDemo[] = [
  { id: 'doc-001', childId: 'student-001', title: 'Term 1 Report Card — Emma Parentson', category: 'REPORT_CARD', status: 'AVAILABLE', updatedAt: '2026-02-15', fileSize: '1.2 MB', downloadUrl: '#' },
  { id: 'doc-002', childId: 'student-001', title: 'Lab Safety Acknowledgement Form', category: 'CONSENT_FORM', status: 'REQUESTED', updatedAt: '2026-03-03', fileSize: '245 KB', downloadUrl: '#' },
  { id: 'doc-003', childId: 'student-001', title: 'Museum Field Trip Consent Form', category: 'CONSENT_FORM', status: 'REQUESTED', updatedAt: '2026-03-02', fileSize: '180 KB', downloadUrl: '#' },
  { id: 'doc-004', childId: 'student-001', title: 'Receipt — INV-2026-104 (Partial)', category: 'RECEIPT', status: 'AVAILABLE', updatedAt: '2026-03-01', fileSize: '85 KB', downloadUrl: '#' },
  { id: 'doc-005', childId: 'student-001', title: 'Receipt — INV-2025-396', category: 'RECEIPT', status: 'AVAILABLE', updatedAt: '2026-02-04', fileSize: '90 KB', downloadUrl: '#' },
  { id: 'doc-006', childId: 'student-002', title: 'Term 1 Report Card — Noah Parentson', category: 'REPORT_CARD', status: 'AVAILABLE', updatedAt: '2026-02-15', fileSize: '1.1 MB', downloadUrl: '#' },
  { id: 'doc-007', childId: 'student-002', title: 'Receipt — INV-2026-082', category: 'RECEIPT', status: 'AVAILABLE', updatedAt: '2026-02-28', fileSize: '82 KB', downloadUrl: '#' },
  { id: 'doc-008', childId: 'student-002', title: 'Medical Information Update Form', category: 'MEDICAL_FORM', status: 'PENDING_UPLOAD', updatedAt: '2026-03-01', fileSize: '—', downloadUrl: null },
  { id: 'doc-009', childId: 'student-002', title: 'Transport Pass — Q2 2026', category: 'TRANSPORT', status: 'AVAILABLE', updatedAt: '2026-01-12', fileSize: '150 KB', downloadUrl: '#' },
  { id: 'doc-010', childId: 'student-001', title: 'Enrollment Certificate 2025-2026', category: 'CERTIFICATE', status: 'AVAILABLE', updatedAt: '2025-09-05', fileSize: '350 KB', downloadUrl: '#' },
  { id: 'doc-011', childId: 'student-002', title: 'Enrollment Certificate 2025-2026', category: 'CERTIFICATE', status: 'AVAILABLE', updatedAt: '2025-09-05', fileSize: '340 KB', downloadUrl: '#' },
];

// ═══════════════════════════════════════ EVENTS ══════════════════════════════

export const parentEventsDemo: ParentEventDemo[] = [
  { id: 'evt-001', childId: null, title: 'Parent-Teacher Meeting Day', type: 'MEETING', date: '2026-03-20', startTime: '09:00', endTime: '16:00', location: 'Main Hall — Individual Slots', description: 'Book a 15-minute slot with each teacher. Priority for flagged students. RSVP by March 15.', rsvpStatus: 'PENDING', rsvpDeadline: '2026-03-15', organizer: 'Principal Dr. Martinez' },
  { id: 'evt-002', childId: 'student-001', title: 'Biology Practical Orientation', type: 'ACADEMIC', date: '2026-03-10', startTime: '14:00', endTime: '15:00', location: 'Lab 3', description: 'Students and parents invited to review lab safety protocols before the March 14 assessment.', rsvpStatus: 'GOING', rsvpDeadline: '2026-03-08', organizer: 'Dr. Patel — Biology' },
  { id: 'evt-003', childId: 'student-002', title: 'Grade 6 Science Showcase', type: 'EVENT', date: '2026-03-18', startTime: '10:00', endTime: '12:30', location: 'Auditorium', description: 'Annual science project exhibition. Parents are welcome to attend and volunteer. Student displays will be judged by faculty.', rsvpStatus: 'PENDING', rsvpDeadline: '2026-03-14', organizer: 'Dr. Patel — Science' },
  { id: 'evt-004', childId: 'student-001', title: 'Museum Field Trip — Grade 9 History', type: 'FIELD_TRIP', date: '2026-03-22', startTime: '08:00', endTime: '15:30', location: 'National Museum (Bus from Academy)', description: 'Full-day trip. Students need signed consent form, packed lunch, and school uniform.', rsvpStatus: 'PENDING', rsvpDeadline: '2026-03-08', organizer: 'Ms. Morgan — History' },
  { id: 'evt-005', childId: null, title: 'Spring Sports Fair', type: 'EVENT', date: '2026-03-28', startTime: '13:00', endTime: '17:00', location: 'School Fields', description: 'Fun sports activities, team registration, and parent participation games. Refreshments available.', rsvpStatus: 'PENDING', rsvpDeadline: '2026-03-25', organizer: 'Coach Williams — Athletics' },
  { id: 'evt-006', childId: null, title: 'School Closed — Spring Break Begins', type: 'HOLIDAY', date: '2026-04-06', startTime: '', endTime: '', location: 'N/A', description: 'School closes for spring break April 6-17. Classes resume April 20.', rsvpStatus: 'GOING', rsvpDeadline: '', organizer: 'Administration' },
];

// ═══════════════════════════════════════ SUPPORT TICKETS ═════════════════════

export const parentSupportTicketsDemo: ParentSupportTicketDemo[] = [
  {
    id: 'sup-001',
    childId: 'student-001',
    category: 'FINANCE',
    subject: 'Request to split INV-2026-104 into installments',
    description: 'The March tuition for Emma is $1,450 and I was only able to pay $450 so far. I would like to request splitting the remaining $1,000 into two installments before end of March.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: '2026-03-02T09:30:00.000Z',
    updatedAt: '2026-03-04T11:00:00.000Z',
    responses: [
      { author: 'Finance Department', message: 'Thank you for reaching out. We are reviewing your request and will respond within 48 hours with available installment options.', createdAt: '2026-03-03T10:15:00.000Z' },
      { author: 'Finance Department', message: 'We can offer two installments: $500 due March 15 and $500 due March 30. Please confirm if this works for you.', createdAt: '2026-03-04T11:00:00.000Z' },
    ],
  },
  {
    id: 'sup-002',
    childId: null,
    category: 'TECHNICAL',
    subject: 'Cannot open receipt PDF on mobile browser',
    description: 'When I try to download receipt-INV-2026-082.pdf on my phone (Safari, iPhone 14), the file won\'t open. It works fine on desktop. I need the receipt for reimbursement.',
    priority: 'MEDIUM',
    status: 'OPEN',
    createdAt: '2026-03-05T07:45:00.000Z',
    updatedAt: '2026-03-05T07:45:00.000Z',
    responses: [],
  },
  {
    id: 'sup-003',
    childId: 'student-002',
    category: 'TRANSPORT',
    subject: 'Bus Route B delay affecting Noah\'s punctuality',
    description: 'Noah has been arriving late to school due to the Route B delay this week. His teacher marked him late on March 4. Can this be noted as transport-related and not counted against his record?',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    createdAt: '2026-03-04T08:30:00.000Z',
    updatedAt: '2026-03-04T15:00:00.000Z',
    responses: [
      { author: 'Transport Coordinator', message: 'We apologize for the inconvenience. I\'ve notified Noah\'s homeroom teacher that the delay is transport-related. The late mark for March 4 will be reviewed.', createdAt: '2026-03-04T15:00:00.000Z' },
    ],
  },
];

// ═══════════════════════════════════════ CALENDAR ════════════════════════════

export const parentCalendarDemo: ParentCalendarItemDemo[] = [
  { id: 'cal-001', childId: 'student-001', title: 'INV-2026-104 Overdue', date: '2026-03-06', type: 'FEE_DUE', module: 'fees_payments' },
  { id: 'cal-002', childId: 'student-001', title: 'Cold War Source Analysis Due', date: '2026-03-07', type: 'ASSIGNMENT_DUE', module: 'assignments' },
  { id: 'cal-003', childId: 'student-001', title: 'Museum Trip Consent Deadline', date: '2026-03-08', type: 'EVENT', module: 'approvals_forms' },
  { id: 'cal-004', childId: 'student-002', title: 'Fractions Worksheet 4B Due', date: '2026-03-09', type: 'ASSIGNMENT_DUE', module: 'assignments' },
  { id: 'cal-005', childId: 'student-001', title: 'Biology Practical Orientation', date: '2026-03-10', type: 'EVENT', module: 'events_meetings' },
  { id: 'cal-006', childId: 'student-002', title: 'French Vocabulary Quiz', date: '2026-03-11', type: 'EXAM', module: 'exams' },
  { id: 'cal-007', childId: 'student-001', title: 'Quarterly Algebra Exam', date: '2026-03-12', type: 'EXAM', module: 'exams' },
  { id: 'cal-008', childId: 'student-001', title: 'Biology Practical Assessment', date: '2026-03-14', type: 'EXAM', module: 'exams' },
  { id: 'cal-009', childId: 'student-001', title: 'Lab Materials Fee Due', date: '2026-03-15', type: 'FEE_DUE', module: 'fees_payments' },
  { id: 'cal-010', childId: 'student-002', title: 'Grade 6 Science Showcase', date: '2026-03-18', type: 'EVENT', module: 'events_meetings' },
  { id: 'cal-011', childId: 'student-001', title: 'Macbeth Comprehension Test', date: '2026-03-19', type: 'EXAM', module: 'exams' },
  { id: 'cal-012', childId: null, title: 'Parent-Teacher Meeting Day', date: '2026-03-20', type: 'MEETING', module: 'events_meetings' },
  { id: 'cal-013', childId: 'student-001', title: 'Museum Field Trip', date: '2026-03-22', type: 'EVENT', module: 'events_meetings' },
  { id: 'cal-014', childId: 'student-002', title: 'Energy & Forces Exam', date: '2026-03-25', type: 'EXAM', module: 'exams' },
  { id: 'cal-015', childId: null, title: 'Spring Sports Fair', date: '2026-03-28', type: 'EVENT', module: 'events_meetings' },
  { id: 'cal-016', childId: null, title: 'Spring Break Begins', date: '2026-04-06', type: 'HOLIDAY', module: 'events_meetings' },
];

// ═══════════════════════════════════════ HELPERS ═════════════════════════════

export function filterByChild<T extends { childId?: string | null }>(
  rows: T[],
  childId: string | null,
  scope: 'family' | 'child',
): T[] {
  if (scope === 'family' || !childId) return rows;
  return rows.filter((row) => row.childId === childId || row.childId == null);
}

export function filterChildren(
  rows: ParentChildDemo[],
  childId: string | null,
  scope: 'family' | 'child',
): ParentChildDemo[] {
  if (scope === 'family' || !childId) return rows;
  return rows.filter((row) => row.id === childId);
}

export function formatDateLabel(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTimeLabel(value: string): string {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

export function childDisplayName(childId: string): string {
  const child = parentChildrenDemo.find((entry) => entry.id === childId);
  if (!child) return 'Unknown child';
  return `${child.firstName} ${child.lastName}`;
}

export function getChildById(childId: string): ParentChildDemo | undefined {
  return parentChildrenDemo.find((entry) => entry.id === childId);
}
