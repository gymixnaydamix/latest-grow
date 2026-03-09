// =============================================================================
// GROW YouR NEED — Shared Type Definitions
// =============================================================================
// This file contains all types shared between frontend and backend.
// Aliased as @root/types in both workspaces.
// =============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export enum UserRole {
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
  FINANCE = 'FINANCE',
  MARKETING = 'MARKETING',
  SCHOOL = 'SCHOOL',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export enum AttendanceExplanationStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
}

export enum ApplicantStage {
  INQUIRY = 'INQUIRY',
  APPLICATION = 'APPLICATION',
  REVIEW = 'REVIEW',
  ACCEPTED = 'ACCEPTED',
  ENROLLED = 'ENROLLED',
  REJECTED = 'REJECTED',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PolicyStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum EventType {
  ACADEMIC = 'ACADEMIC',
  SPORTS = 'SPORTS',
  CULTURAL = 'CULTURAL',
  MEETING = 'MEETING',
  HOLIDAY = 'HOLIDAY',
  OTHER = 'OTHER',
}

export enum CampaignChannel {
  EMAIL = 'EMAIL',
  SOCIAL = 'SOCIAL',
  GOOGLE_ADS = 'GOOGLE_ADS',
  OTHER = 'OTHER',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

export enum FacilityStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum GoalStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
}

export enum FeedbackStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
}

export enum DigestFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

// ---------------------------------------------------------------------------
// User & Auth
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

// ---------------------------------------------------------------------------
// School
// ---------------------------------------------------------------------------

export interface SchoolBranding {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface School {
  id: string;
  name: string;
  branding: SchoolBranding;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolMember {
  id: string;
  userId: string;
  schoolId: string;
  role: UserRole;
  joinedAt: string;
  user?: User;
  school?: School;
}

// ---------------------------------------------------------------------------
// Academic
// ---------------------------------------------------------------------------

export interface Course {
  id: string;
  schoolId: string;
  departmentId?: string | null;
  name: string;
  description: string;
  gradeLevel: string;
  semester: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  teacher?: User;
  enrollments?: CourseEnrollment[];
  sessions?: CourseSession[];
  _count?: { enrollments: number; assignments: number; sessions?: number };
}

export interface Department {
  id: string;
  schoolId: string;
  name: string;
  description: string;
  headId: string | null;
  createdAt: string;
  updatedAt: string;
  head?: User;
  _count?: { courses: number };
}

export interface CurriculumStandard {
  id: string;
  schoolId: string;
  code: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  createdAt: string;
  updatedAt: string;
  _count?: { links: number };
}

export interface CourseCurriculumLink {
  id: string;
  courseId: string;
  standardId: string;
  createdAt: string;
  course?: Course;
  standard?: CurriculumStandard;
}

export interface CourseSession {
  id: string;
  courseId: string;
  title: string;
  type: string;        // LECTURE | LAB | TUTORIAL | EXAM
  dayOfWeek: number;   // 0=Sun .. 6=Sat
  startTime: string;   // "09:00"
  endTime: string;     // "10:30"
  room: string;
  recurring: boolean;
  startDate: string | null;
  endDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  course?: Course;
}

export interface CourseEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  status: string;
  student?: User;
  course?: Course;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  course?: Course;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  submittedAt: string;
  score: number | null;
  feedback: string | null;
  assignment?: Assignment;
  student?: User;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: AttendanceStatus;
  explanationStatus?: AttendanceExplanationStatus;
  explanationNote?: string | null;
  explainedAt?: string | null;
  explainedByParentId?: string | null;
  student?: User;
  course?: Course;
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  assignmentId: string | null;
  score: number;
  weight: number;
  gradedAt: string;
}

// ---------------------------------------------------------------------------
// Communication
// ---------------------------------------------------------------------------

export interface Announcement {
  id: string;
  schoolId: string;
  authorId: string;
  title: string;
  body: string;
  audience: UserRole[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

export interface MessageThread {
  id: string;
  subject: string;
  participantIds: string[];
  lastMessageAt: string;
  createdAt: string;
  isRead?: boolean;
  isStarred?: boolean;
  participants?: User[];
  messages?: Message[];
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  sender?: User;
}

// ---------------------------------------------------------------------------
// Finance
// ---------------------------------------------------------------------------

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  schoolId: string;
  parentId: string;
  studentId: string;
  items: InvoiceItem[];
  totalAmount: number;
  amountPaid: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  method: string;
  provider: string;
  providerPaymentId?: string | null;
  status: string;
  refundedAmount: number;
  transactionRef: string;
  paidAt: string;
}

export interface Budget {
  id: string;
  schoolId: string;
  department: string;
  fiscalYear: number;
  allocatedAmount: number;
  spentAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  period: string;
  grossAmount: number;
  deductions: Record<string, number>;
  netAmount: number;
  processedAt: string;
}

export interface TuitionPlan {
  id: string;
  schoolId: string;
  name: string;
  gradeLevel: string;
  amount: number;
  frequency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseRecord {
  id: string;
  schoolId: string;
  category: string;
  description: string;
  amount: number;
  vendor: string;
  status: string;
  incurredAt: string;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: User;
}

export interface FinancialReportCategorySummary {
  category: string;
  amount: number;
}

export interface FinancialReportSummary {
  schoolId: string;
  from: string;
  to: string;
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  totalExpenses: number;
  netCashflow: number;
  invoiceCount: number;
  paidInvoiceCount: number;
  overdueInvoiceCount: number;
  expenseCount: number;
  expenseByCategory: FinancialReportCategorySummary[];
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

export interface Facility {
  id: string;
  schoolId: string;
  name: string;
  type: string;
  capacity: number;
  status: FacilityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FacilityBooking {
  id: string;
  facilityId: string;
  reservedBy: string;
  startTime: string;
  endTime: string;
  purpose: string;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  schoolId: string;
  facilityId: string | null;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  requestedBy: string;
  requestedAt: string;
  resolvedAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  facility?: Facility;
  assignee?: User;
  requester?: User;
}

export interface TransportRoute {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  driverName: string;
  vehicleNumber: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { stops: number; assignments: number };
  stops?: TransportStop[];
}

export interface TransportStop {
  id: string;
  routeId: string;
  name: string;
  address: string;
  sequence: number;
  scheduledTime: string;
  createdAt: string;
  updatedAt: string;
  route?: TransportRoute;
}

export interface TransportAssignment {
  id: string;
  schoolId: string;
  routeId: string;
  userId: string;
  stopId: string | null;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  route?: TransportRoute;
  stop?: TransportStop | null;
  user?: User;
  _count?: { events: number };
}

export interface TransportTrackingEvent {
  id: string;
  assignmentId: string;
  status: string;
  note: string;
  recordedBy: string;
  recordedAt: string;
  assignment?: TransportAssignment;
  recorder?: User;
}

export interface LibraryItem {
  id: string;
  schoolId: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description: string;
  shelfLocation: string;
  totalCopies: number;
  availableCopies: number;
  publishedYear: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: { loans: number };
}

export interface LibraryLoan {
  id: string;
  schoolId: string;
  itemId: string;
  borrowerId: string;
  checkedOutAt: string;
  dueAt: string;
  returnedAt: string | null;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  item?: LibraryItem;
  borrower?: User;
}

export interface Policy {
  id: string;
  schoolId: string;
  title: string;
  body: string;
  version: number;
  status: PolicyStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolEvent {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: EventType;
  audience: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export interface StrategicGoal {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  progress: number;
  targetDate: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Admissions & Marketing
// ---------------------------------------------------------------------------

export interface Applicant {
  id: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  email: string;
  stage: ApplicantStage;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  schoolId: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  budget: number;
  startDate: string;
  endDate: string;
  metrics: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Parent-specific
// ---------------------------------------------------------------------------

export interface ParentChild {
  parentId: string;
  studentId: string;
  parent?: User;
  student?: User;
}

export interface ParentChildSummary {
  parentId: string;
  childIds: string[];
  children: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
  }>;
}

export interface SchoolManagedUserRow extends User {
  membership: {
    id: string;
    schoolId: string;
    role: UserRole | string;
    joinedAt: string;
  };
  parentChildrenCount?: number;
  parentLinksCount?: number;
}

export interface DailyDigestConfig {
  id: string;
  parentId: string;
  frequency: DigestFrequency;
  preferences: Record<string, boolean>;
}

export interface FeedbackSubmission {
  id: string;
  parentId: string;
  schoolId: string;
  category: string;
  body: string;
  status: FeedbackStatus;
  submittedAt: string;
}

export interface VolunteerOpportunity {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  date: string;
  spotsAvailable: number;
  createdAt: string;
}

export interface CafeteriaMenu {
  id: string;
  schoolId: string;
  date: string;
  meals: Record<string, string[]>;
}

export interface CafeteriaAccount {
  id: string;
  studentId: string;
  balance: number;
}

export interface Receipt {
  id: string;
  invoiceId: string;
  paymentId?: string | null;
  schoolId: string;
  parentId: string;
  studentId: string;
  amount: number;
  currency: string;
  provider: string;
  providerRef: string;
  fileName: string;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalRequest {
  id: string;
  schoolId: string;
  parentId: string;
  studentId: string;
  title: string;
  type: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  dueDate: string;
  decisionNote: string;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConsentForm {
  id: string;
  schoolId: string;
  parentId: string;
  studentId: string;
  approvalRequestId?: string | null;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  signedAt: string | null;
  signatureData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ParentDocument {
  id: string;
  schoolId: string;
  parentId: string;
  studentId: string;
  title: string;
  category: string;
  status: string;
  fileUrl: string;
  fileName: string;
  requestedAt: string | null;
  uploadedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  id: string;
  schoolId: string;
  studentId: string | null;
  title: string;
  subject: string;
  instructions: string;
  status: string;
  resultNote: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExamScheduleItem {
  id: string;
  examId: string;
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  schoolId: string;
  routeId?: string | null;
  code: string;
  plateNumber: string;
  capacity: number;
  driverName: string;
  driverPhone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  schoolId: string;
  parentId: string;
  studentId?: string | null;
  category: string;
  subject: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketReply {
  id: string;
  supportTicketId: string;
  authorId: string;
  message: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Parent V2 DTOs
// ---------------------------------------------------------------------------

export type ParentScopeMode = 'family' | 'child';
export type ParentWorkspaceItemKind = 'PIN' | 'RECENT';

export interface ParentMessageParticipantDTO {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole | string;
}

export interface ParentQuickActionDTO {
  id: string;
  label: string;
  count: number;
  route: string;
}

export interface ParentActionRequiredDTO {
  id: string;
  kind: 'invoice' | 'approval' | 'attendance' | 'message' | 'assignment' | 'event';
  childId: string | null;
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  route: string;
  quickActionLabel: string;
}

export interface ParentCalendarItemDTO {
  id: string;
  childId: string | null;
  title: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  type: string;
  route?: string;
}

export interface ParentTimelineItemDTO {
  id: string;
  childId: string | null;
  kind: 'grade' | 'attendance' | 'assignment' | 'message' | 'invoice' | 'event' | 'document' | 'approval';
  title: string;
  description: string;
  occurredAt: string;
  route?: string;
}

export interface ParentChildSummaryDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  className: string;
  section: string;
  gradeLevel: string;
  attendanceRate: number;
  averageGrade: number;
  attendanceFlag: 'ON_TRACK' | 'WATCH' | 'RISK';
  unreadMessages: number;
  pendingApprovals: number;
  nextExam: string | null;
  homeroomTeacher: string;
  emergencyContact: string;
}

export interface ParentChildDetailDTO {
  child: ParentChildSummaryDTO;
  academics: {
    recentGrades: ParentGradeDTO[];
    assignments: ParentAssignmentDTO[];
    exams: ParentExamDTO[];
    timetable: ParentTimetableItemDTO[];
  };
  attendance: {
    rate: number;
    records: ParentAttendanceDTO[];
    alerts: ParentAttendanceDTO[];
  };
  finance: {
    invoices: ParentInvoiceSummaryDTO[];
    outstandingBalance: number;
    currency: string;
  };
  transport: ParentTransportDTO | null;
  documents: ParentDocumentDTO[];
  services: {
    lunchMenu: ParentCafeteriaMenuDTO[];
    cafeteriaAccount: ParentCafeteriaAccountDTO | null;
  };
  timeline: ParentTimelineItemDTO[];
}

export interface ParentTimetableItemDTO {
  id: string;
  childId: string;
  weekday: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
  status: 'SCHEDULED' | 'CANCELLED' | 'SUBSTITUTE' | string;
}

export interface ParentAssignmentDTO {
  id: string;
  childId: string;
  subject: string;
  title: string;
  dueDate: string;
  status: 'NOT_STARTED' | 'SUBMITTED' | 'GRADED' | 'MISSING' | 'LATE' | string;
  teacherInstruction: string;
  attachmentCount: number;
  score?: number | null;
  maxScore?: number | null;
}

export interface ParentExamDTO {
  id: string;
  childId: string;
  subject: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  status: 'UPCOMING' | 'COMPLETED' | 'MISSED' | string;
  instructions?: string;
  resultNote?: string;
}

export interface ParentGradeDTO {
  id: string;
  childId: string;
  subject: string;
  assessment: string;
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  teacherFeedback: string;
  gradedAt: string;
  published: boolean;
}

export interface ParentAttendanceDTO {
  id: string;
  childId: string;
  date: string;
  status: AttendanceStatus;
  note: string;
  subject?: string | null;
  period?: number | null;
  explanationSubmitted: boolean;
  explanationStatus: AttendanceExplanationStatus;
  explanationNote: string | null;
  explainedAt: string | null;
  explainRoute?: string;
}

export interface ParentMessageThreadSummaryDTO {
  id: string;
  childId: string | null;
  subject: string;
  counterpart: string;
  counterpartRole: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  hasAttachment: boolean;
  messageCount: number;
}

export interface ParentMessageThreadDetailDTO {
  id: string;
  schoolId: string;
  childId: string | null;
  subject: string;
  participants: ParentMessageParticipantDTO[];
  messages: Array<{
    id: string;
    threadId: string;
    senderId: string;
    body: string;
    readAt: string | null;
    sentAt: string;
    sender: ParentMessageParticipantDTO | null;
  }>;
  lastMessageAt: string;
}

export interface ParentMessageRecipientDTO {
  id: string;
  childId: string | null;
  label: string;
  role: string;
  targetUserId: string;
}

export interface ParentAnnouncementDTO {
  id: string;
  childId: string | null;
  title: string;
  category: 'URGENT' | 'ACADEMIC' | 'EVENT' | 'FINANCE' | 'TRANSPORT' | string;
  body: string;
  createdAt: string;
  read: boolean;
  saved: boolean;
  author?: string;
  hasAttachment?: boolean;
}

export interface ParentInvoiceLineItemDTO {
  label: string;
  amount: number;
}

export interface ParentInvoiceSummaryDTO {
  id: string;
  childId: string;
  title: string;
  description: string;
  issuedAt: string;
  dueDate: string;
  status: InvoiceStatus | string;
  totalAmount: number;
  amountPaid: number;
  currency: string;
  lineItems: ParentInvoiceLineItemDTO[];
}

export interface ParentInvoiceDetailDTO extends ParentInvoiceSummaryDTO {
  payments: ParentPaymentDTO[];
  receipts: ParentReceiptDTO[];
  statementUrl: string | null;
}

export interface ParentPaymentDTO {
  id: string;
  invoiceId: string;
  childId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  paidAt: string;
  reference: string;
  provider: string;
}

export interface ParentReceiptDTO {
  id: string;
  invoiceId: string;
  childId: string;
  amount: number;
  currency: string;
  fileName: string;
  fileUrl: string;
  issuedAt: string;
}

export interface ParentApprovalDTO {
  id: string;
  childId: string;
  title: string;
  type: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  dueDate: string;
  decisionNote: string;
  decidedAt: string | null;
  requestedBy: string;
  requestedAt: string;
}

export interface ParentTransportDTO {
  id: string;
  childId: string;
  routeName: string;
  pickupStop: string;
  dropStop: string;
  pickupWindow: string;
  dropWindow: string;
  vehicle: string;
  driverName: string;
  status: 'ON_TIME' | 'DELAYED' | 'CANCELLED' | string;
  note: string;
}

export interface ParentDocumentDTO {
  id: string;
  childId: string;
  title: string;
  category: string;
  status: 'AVAILABLE' | 'REQUESTED' | 'UPLOADED' | string;
  fileUrl: string;
  fileName: string;
  fileSize?: string | null;
  requestedAt: string | null;
  uploadedAt: string | null;
  updatedAt: string;
}

export interface ParentEventDTO {
  id: string;
  childId: string | null;
  title: string;
  type: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  location: string;
  description?: string;
  organizer?: string;
  rsvpStatus: 'PENDING' | 'GOING' | 'NOT_GOING' | string;
  rsvpDeadline?: string | null;
}

export interface ParentProfileDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  locale: string;
  theme: string;
  preferences: Record<string, boolean>;
  linkedChildren: ParentChildSummaryDTO[];
}

export interface ParentSupportTicketSummaryDTO {
  id: string;
  childId: string | null;
  category: string;
  subject: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | string;
  createdAt: string;
  updatedAt: string;
}

export interface ParentSupportTicketDetailDTO extends ParentSupportTicketSummaryDTO {
  description: string;
  replies: Array<{
    id: string;
    authorId: string;
    authorLabel: string;
    authorRole: string;
    message: string;
    createdAt: string;
  }>;
}

export interface ParentFeedbackDTO {
  id: string;
  schoolId: string;
  category: string;
  body: string;
  status: FeedbackStatus;
  submittedAt: string;
}

export interface ParentVolunteerOpportunityDTO {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  date: string;
  spotsAvailable: number;
  signedUp: boolean;
  signUpsCount: number;
}

export interface ParentDailyDigestConfigDTO {
  id: string;
  frequency: DigestFrequency;
  preferences: Record<string, boolean>;
}

export interface ParentCafeteriaMenuDTO {
  id: string;
  date: string;
  meals: Record<string, string[]>;
}

export interface ParentCafeteriaAccountDTO {
  id: string;
  studentId: string;
  balance: number;
}

export interface ParentWorkspaceItemDTO {
  id: string;
  itemId: string;
  label: string;
  moduleId: string;
  childId: string | null;
  kind: ParentWorkspaceItemKind;
  createdAt: string;
  updatedAt: string;
}

export interface ParentHomeDTO {
  children: ParentChildSummaryDTO[];
  quickActions: ParentQuickActionDTO[];
  actionRequired: ParentActionRequiredDTO[];
  todayTimetable: ParentTimetableItemDTO[];
  announcements: ParentAnnouncementDTO[];
  invoices: ParentInvoiceSummaryDTO[];
  approvals: ParentApprovalDTO[];
  messages: ParentMessageThreadSummaryDTO[];
  events: ParentEventDTO[];
  assignments: ParentAssignmentDTO[];
  attendanceAlerts: ParentAttendanceDTO[];
  exams: ParentExamDTO[];
  calendarItems: ParentCalendarItemDTO[];
  timeline: ParentTimelineItemDTO[];
}

export interface GuardianRelationship {
  parentId: string;
  studentId: string;
}

// ---------------------------------------------------------------------------
// AI Service
// ---------------------------------------------------------------------------

export interface AIGenerateRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIChatRequest {
  messages: AIChatMessage[];
  maxTokens?: number;
  temperature?: number;
}

// ---------------------------------------------------------------------------
// Dashboard & Analytics
// ---------------------------------------------------------------------------

export interface DashboardKPI {
  label: string;
  value: number | string;
  change: number;
  changeLabel: string;
  trend: 'up' | 'down' | 'neutral';
  /** Optional sparkline data points (e.g. 7-day history) */
  sparklineData?: number[] | null;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  user?: User;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  GRADE = 'GRADE',
  ATTENDANCE = 'ATTENDANCE',
  ASSIGNMENT = 'ASSIGNMENT',
  MESSAGE = 'MESSAGE',
  SYSTEM = 'SYSTEM',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface WebSocketEvent<T = unknown> {
  event: string;
  data: T;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// API Response Wrappers
// ---------------------------------------------------------------------------

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ---------------------------------------------------------------------------
// Gamification
// ---------------------------------------------------------------------------

export interface GamificationMetric {
  id: string;
  label: string;
  value: string;
  trend?: string;
  tone?: 'emerald' | 'blue' | 'amber' | 'violet' | 'rose' | 'slate';
  detail?: string;
}

export interface GamificationSeriesPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface GamificationTableColumn {
  id: string;
  label: string;
}

export interface GamificationTableRow {
  id: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface GamificationTableData {
  columns: GamificationTableColumn[];
  rows: GamificationTableRow[];
}

export interface GamificationQueueItem {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  meta: string;
}

export interface GamificationAuditEntry {
  id: string;
  actor: string;
  action: string;
  detail: string;
  timestamp: string;
}

export interface GamificationVersion {
  id: string;
  label: string;
  summary: string;
  author: string;
  createdAt: string;
}

export interface GamificationBuilderDraft {
  title: string;
  summary: string;
  segment: string;
  status: string;
  scheduleStart: string;
  scheduleEnd: string;
  owner: string;
  notes: string;
  automationEnabled: boolean;
}

export interface GamificationPageCapabilities {
  canEdit: boolean;
  canPublish: boolean;
  canRollback: boolean;
  canExport: boolean;
  canBulkManage: boolean;
}

export interface GamificationCardPayload {
  cardId: string;
  stat?: string;
  statDetail?: string;
  table?: GamificationTableData;
  series?: GamificationSeriesPoint[];
  queue?: GamificationQueueItem[];
  tags?: string[];
  notes?: string[];
}

export interface GamificationPagePayload {
  pageId: string;
  route: string;
  title: string;
  pagePurpose: string;
  lastUpdatedAt: string;
  heroMetrics: GamificationMetric[];
  draft: GamificationBuilderDraft;
  capabilities: GamificationPageCapabilities;
  cards: GamificationCardPayload[];
  versions: GamificationVersion[];
  auditTrail: GamificationAuditEntry[];
}

export interface GamificationActionResult {
  pageId: string;
  action: string;
  message: string;
  audit: GamificationAuditEntry;
}

export interface GamificationBootstrapDTO {
  defaultPrimary: string;
  defaultSecondary: string;
  allowedRoles: UserRole[];
  capabilities: GamificationPageCapabilities;
}

export interface Quiz {
  id: string;
  title: string;
  status: string;
  difficulty: string;
  completionRate: number;
}

export interface QuizSection {
  id: string;
  quizId: string;
  title: string;
  order: number;
}

export interface Question {
  id: string;
  quizId: string;
  prompt: string;
  type: string;
  difficulty: string;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  label: string;
  isCorrect: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  status: string;
  participationMode: string;
}

export interface ChallengeMilestone {
  id: string;
  challengeId: string;
  title: string;
  completionRate: number;
}

export interface Reward {
  id: string;
  title: string;
  type: string;
  pointsCost: number;
  status: string;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  userId: string;
  status: string;
  redeemedAt: string;
}

export interface Badge {
  id: string;
  title: string;
  rarity: string;
  status: string;
}

export interface PointRule {
  id: string;
  title: string;
  trigger: string;
  delta: number;
}

export interface PointTransaction {
  id: string;
  userId: string;
  source: string;
  delta: number;
  createdAt: string;
}

export interface Leaderboard {
  id: string;
  title: string;
  status: string;
  visibility: string;
}

export interface LeaderboardSeason {
  id: string;
  leaderboardId: string;
  label: string;
  status: string;
}

export interface EngagementMetric {
  id: string;
  label: string;
  value: number;
  recordedAt: string;
}

export interface PerformanceMetric {
  id: string;
  label: string;
  value: number;
  recordedAt: string;
}

export interface ProgressRecord {
  id: string;
  subjectId: string;
  stage: string;
  completionRate: number;
}

export interface SavedReport {
  id: string;
  title: string;
  owner: string;
  lastRunAt: string;
}

export interface ScheduledExportJob {
  id: string;
  label: string;
  frequency: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Platform Tenant Management
// ---------------------------------------------------------------------------

export enum TenantType {
  SCHOOL = 'SCHOOL',
  INDIVIDUAL = 'INDIVIDUAL',
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  TRIAL = 'TRIAL',
  SUSPENDED = 'SUSPENDED',
  CHURNED = 'CHURNED',
}

export enum PlatformInvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export interface Tenant {
  id: string;
  name: string;
  type: TenantType;
  email: string;
  phone: string;
  plan: string;
  mrr: number;
  userCount: number;
  status: TenantStatus;
  schoolId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  school?: {
    id: string;
    name: string;
    address: string | null;
    website: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
}

export interface TenantStats {
  total: number;
  active: number;
  trial: number;
  churned: number;
  totalMrr: number;
}

export interface BulkImportResult {
  created: number;
  skipped: number;
  errors: string[];
}

export interface InviteResult {
  sent: number;
  results: Array<{ tenantId: string; email: string; status: 'queued' }>;
}

export interface PlatformPlan {
  id: string;
  name: string;
  price: number;
  maxUsers: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformInvoice {
  id: string;
  tenantId: string;
  amount: number;
  status: PlatformInvoiceStatus;
  method: string;
  dueDate: string;
  issuedDate: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  tenant?: { id: string; name: string; email: string };
}

export interface PlatformInvoiceStats {
  totalBilled: number;
  totalCount: number;
  paid: { amount: number; count: number };
  pending: { amount: number; count: number };
  overdue: { amount: number; count: number };
}

export interface PaymentGateway {
  id: string;
  name: string;
  status: string;
  apiKey: string;
  webhookUrl: string;
  transactions: number;
  volume: number;
  pct: number;
  color: string;
  lastSyncAt: string;
  createdAt: string;
  updatedAt: string;
}
//
// ---------------------------------------------------------------------------
// CRM
// ---------------------------------------------------------------------------

export enum DealStage {
  PROSPECT = 'PROSPECT',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
}

export interface CrmDeal {
  id: string;
  name: string;
  value: number;
  stage: DealStage;
  probability: number;
  tenantId: string | null;
  contactName: string;
  contactEmail: string;
  notes: string;
  expectedCloseDate: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tenant?: { id: string; name: string; type: string };
}

export interface CrmDealStats {
  totalDeals: number;
  pipelineValue: number;
  wonDeals: number;
  lostDeals: number;
  winRate: number;
  avgDealSize: number;
}

export interface DealsByStage {
  stage: string;
  deals: CrmDeal[];
  count: number;
  totalValue: number;
}

export interface CrmAccount {
  id: string;
  tenantId: string;
  healthScore: number;
  lastTouchAt: string;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  tenant?: {
    id: string;
    name: string;
    type: string;
    email: string;
    mrr: number;
    userCount: number;
    status: string;
  };
}

// ---------------------------------------------------------------------------
// Provider Console DTOs
// ---------------------------------------------------------------------------

export interface ProviderActionInboxItem {
  id: string;
  type: string;
  tenantId: string | null;
  tenantName: string;
  title: string;
  owner: string;
  status: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  slaTargetAt: string;
}

export interface TenantHealthRecord {
  tenantId: string;
  tenantName: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  incidentsOpen: number;
  billingStatus: 'GOOD' | 'DUE' | 'FAILED';
  usagePct: number;
  lastActivityAt: string;
}

export interface OnboardingPipelineCard {
  stage: string;
  label: string;
  count: number;
}

export interface BillingExceptionItem {
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
}

export interface UsageLimitState {
  id: string;
  tenantId: string;
  metricType: string;
  softLimit: number;
  hardLimit: number;
  currentValue: number;
  overageEnabled: boolean;
  blockPolicy: string;
}

export interface SupportTicketDTO {
  id: string;
  tenantId: string;
  category: 'BILLING' | 'ONBOARDING' | 'BUG' | 'FEATURE_REQUEST' | 'URGENT';
  subject: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'NEW' | 'IN_PROGRESS' | 'WAITING_ON_CUSTOMER' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
  assignee: string;
  requesterEmail: string;
  slaTargetAt: string;
  createdAt: string;
}

export interface IncidentDTO {
  id: string;
  code: string;
  title: string;
  severity: 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4';
  status: 'OPEN' | 'MONITORING' | 'RESOLVED';
  commander: string;
  affectedServices: string[];
  tenantIds: string[];
  updatedAt: string;
}

export interface FeatureFlagRuleDTO {
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
}

export interface ComplianceRequestDTO {
  id: string;
  tenantId: string;
  state: string;
  createdAt: string;
  completedAt?: string | null;
  requestType?: string;
  mode?: string;
  legalBasis?: string;
  requestedBy: string;
}

export interface AuditEventDTO {
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
}

// ---------------------------------------------------------------------------
// Teacher DTOs
// ---------------------------------------------------------------------------

export interface TeacherProfileDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  department: string;
  title: string;
  phone: string;
  bio: string;
  subjectAreas: string[];
  schoolId: string;
}

export interface TeacherScheduleItem {
  id: string;
  time: string;
  endTime: string;
  title: string;
  type: string;
  room: string;
  classId?: string;
  studentCount?: number;
  notes?: string;
}

export interface TeacherActionItem {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  dueBy: string;
  classId?: string;
}

export interface TeacherStudentAlert {
  id: string;
  studentName: string;
  studentInitials: string;
  className: string;
  classId: string;
  alert: string;
  severity: string;
  timestamp: string;
}

export interface TeacherGradingQueueItem {
  id: string;
  assignment: string;
  className: string;
  classId: string;
  submitted: number;
  total: number;
  dueDate: string;
  type: string;
}

export interface TeacherClass {
  id: string;
  name: string;
  subject: string;
  gradeLevel: string;
  period: number;
  room: string;
  studentCount: number;
  avgGrade: number;
  nextSession: string;
  color: string;
}

export interface TeacherAttendanceStudent {
  id: string;
  name: string;
  initials: string;
  streak: number;
  overallRate: number;
}

export interface TeacherAttendanceHistoryItem {
  id: string;
  classId: string;
  className: string;
  date: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
}

export interface TeacherLessonPlan {
  id: string;
  title: string;
  className: string;
  classId: string;
  date: string;
  duration: string;
  objectives: string[];
  status: string;
  resources: string[];
}

export interface TeacherAssignment {
  id: string;
  title: string;
  className: string;
  classId: string;
  type: string;
  dueDate: string;
  assignedDate: string;
  totalPoints: number;
  submitted: number;
  total: number;
  avgScore: number | null;
  status: string;
}

export interface TeacherGradebookData {
  students: Array<{
    id: string;
    name: string;
    scores: Record<string, number | null>;
    average: number;
    letterGrade: string;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    weight: number;
    maxScore: number;
  }>;
}

export interface TeacherCommentBankItem {
  id: string;
  category: string;
  text: string;
  uses: number;
}

export interface TeacherExam {
  id: string;
  title: string;
  subject: string;
  className: string;
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  totalStudents: number;
  status: string;
  avgScore?: number;
}

export interface TeacherMessageThread {
  id: string;
  subject: string;
  participants: string[];
  lastMessage: string;
  lastSender: string;
  timestamp: string;
  unread: boolean;
  category: string;
}

export interface TeacherAnnouncement {
  id: string;
  title: string;
  body: string;
  author: string;
  audience: string;
  publishedAt: string;
  priority: string;
  read: boolean;
}

export interface TeacherBehaviorNote {
  id: string;
  studentName: string;
  studentInitials: string;
  className: string;
  classId: string;
  type: string;
  note: string;
  date: string;
  followUp?: string;
}

export interface TeacherMeeting {
  id: string;
  title: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  attendees: string[];
  notes?: string;
  status: string;
}

export interface TeacherClassPerformance {
  classId: string;
  className: string;
  avgGrade: number;
  passRate: number;
  attendanceRate: number;
  assignmentCompletion: number;
  topStudents: string[];
  atRiskStudents: string[];
}

export interface TeacherClassDetail {
  id: string;
  name: string;
  subject: string;
  gradeLevel: string;
  period: number;
  room: string;
  studentCount: number;
  avgGrade: number;
  nextSession: string;
  color: string;
  attendanceRate: number;
  assignmentCompletion: number;
  upcomingAssignments: number;
  recentAssignments: Array<{ id: string; title: string; type: string; dueDate: string; avgScore: number | null; status: string }>;
  students: Array<TeacherClassStudent>;
}

export interface TeacherClassStudent {
  id: string;
  name: string;
  initials: string;
  email: string;
  average: number;
  letterGrade: string;
  attendanceRate: number;
  streak: number;
  missingAssignments: number;
  status: 'on-track' | 'at-risk' | 'excelling';
}

// ---------------------------------------------------------------------------
// Teacher Messaging Settings Types
// ---------------------------------------------------------------------------

export interface TeacherMsgDefaults {
  autoReplyEnabled: boolean;
  autoReplyMessage: string;
  defaultSignature: string;
  threadRetentionDays: number;
  maxAttachmentSizeMb: number;
  allowStudentMessages: boolean;
  allowParentMessages: boolean;
  requireApproval: boolean;
}

export interface TeacherMsgReplySettings {
  defaultReplyMode: 'reply' | 'reply_all';
  includeOriginal: boolean;
  quickReplies: string[];
}

export interface TeacherMsgScheduling {
  sendWindowStart: string;
  sendWindowEnd: string;
  timezone: string;
  delayedSendEnabled: boolean;
  schedulingEnabled: boolean;
}

export interface TeacherMsgNotifChannels {
  email: boolean;
  push: boolean;
  inApp: boolean;
  sms: boolean;
}

export interface TeacherMsgNotifRule {
  id: string;
  name: string;
  condition: 'all_messages' | 'urgent_only' | 'from_parents' | 'from_admin' | 'from_students' | 'mentions';
  action: 'notify_immediately' | 'digest_hourly' | 'digest_daily' | 'silent';
  enabled: boolean;
}

export interface TeacherMsgQuietHours {
  enabled: boolean;
  startTime: string;
  endTime: string;
  weekendsOnly: boolean;
  allowUrgent: boolean;
}

export interface TeacherSLAPolicy {
  id: string;
  name: string;
  description: string;
  category: 'parent' | 'student' | 'admin' | 'staff' | 'urgent';
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

export interface TeacherSLAEscalationRule {
  id: string;
  name: string;
  triggerAfterMinutes: number;
  escalateTo: string;
  notifyVia: 'email' | 'push' | 'sms' | 'all';
  policyId: string | null;
  enabled: boolean;
}

export interface TeacherLegalTemplate {
  id: string;
  name: string;
  category: 'consent' | 'privacy' | 'liability' | 'agreement' | 'notice' | 'other';
  subject: string;
  body: string;
  requiredFields: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherLegalCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
  description: string;
}

export interface TeacherEmailTemplate {
  id: string;
  name: string;
  category: 'welcome' | 'reminder' | 'alert' | 'report' | 'announcement' | 'custom';
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherEmailVariable {
  name: string;
  description: string;
  example: string;
}

export interface TeacherMsgAppearanceTheme {
  primaryColor: string;
  sentBubbleColor: string;
  receivedBubbleColor: string;
  fontSize: 'small' | 'medium' | 'large';
  darkMode: boolean;
}

export interface TeacherMsgAppearanceLayout {
  chatListPosition: 'left' | 'right';
  showAvatars: boolean;
  compactMode: boolean;
  showTimestamps: boolean;
  previewLines: number;
}

export interface TeacherMsgSignature {
  enabled: boolean;
  text: string;
  includeTitle: boolean;
  includePhone: boolean;
  includeSchool: boolean;
}

// ---------------------------------------------------------------------------
// Analytics DTOs (Provider Dashboard)
// ---------------------------------------------------------------------------

export interface AnalyticsOverviewDTO {
  kpis: Array<{ label: string; value: string; change: string; sparkline: number[] }>;
  topPages: Array<{ page: string; views: string; pct: number }>;
  mrrData: Array<{ month: string; mrr: number }>;
}

export interface MarketIntelDTO {
  kpis: Array<{ label: string; value: string; change: string; sparkline: number[] }>;
  competitors: Array<{ name: string; threat: string }>;
}

export interface SystemHealthDTO {
  kpis: Array<{ label: string; value: string; change: string; sparkline: number[] }>;
  services: Array<{ name: string; status: string }>;
  gauges: Array<{ label: string; pct: number; color: string }>;
}
