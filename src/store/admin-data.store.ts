/* ══════════════════════════════════════════════════════════════════════
 * Admin Data Store — Zustand in-memory reactive store
 * Provides complete CRUD for all school entities seeded from demo data.
 * Each slice: items[], add, update, remove, getById.
 * Replace demo-data imports with useAdminStore() selectors for reactivity.
 * ══════════════════════════════════════════════════════════════════════ */
import { create } from 'zustand';
import type { LucideIcon } from 'lucide-react';
import type { KanbanColumn } from '@/components/features/school-admin';

/* ─────────────────── Entity Types ─────────────────── */

export interface ActionItem {
  id: string;
  title: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: string;
  dueDate: string;
  owner: string;
  deepLink?: { section: string; header?: string };
}

export interface ApprovalItem {
  id: string;
  title: string;
  description: string;
  type: string;
  requestedBy: string;
  requestedAt: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  icon?: LucideIcon;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: string;
  color: string;
  description?: string;
}

export interface SchoolIssue {
  id: string;
  type: string;
  desc: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'assigned' | 'resolved';
  assignee?: string;
  resolution?: string;
  reportedAt: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  rollNo: string;
  guardian: string;
  guardianPhone?: string;
  guardianEmail?: string;
  status: string;
  attendance: string;
  gpa: string;
  feeStatus: string;
  joinDate: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  department: string;
  role: string;
  status: string;
  joinDate: string;
  email: string;
  phone: string;
  leaveBalance: string;
  salary?: string;
  emergencyContact?: string;
  qualification?: string;
}

export interface LeaveRequest {
  id: string;
  staff: string;
  staffId?: string;
  department: string;
  type: string;
  dates: string;
  days: number;
  status: string;
  substitute: string;
  reason: string;
  rejectionReason?: string;
}

export interface AcademicClass {
  id: string;
  name: string;
  level: string;
  section: string;
  classTeacher: string;
  students: number;
  capacity: number;
  room: string;
  subjects: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  credits: number;
  teacher: string;
  classes: string;
  periods: number;
}

export interface Exam {
  id: string;
  subject: string;
  grade: string;
  date: string;
  time: string;
  room: string;
  invigilator: string;
  status: string;
  duration?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  student: string;
  grade: string;
  amount: string;
  paid: string;
  balance: string;
  status: string;
  dueDate: string;
  type: string;
  reminders?: number;
}

export interface FeeType {
  id: string;
  name: string;
  amount: string;
  frequency: string;
  mandatory: boolean;
  category: string;
}

export interface Discount {
  id: string;
  name: string;
  type: 'percent' | 'fixed';
  value: string;
  applicableGrades: string;
  validity: string;
  status: string;
}

export interface TransportRoute {
  id: string;
  name: string;
  driver: string;
  vehicle: string;
  students: number;
  capacity: number;
  stops: number;
  status: string;
  morningTime: string;
  afternoonTime: string;
}

export interface Vehicle {
  id: string;
  regNumber: string;
  type: string;
  capacity: number;
  driver: string;
  insuranceExpiry: string;
  status: string;
  lastService: string;
  nextService: string;
}

export interface TransportIncident {
  id: string;
  route: string;
  vehicle: string;
  date: string;
  type: string;
  description: string;
  severity: string;
  status: string;
  actionTaken: string;
}

export interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  allocated: string;
  status: string;
  floor: string;
}

export interface MaintenanceRequest {
  id: string;
  room: string;
  type: string;
  priority: string;
  description: string;
  status: string;
  reportedAt: string;
  assignedTo?: string;
  completedAt?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  purchaseDate: string;
  value: string;
  condition: string;
  assignedTo: string;
}

export interface FacilityBooking {
  id: string;
  room: string;
  event: string;
  date: string;
  time: string;
  bookedBy: string;
  status: string;
}

export interface Announcement {
  id: string;
  title: string;
  body?: string;
  audience: string;
  author: string;
  date: string;
  status: string;
  reads: number;
  priority?: string;
}

export interface MessageThread {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  unread: boolean;
  category: string;
}

export interface Template {
  id: string;
  name: string;
  type: string;
  category: string;
  body: string;
  lastEdited: string;
  status: string;
}

export interface CommLog {
  id: string;
  type: string;
  recipient: string;
  subject: string;
  sentAt: string;
  status: string;
  channel: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  user: string;
  target: string;
  timestamp: string;
  module: string;
  severity: string;
}

export interface ComplianceTask {
  id: string;
  area: string;
  description: string;
  dueDate: string;
  assignee: string;
  status: string;
  priority: string;
}

export interface AdmissionApp {
  id: string;
  studentName: string;
  grade: string;
  guardian: string;
  guardianPhone?: string;
  previousSchool?: string;
  appliedDate: string;
  stage: string;
  status: string;
  interviewDate?: string;
  interviewScore?: number;
  documents: { name: string; status: string }[];
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  note?: string;
}

export interface AttendanceCorrection {
  id: string;
  student: string;
  grade: string;
  date: string;
  from: string;
  to: string;
  requestedBy: string;
  reason: string;
  status: string;
}

export interface DisciplinaryRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  date: string;
  type: string;
  description: string;
  actionTaken: string;
  followUpDate?: string;
  status: string;
}

export interface TransferRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  fromSchool: string;
  toSchool: string;
  reason: string;
  date: string;
  status: string;
}

/* ─────────── Today's Snapshot (derived + static) ─────────── */
export interface TodaySnapshot {
  classesRunning: number;
  totalClasses: number;
  absentTeachers: { name: string; subject: string; substitute: string }[];
  transportTrips: { completed: number; inProgress: number; pending: number; issues: number };
  examsToday: { subject: string; time: string; room: string; invigilator: string }[];
  paymentsDue: { count: number; total: string };
  announcements: { text: string; priority: 'info' | 'warning' | 'critical' }[];
  complianceAlerts: { text: string; level: 'warning' | 'critical' }[];
}

/* ─────────── Helper: generate ID ─────────── */
let _idCounter = 1000;
export const genId = (prefix: string) => `${prefix}-${++_idCounter}`;

/* ─────────── Generic CRUD slice ─────────── */
interface CrudSlice<T extends { id: string }> {
  items: T[];
  add: (item: T) => void;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  getById: (id: string) => T | undefined;
  set: (items: T[]) => void;
}

function createCrudSlice<T extends { id: string }>(
  key: string,
  initial: T[],
  setFn: (fn: (state: AdminDataState) => Partial<AdminDataState>) => void,
  getFn: () => AdminDataState,
): CrudSlice<T> {
  return {
    items: initial,
    add: (item: T) => setFn((s) => {
      const slice = (s as any)[key] as CrudSlice<T>;
      return { [key]: { ...slice, items: [...slice.items, item] } } as any;
    }),
    update: (id: string, patch: Partial<T>) => setFn((s) => {
      const slice = (s as any)[key] as CrudSlice<T>;
      return { [key]: { ...slice, items: slice.items.map(i => i.id === id ? { ...i, ...patch } : i) } } as any;
    }),
    remove: (id: string) => setFn((s) => {
      const slice = (s as any)[key] as CrudSlice<T>;
      return { [key]: { ...slice, items: slice.items.filter(i => i.id !== id) } } as any;
    }),
    getById: (id: string) => ((getFn() as any)[key] as CrudSlice<T>).items.find(i => i.id === id),
    set: (items: T[]) => setFn((s) => {
      const slice = (s as any)[key] as CrudSlice<T>;
      return { [key]: { ...slice, items } } as any;
    }),
  };
}

/* ═══════════════════ STORE SHAPE ═══════════════════ */

export interface AdminDataState {
  /* ── Control Center ── */
  actionInbox: CrudSlice<ActionItem>;
  approvals: CrudSlice<ApprovalItem>;
  calendar: CrudSlice<CalendarEvent>;
  issues: CrudSlice<SchoolIssue>;
  todaySnapshot: TodaySnapshot;
  updateSnapshot: (patch: Partial<TodaySnapshot>) => void;

  /* ── People ── */
  students: CrudSlice<Student>;
  staff: CrudSlice<StaffMember>;
  leaveRequests: CrudSlice<LeaveRequest>;
  disciplinary: CrudSlice<DisciplinaryRecord>;
  transfers: CrudSlice<TransferRecord>;

  /* ── Academics ── */
  classes: CrudSlice<AcademicClass>;
  subjects: CrudSlice<Subject>;
  exams: CrudSlice<Exam>;

  /* ── Finance ── */
  invoices: CrudSlice<Invoice>;
  feeTypes: CrudSlice<FeeType>;
  discounts: CrudSlice<Discount>;

  /* ── Admissions ── */
  admissions: CrudSlice<AdmissionApp>;
  admissionPipeline: KanbanColumn[];
  setAdmissionPipeline: (cols: KanbanColumn[]) => void;
  moveAdmissionCard: (cardId: string, fromCol: string, toCol: string) => void;

  /* ── Attendance ── */
  attendanceRecords: CrudSlice<AttendanceRecord>;
  attendanceCorrections: CrudSlice<AttendanceCorrection>;

  /* ── Transport ── */
  routes: CrudSlice<TransportRoute>;
  vehicles: CrudSlice<Vehicle>;
  transportIncidents: CrudSlice<TransportIncident>;

  /* ── Facilities ── */
  rooms: CrudSlice<Room>;
  maintenanceRequests: CrudSlice<MaintenanceRequest>;
  assets: CrudSlice<Asset>;
  facilityBookings: CrudSlice<FacilityBooking>;

  /* ── Communication ── */
  announcementsList: CrudSlice<Announcement>;
  messages: CrudSlice<MessageThread>;
  templates: CrudSlice<Template>;
  commLogs: CrudSlice<CommLog>;

  /* ── Audit ── */
  auditLog: CrudSlice<AuditEntry>;
  complianceTasks: CrudSlice<ComplianceTask>;

  /* ── Audit auto-logger ── */
  logAction: (action: string, user: string, target: string, module: string, severity?: string) => void;
}

/* ═══════════════════ SEED DATA ═══════════════════ */
import {
  UserPlus, CreditCard, Calendar, FileText, Clock, Wallet,
} from 'lucide-react';

const seedActionInbox: ActionItem[] = [
  { id: 'ai-1', title: 'Review pending admission: Aisha Rahman (Grade 7)', category: 'Admissions', priority: 'high', status: 'pending', dueDate: 'Today', owner: 'Registrar', deepLink: { section: 'admissions', header: 'adm_applications' } },
  { id: 'ai-2', title: '5 overdue invoices require follow-up ($12,400)', category: 'Finance', priority: 'critical', status: 'overdue', dueDate: 'Overdue', owner: 'Finance', deepLink: { section: 'finance', header: 'fin_overdue' } },
  { id: 'ai-3', title: 'Mrs. Chen (Math) absent — no substitute assigned', category: 'Attendance', priority: 'critical', status: 'pending', dueDate: 'Today', owner: 'HR Admin', deepLink: { section: 'attendance', header: 'att_exceptions' } },
  { id: 'ai-4', title: 'Timetable conflict: Room 204 double-booked at 10:00', category: 'Academics', priority: 'high', status: 'pending', dueDate: 'Today', owner: 'Scheduler', deepLink: { section: 'academics', header: 'acad_timetable' } },
  { id: 'ai-5', title: 'Staff leave request: Mr. Patel (3 days from Mar 10)', category: 'Staff & HR', priority: 'medium', status: 'pending', dueDate: 'Mar 7', owner: 'Principal', deepLink: { section: 'staff', header: 'hr_leave' } },
  { id: 'ai-6', title: '3 new parent messages awaiting response', category: 'Communication', priority: 'medium', status: 'pending', dueDate: 'Today', owner: 'Admin', deepLink: { section: 'communication', header: 'comm_inbox' } },
  { id: 'ai-7', title: 'Student visa expiring: Kenji Tanaka (Mar 15)', category: 'Students', priority: 'high', status: 'pending', dueDate: 'Mar 15', owner: 'Registrar', deepLink: { section: 'students', header: 'stu_directory' } },
  { id: 'ai-8', title: 'Bus Route #4 driver called in sick', category: 'Transport', priority: 'high', status: 'pending', dueDate: 'Today', owner: 'Transport', deepLink: { section: 'transport', header: 'trn_incidents' } },
  { id: 'ai-9', title: 'Incident report: playground equipment damage', category: 'Facilities', priority: 'medium', status: 'in-progress', dueDate: 'Mar 8', owner: 'Facilities', deepLink: { section: 'facilities', header: 'fac_maintenance' } },
  { id: 'ai-10', title: 'Grade 10 mid-term results pending moderation', category: 'Exams', priority: 'medium', status: 'pending', dueDate: 'Mar 6', owner: 'Academics', deepLink: { section: 'exams', header: 'exam_results' } },
];

const seedApprovals: ApprovalItem[] = [
  { id: 'ap-1', title: 'Admission: Aisha Rahman → Grade 7', description: 'All documents verified. Interview score: 88/100. Seat available in 7B.', type: 'Admission', requestedBy: 'Ms. Johnson (Registrar)', requestedAt: '2h ago', priority: 'high', dueDate: 'Today', icon: UserPlus, status: 'pending' },
  { id: 'ap-2', title: 'Fee Discount: Scholarship — Marcus Wilson', description: '25% tuition waiver for academic excellence. GPA: 3.95', type: 'Discount', requestedBy: 'Finance Dept', requestedAt: '4h ago', priority: 'medium', dueDate: 'Mar 6', icon: CreditCard, status: 'pending' },
  { id: 'ap-3', title: 'Refund: Lab fee — Sarah Kim (transferred)', description: 'Pro-rated refund of $120 for unused lab sessions', type: 'Refund', requestedBy: 'Accountant', requestedAt: '1d ago', priority: 'low', dueDate: 'Mar 8', icon: Wallet, status: 'pending' },
  { id: 'ap-4', title: 'Leave: Mr. Patel — 3 days (personal)', description: 'Mar 10-12. Substitute: Ms. Davis (confirmed available)', type: 'Leave', requestedBy: 'Mr. Patel', requestedAt: '6h ago', priority: 'medium', dueDate: 'Mar 7', icon: Calendar, status: 'pending' },
  { id: 'ap-5', title: 'Schedule Change: Grade 9 Science → Room 301', description: 'Room 204 under maintenance. Move to Room 301 for 2 weeks.', type: 'Schedule', requestedBy: 'Scheduler', requestedAt: '3h ago', priority: 'high', dueDate: 'Today', icon: Clock, status: 'pending' },
  { id: 'ap-6', title: 'Record Correction: Emma Clark — DOB', description: 'Date of birth correction from 2012-05-15 to 2012-06-15. Birth certificate provided.', type: 'Record', requestedBy: 'Registrar', requestedAt: '1d ago', priority: 'low', icon: FileText, status: 'pending' },
];

const seedCalendar: CalendarEvent[] = [
  { id: 'ev-1', title: 'Parent-Teacher Conference', date: '2026-03-10', type: 'meeting', color: '#818cf8' },
  { id: 'ev-2', title: 'Grade 10 Biology Exam', date: '2026-03-04', type: 'exam', color: '#f59e0b' },
  { id: 'ev-3', title: 'Fire Drill', date: '2026-03-06', type: 'event', color: '#ef4444' },
  { id: 'ev-4', title: 'Staff Professional Development', date: '2026-03-08', type: 'training', color: '#10b981' },
  { id: 'ev-5', title: 'Board Meeting', date: '2026-03-12', type: 'meeting', color: '#818cf8' },
  { id: 'ev-6', title: 'Spring Break Begins', date: '2026-03-24', type: 'holiday', color: '#ec4899' },
  { id: 'ev-7', title: 'Grade 8 English Exam', date: '2026-03-04', type: 'exam', color: '#f59e0b' },
  { id: 'ev-8', title: 'Annual Safety Inspection', date: '2026-03-20', type: 'compliance', color: '#ef4444' },
];

const seedIssues: SchoolIssue[] = [
  { id: 'ie-1', type: 'Timetable Conflict', desc: 'Room 204 double-booked: Grade 7 Math + Grade 9 Science, 10:00 AM', severity: 'high', status: 'open', reportedAt: '2026-03-04' },
  { id: 'ie-2', type: 'Duplicate Record', desc: 'Possible duplicate: "Mohammad Ali" in Grade 5A and Grade 5B', severity: 'medium', status: 'open', reportedAt: '2026-03-03' },
  { id: 'ie-3', type: 'Over Capacity', desc: 'Grade 8A: 34 students assigned, capacity 30', severity: 'high', status: 'open', reportedAt: '2026-03-02' },
  { id: 'ie-4', type: 'Missing Grades', desc: '12 students in Grade 10 missing Biology mid-term marks', severity: 'medium', status: 'open', reportedAt: '2026-03-04' },
  { id: 'ie-5', type: 'Overdue Balance', desc: '8 families with balance >$5,000 and >60 days overdue', severity: 'critical', status: 'open', reportedAt: '2026-03-01' },
  { id: 'ie-6', type: 'Incomplete Profile', desc: '15 students missing emergency contact information', severity: 'low', status: 'open', reportedAt: '2026-03-04' },
  { id: 'ie-7', type: 'Transport', desc: 'Bus Route #4 overcapacity: 52 students, bus capacity 48', severity: 'medium', status: 'open', reportedAt: '2026-03-04' },
];

const seedStudents: Student[] = [
  { id: 'stu-1', name: 'Emma Clark', grade: 'Grade 10A', rollNo: '1001', guardian: 'Robert Clark', guardianPhone: '+1-555-2001', guardianEmail: 'rclark@gmail.com', status: 'Active', attendance: '96%', gpa: '3.85', feeStatus: 'Paid', joinDate: '2023-09-01', dob: '2011-04-12', gender: 'Female', bloodGroup: 'A+', address: '42 Oak Lane, Springfield' },
  { id: 'stu-2', name: 'James Park', grade: 'Grade 5B', rollNo: '1024', guardian: 'Jina Park', guardianPhone: '+1-555-2002', status: 'Active', attendance: '92%', gpa: '3.42', feeStatus: 'Paid', joinDate: '2026-03-03', dob: '2015-11-22', gender: 'Male' },
  { id: 'stu-3', name: 'Aisha Rahman', grade: 'Grade 7B', rollNo: '1045', guardian: 'Fatima Rahman', guardianPhone: '+1-555-2003', status: 'Active', attendance: '98%', gpa: '3.95', feeStatus: 'Partial', joinDate: '2024-09-01', dob: '2013-07-08', gender: 'Female', bloodGroup: 'B+' },
  { id: 'stu-4', name: 'Marcus Wilson', grade: 'Grade 11A', rollNo: '1003', guardian: 'David Wilson', guardianPhone: '+1-555-2004', status: 'Active', attendance: '94%', gpa: '3.92', feeStatus: 'Paid', joinDate: '2022-09-01', dob: '2010-01-30', gender: 'Male', bloodGroup: 'O+' },
  { id: 'stu-5', name: 'Sophia Martinez', grade: 'Grade 6A', rollNo: '1052', guardian: 'Elena Martinez', guardianPhone: '+1-555-2005', status: 'Active', attendance: '89%', gpa: '3.28', feeStatus: 'Overdue', joinDate: '2025-09-01', dob: '2014-09-17', gender: 'Female' },
  { id: 'stu-6', name: 'Kenji Tanaka', grade: 'Grade 9A', rollNo: '1018', guardian: 'Yuki Tanaka', guardianPhone: '+1-555-2006', status: 'Active', attendance: '91%', gpa: '3.55', feeStatus: 'Paid', joinDate: '2024-01-15', dob: '2012-03-05', gender: 'Male' },
  { id: 'stu-7', name: 'Olivia Brown', grade: 'Grade 2A', rollNo: '1067', guardian: 'Lisa Brown', guardianPhone: '+1-555-2007', status: 'Active', attendance: '97%', gpa: '—', feeStatus: 'Paid', joinDate: '2026-02-24', dob: '2018-12-01', gender: 'Female' },
  { id: 'stu-8', name: 'Noah Kim', grade: 'Grade 9B', rollNo: '1022', guardian: 'Min-Jun Kim', guardianPhone: '+1-555-2008', status: 'Active', attendance: '86%', gpa: '3.15', feeStatus: 'Partial', joinDate: '2023-09-01', dob: '2012-06-18', gender: 'Male' },
  { id: 'stu-9', name: 'Sarah Mitchell', grade: 'Grade 12A', rollNo: '1002', guardian: 'Tom Mitchell', guardianPhone: '+1-555-2009', status: 'Active', attendance: '99%', gpa: '3.98', feeStatus: 'Paid', joinDate: '2022-09-01', dob: '2009-08-24', gender: 'Female', bloodGroup: 'AB+' },
  { id: 'stu-10', name: 'Lucas Chen', grade: 'Grade 10B', rollNo: '1015', guardian: 'Wei Chen', guardianPhone: '+1-555-2010', status: 'Suspended', attendance: '74%', gpa: '2.85', feeStatus: 'Overdue', joinDate: '2023-09-01', dob: '2011-02-14', gender: 'Male' },
  { id: 'stu-11', name: 'Mia Thompson', grade: 'Grade 4A', rollNo: '1058', guardian: 'Karen Thompson', guardianPhone: '+1-555-2011', status: 'Active', attendance: '95%', gpa: '3.60', feeStatus: 'Paid', joinDate: '2025-09-01', dob: '2016-05-09', gender: 'Female' },
  { id: 'stu-12', name: 'Ethan Williams', grade: 'Grade 8A', rollNo: '1030', guardian: 'John Williams', guardianPhone: '+1-555-2012', status: 'Active', attendance: '93%', gpa: '3.48', feeStatus: 'Paid', joinDate: '2024-09-01', dob: '2013-10-27', gender: 'Male', bloodGroup: 'B-' },
];

const seedStaff: StaffMember[] = [
  { id: 'stf-1', name: 'Mrs. Chen', department: 'Mathematics', role: 'Teacher', status: 'Absent', joinDate: '2019-08-15', email: 'chen@school.edu', phone: '+1-555-0101', leaveBalance: '8 days', salary: '$58,000', qualification: 'M.Sc Mathematics' },
  { id: 'stf-2', name: 'Mr. Patel', department: 'Science', role: 'Teacher', status: 'Active', joinDate: '2020-01-10', email: 'patel@school.edu', phone: '+1-555-0102', leaveBalance: '12 days', salary: '$56,000', qualification: 'M.Sc Physics' },
  { id: 'stf-3', name: 'Ms. Johnson', department: 'Admissions', role: 'Registrar', status: 'Active', joinDate: '2018-06-01', email: 'johnson@school.edu', phone: '+1-555-0103', leaveBalance: '15 days', salary: '$52,000' },
  { id: 'stf-4', name: 'Mr. Davis', department: 'English', role: 'Teacher', status: 'Active', joinDate: '2021-08-20', email: 'davis@school.edu', phone: '+1-555-0104', leaveBalance: '10 days', salary: '$54,000', qualification: 'M.A English Literature' },
  { id: 'stf-5', name: 'Mrs. Adams', department: 'Primary', role: 'Head of Primary', status: 'Active', joinDate: '2017-03-15', email: 'adams@school.edu', phone: '+1-555-0105', leaveBalance: '14 days', salary: '$68,000', qualification: 'Ed.D' },
  { id: 'stf-6', name: 'Mr. Okoro', department: 'Physical Ed', role: 'Teacher', status: 'Leave', joinDate: '2022-01-05', email: 'okoro@school.edu', phone: '+1-555-0106', leaveBalance: '3 days', salary: '$48,000' },
  { id: 'stf-7', name: 'Mrs. Nelson', department: 'Science', role: 'Senior Teacher', status: 'Active', joinDate: '2016-08-01', email: 'nelson@school.edu', phone: '+1-555-0107', leaveBalance: '18 days', salary: '$64,000', qualification: 'Ph.D Chemistry' },
  { id: 'stf-8', name: 'Mr. Thompson', department: 'Physical Ed', role: 'Teacher', status: 'Active', joinDate: '2023-01-10', email: 'thompson@school.edu', phone: '+1-555-0108', leaveBalance: '14 days', salary: '$46,000' },
  { id: 'stf-9', name: 'Ms. Cooper', department: 'Primary', role: 'Teacher', status: 'Active', joinDate: '2020-08-15', email: 'cooper@school.edu', phone: '+1-555-0109', leaveBalance: '11 days', salary: '$50,000' },
  { id: 'stf-10', name: 'Mr. Harris', department: 'History', role: 'Teacher', status: 'Active', joinDate: '2019-01-20', email: 'harris@school.edu', phone: '+1-555-0110', leaveBalance: '9 days', salary: '$52,000', qualification: 'M.A History' },
];

const seedLeave: LeaveRequest[] = [
  { id: 'lr-1', staff: 'Mr. Patel', staffId: 'stf-2', department: 'Science', type: 'Personal', dates: 'Mar 10-12', days: 3, status: 'Pending', substitute: 'Ms. Davis', reason: 'Family event' },
  { id: 'lr-2', staff: 'Mr. Okoro', staffId: 'stf-6', department: 'Physical Ed', type: 'Medical', dates: 'Mar 3-5', days: 3, status: 'Approved', substitute: 'Mr. Thompson', reason: 'Medical appointment' },
  { id: 'lr-3', staff: 'Mrs. Chen', staffId: 'stf-1', department: 'Mathematics', type: 'Sick', dates: 'Mar 4', days: 1, status: 'Pending', substitute: 'Unassigned', reason: 'Illness' },
  { id: 'lr-4', staff: 'Ms. Cooper', staffId: 'stf-9', department: 'Primary', type: 'Professional', dates: 'Mar 15', days: 1, status: 'Approved', substitute: 'Mrs. Evans', reason: 'Conference' },
];

const seedClasses: AcademicClass[] = [
  { id: 'cls-1', name: 'Grade 1A', level: 'Grade 1', section: 'A', classTeacher: 'Mrs. Adams', students: 22, capacity: 25, room: 'Room 101', subjects: 6 },
  { id: 'cls-2', name: 'Grade 2A', level: 'Grade 2', section: 'A', classTeacher: 'Mr. Baker', students: 24, capacity: 25, room: 'Room 102', subjects: 6 },
  { id: 'cls-3', name: 'Grade 5A', level: 'Grade 5', section: 'A', classTeacher: 'Ms. Cooper', students: 28, capacity: 30, room: 'Room 201', subjects: 8 },
  { id: 'cls-4', name: 'Grade 5B', level: 'Grade 5', section: 'B', classTeacher: 'Mr. Davis', students: 26, capacity: 30, room: 'Room 202', subjects: 8 },
  { id: 'cls-5', name: 'Grade 7A', level: 'Grade 7', section: 'A', classTeacher: 'Mrs. Evans', students: 30, capacity: 30, room: 'Room 301', subjects: 9 },
  { id: 'cls-6', name: 'Grade 7B', level: 'Grade 7', section: 'B', classTeacher: 'Mr. Foster', students: 29, capacity: 30, room: 'Room 302', subjects: 9 },
  { id: 'cls-7', name: 'Grade 8A', level: 'Grade 8', section: 'A', classTeacher: 'Mrs. Grant', students: 34, capacity: 30, room: 'Room 303', subjects: 9 },
  { id: 'cls-8', name: 'Grade 9A', level: 'Grade 9', section: 'A', classTeacher: 'Mr. Harris', students: 27, capacity: 30, room: 'Room 401', subjects: 10 },
  { id: 'cls-9', name: 'Grade 10A', level: 'Grade 10', section: 'A', classTeacher: 'Mrs. Chen', students: 25, capacity: 28, room: 'Room 402', subjects: 10 },
  { id: 'cls-10', name: 'Grade 10B', level: 'Grade 10', section: 'B', classTeacher: 'Mr. Lopez', students: 24, capacity: 28, room: 'Room 403', subjects: 10 },
  { id: 'cls-11', name: 'Grade 11A', level: 'Grade 11', section: 'A', classTeacher: 'Mrs. Nelson', students: 22, capacity: 25, room: 'Room 501', subjects: 8 },
  { id: 'cls-12', name: 'Grade 12A', level: 'Grade 12', section: 'A', classTeacher: 'Mr. Patel', students: 20, capacity: 25, room: 'Room 502', subjects: 7 },
];

const seedSubjects: Subject[] = [
  { id: 'sub-1', name: 'Mathematics', code: 'MATH', department: 'Mathematics', credits: 4, teacher: 'Mrs. Chen', classes: 'Grade 9-12', periods: 5 },
  { id: 'sub-2', name: 'English Literature', code: 'ENG', department: 'English', credits: 3, teacher: 'Mr. Davis', classes: 'Grade 7-12', periods: 4 },
  { id: 'sub-3', name: 'Physics', code: 'PHY', department: 'Science', credits: 4, teacher: 'Mr. Patel', classes: 'Grade 10-12', periods: 5 },
  { id: 'sub-4', name: 'Chemistry', code: 'CHEM', department: 'Science', credits: 4, teacher: 'Mrs. Nelson', classes: 'Grade 10-12', periods: 5 },
  { id: 'sub-5', name: 'Biology', code: 'BIO', department: 'Science', credits: 3, teacher: 'Mrs. Nelson', classes: 'Grade 9-12', periods: 4 },
  { id: 'sub-6', name: 'History', code: 'HIST', department: 'Humanities', credits: 3, teacher: 'Mr. Harris', classes: 'Grade 7-12', periods: 3 },
  { id: 'sub-7', name: 'Physical Education', code: 'PE', department: 'Physical Ed', credits: 1, teacher: 'Mr. Okoro', classes: 'All Grades', periods: 3 },
  { id: 'sub-8', name: 'Art & Design', code: 'ART', department: 'Arts', credits: 2, teacher: 'Ms. Rivera', classes: 'Grade 1-10', periods: 2 },
  { id: 'sub-9', name: 'Computer Science', code: 'CS', department: 'Technology', credits: 3, teacher: 'Mr. Lopez', classes: 'Grade 8-12', periods: 4 },
  { id: 'sub-10', name: 'Music', code: 'MUS', department: 'Arts', credits: 1, teacher: 'Mrs. Cho', classes: 'Grade 1-8', periods: 2 },
];

const seedExams: Exam[] = [
  { id: 'ex-1', subject: 'Biology', grade: 'Grade 10', date: '2026-03-04', time: '09:00-11:00', room: 'Hall A', invigilator: 'Mrs. Adams', status: 'Completed', duration: '2h' },
  { id: 'ex-2', subject: 'English Literature', grade: 'Grade 8', date: '2026-03-04', time: '11:00-12:30', room: 'Room 105', invigilator: 'Mr. Davis', status: 'Completed', duration: '1.5h' },
  { id: 'ex-3', subject: 'Mathematics', grade: 'Grade 12', date: '2026-03-06', time: '09:00-11:30', room: 'Hall A', invigilator: 'Mrs. Nelson', status: 'Scheduled', duration: '2.5h' },
  { id: 'ex-4', subject: 'Physics', grade: 'Grade 11', date: '2026-03-06', time: '13:00-15:00', room: 'Hall B', invigilator: 'Mr. Patel', status: 'Scheduled', duration: '2h' },
  { id: 'ex-5', subject: 'History', grade: 'Grade 9', date: '2026-03-08', time: '09:00-10:30', room: 'Room 301', invigilator: 'Mr. Harris', status: 'Scheduled', duration: '1.5h' },
  { id: 'ex-6', subject: 'Chemistry', grade: 'Grade 10', date: '2026-03-10', time: '09:00-11:00', room: 'Lab 1', invigilator: 'Mrs. Nelson', status: 'Scheduled', duration: '2h' },
];

const seedInvoices: Invoice[] = [
  { id: 'inv-1', invoiceNo: 'INV-2026-0401', student: 'Emma Clark', grade: '10A', amount: '$2,400', paid: '$2,400', balance: '$0', status: 'Paid', dueDate: '2026-02-15', type: 'Tuition' },
  { id: 'inv-2', invoiceNo: 'INV-2026-0402', student: 'Sophia Martinez', grade: '6A', amount: '$1,800', paid: '$600', balance: '$1,200', status: 'Partial', dueDate: '2026-02-15', type: 'Tuition' },
  { id: 'inv-3', invoiceNo: 'INV-2026-0403', student: 'Lucas Chen', grade: '10B', amount: '$2,400', paid: '$0', balance: '$2,400', status: 'Overdue', dueDate: '2026-01-15', type: 'Tuition' },
  { id: 'inv-4', invoiceNo: 'INV-2026-0404', student: 'Noah Kim', grade: '9B', amount: '$2,200', paid: '$1,100', balance: '$1,100', status: 'Partial', dueDate: '2026-02-28', type: 'Tuition' },
  { id: 'inv-5', invoiceNo: 'INV-2026-0405', student: 'Aisha Rahman', grade: '7B', amount: '$1,600', paid: '$1,600', balance: '$0', status: 'Paid', dueDate: '2026-03-01', type: 'Tuition' },
  { id: 'inv-6', invoiceNo: 'INV-2026-0410', student: 'Marcus Wilson', grade: '11A', amount: '$350', paid: '$350', balance: '$0', status: 'Paid', dueDate: '2026-03-01', type: 'Lab Fee' },
  { id: 'inv-7', invoiceNo: 'INV-2026-0411', student: 'Kenji Tanaka', grade: '9A', amount: '$2,200', paid: '$0', balance: '$2,200', status: 'Overdue', dueDate: '2026-02-01', type: 'Tuition' },
  { id: 'inv-8', invoiceNo: 'INV-2026-0412', student: 'Ethan Williams', grade: '8A', amount: '$180', paid: '$0', balance: '$180', status: 'Pending', dueDate: '2026-03-15', type: 'Activity Fee' },
];

const seedFeeTypes: FeeType[] = [
  { id: 'ft-1', name: 'Tuition Fee', amount: '$3,500', frequency: 'Per Term', mandatory: true, category: 'Academic' },
  { id: 'ft-2', name: 'Technology Fee', amount: '$200', frequency: 'Annual', mandatory: true, category: 'Academic' },
  { id: 'ft-3', name: 'Lab Fee', amount: '$150', frequency: 'Per Term', mandatory: false, category: 'Academic' },
  { id: 'ft-4', name: 'Transport Fee', amount: '$120', frequency: 'Monthly', mandatory: false, category: 'Services' },
  { id: 'ft-5', name: 'Lunch Program', amount: '$85', frequency: 'Monthly', mandatory: false, category: 'Services' },
  { id: 'ft-6', name: 'After-School Care', amount: '$200', frequency: 'Monthly', mandatory: false, category: 'Services' },
  { id: 'ft-7', name: 'Activities Fee', amount: '$250', frequency: 'Annual', mandatory: false, category: 'Extra' },
  { id: 'ft-8', name: 'Exam Fee', amount: '$100', frequency: 'Per Term', mandatory: true, category: 'Academic' },
];

const seedDiscounts: Discount[] = [
  { id: 'dc-1', name: 'Academic Excellence', type: 'percent', value: '25%', applicableGrades: 'Grade 9-12', validity: '2025-2026', status: 'Active' },
  { id: 'dc-2', name: 'Sibling Discount', type: 'percent', value: '10%', applicableGrades: 'All Grades', validity: '2025-2026', status: 'Active' },
  { id: 'dc-3', name: 'Early Bird', type: 'fixed', value: '$200', applicableGrades: 'All Grades', validity: '2025-2026', status: 'Active' },
  { id: 'dc-4', name: 'Staff Child', type: 'percent', value: '50%', applicableGrades: 'All Grades', validity: '2025-2026', status: 'Active' },
  { id: 'dc-5', name: 'Financial Aid', type: 'percent', value: '15-40%', applicableGrades: 'All Grades', validity: '2025-2026', status: 'Active' },
];

const seedRoutes: TransportRoute[] = [
  { id: 'rt-1', name: 'Route #1 — North', driver: 'James Wilson', vehicle: 'Bus-001', students: 42, capacity: 48, stops: 8, status: 'Active', morningTime: '07:15', afternoonTime: '15:30' },
  { id: 'rt-2', name: 'Route #2 — South', driver: 'Maria Garcia', vehicle: 'Bus-002', students: 38, capacity: 48, stops: 6, status: 'Active', morningTime: '07:00', afternoonTime: '15:30' },
  { id: 'rt-3', name: 'Route #3 — East', driver: 'David Lee', vehicle: 'Bus-003', students: 45, capacity: 48, stops: 10, status: 'Active', morningTime: '07:20', afternoonTime: '15:45' },
  { id: 'rt-4', name: 'Route #4 — West', driver: 'Unassigned', vehicle: 'Bus-004', students: 52, capacity: 48, stops: 9, status: 'Issue', morningTime: '07:10', afternoonTime: '15:30' },
];

const seedVehicles: Vehicle[] = [
  { id: 'vh-1', regNumber: 'Bus-001', type: 'Full-size Bus', capacity: 48, driver: 'James Wilson', insuranceExpiry: '2026-08-15', status: 'Active', lastService: '2026-02-10', nextService: '2026-05-10' },
  { id: 'vh-2', regNumber: 'Bus-002', type: 'Full-size Bus', capacity: 48, driver: 'Maria Garcia', insuranceExpiry: '2026-07-20', status: 'Active', lastService: '2026-01-20', nextService: '2026-04-20' },
  { id: 'vh-3', regNumber: 'Bus-003', type: 'Full-size Bus', capacity: 48, driver: 'David Lee', insuranceExpiry: '2026-09-01', status: 'Active', lastService: '2026-02-28', nextService: '2026-05-28' },
  { id: 'vh-4', regNumber: 'Bus-004', type: 'Full-size Bus', capacity: 48, driver: 'Unassigned', insuranceExpiry: '2026-06-15', status: 'Issue', lastService: '2026-01-05', nextService: '2026-04-05' },
  { id: 'vh-5', regNumber: 'Van-001', type: 'Mini Van', capacity: 15, driver: 'Sarah Lee', insuranceExpiry: '2026-10-01', status: 'Active', lastService: '2026-02-15', nextService: '2026-05-15' },
];

const seedRooms: Room[] = [
  { id: 'fac-1', name: 'Room 101', type: 'Classroom', capacity: 25, allocated: 'Grade 1A', status: 'In Use', floor: 'Ground' },
  { id: 'fac-2', name: 'Room 204', type: 'Classroom', capacity: 30, allocated: 'Under Maintenance', status: 'Maintenance', floor: '2nd' },
  { id: 'fac-3', name: 'Hall A', type: 'Exam Hall', capacity: 120, allocated: 'Exams', status: 'In Use', floor: 'Ground' },
  { id: 'fac-4', name: 'Lab 1', type: 'Science Lab', capacity: 25, allocated: 'Grade 10 Chemistry', status: 'In Use', floor: '3rd' },
  { id: 'fac-5', name: 'Library', type: 'Library', capacity: 60, allocated: 'Open', status: 'Available', floor: '2nd' },
  { id: 'fac-6', name: 'Sports Field', type: 'Outdoor', capacity: 200, allocated: 'PE Classes', status: 'In Use', floor: 'Ext' },
  { id: 'fac-7', name: 'Room 501', type: 'Classroom', capacity: 25, allocated: 'Grade 11A', status: 'In Use', floor: '5th' },
  { id: 'fac-8', name: 'Computer Lab', type: 'Lab', capacity: 30, allocated: 'IT Classes', status: 'In Use', floor: '3rd' },
];

const seedMaintenanceRequests: MaintenanceRequest[] = [
  { id: 'mr-1', room: 'Room 204', type: 'Electrical', priority: 'High', description: 'AC unit not working — overheating issue', status: 'In Progress', reportedAt: '2026-03-01', assignedTo: 'Maintenance Team A' },
  { id: 'mr-2', room: 'Sports Field', type: 'Equipment', priority: 'Medium', description: 'Playground climbing frame needs repair', status: 'Reported', reportedAt: '2026-03-03' },
  { id: 'mr-3', room: 'Lab 1', type: 'Plumbing', priority: 'High', description: 'Gas line safety valve replacement needed', status: 'Scheduled', reportedAt: '2026-02-28', assignedTo: 'External Contractor' },
  { id: 'mr-4', room: 'Hall A', type: 'General', priority: 'Low', description: 'Stage curtain needs replacing', status: 'Reported', reportedAt: '2026-03-04' },
  { id: 'mr-5', room: 'Room 301', type: 'IT', priority: 'Medium', description: 'Projector bulb replacement', status: 'Completed', reportedAt: '2026-02-25', assignedTo: 'IT Dept', completedAt: '2026-02-27' },
  { id: 'mr-6', room: 'Bathroom 2F', type: 'Plumbing', priority: 'High', description: 'Leaking faucet in girls bathroom', status: 'In Progress', reportedAt: '2026-03-02', assignedTo: 'Maintenance Team B' },
];

const seedAssets: Asset[] = [
  { id: 'ast-1', name: 'Interactive Whiteboard', type: 'Electronics', location: 'Room 402', purchaseDate: '2024-08-01', value: '$2,400', condition: 'Good', assignedTo: 'Grade 10A' },
  { id: 'ast-2', name: 'Science Lab Equipment Set', type: 'Lab Equipment', location: 'Lab 1', purchaseDate: '2023-06-15', value: '$8,500', condition: 'Good', assignedTo: 'Science Dept' },
  { id: 'ast-3', name: 'Library Book Collection (2025)', type: 'Books', location: 'Library', purchaseDate: '2025-01-10', value: '$4,200', condition: 'New', assignedTo: 'Library' },
  { id: 'ast-4', name: 'Desktop Computers (×30)', type: 'Electronics', location: 'Computer Lab', purchaseDate: '2024-01-20', value: '$24,000', condition: 'Good', assignedTo: 'IT Dept' },
  { id: 'ast-5', name: 'PA System', type: 'Electronics', location: 'Main Office', purchaseDate: '2022-03-01', value: '$3,200', condition: 'Fair', assignedTo: 'Admin' },
  { id: 'ast-6', name: 'Sports Equipment Kit', type: 'Equipment', location: 'Sports Store', purchaseDate: '2025-02-01', value: '$5,600', condition: 'Good', assignedTo: 'PE Dept' },
  { id: 'ast-7', name: 'Security Cameras (×16)', type: 'Electronics', location: 'Campus', purchaseDate: '2024-06-01', value: '$12,000', condition: 'Good', assignedTo: 'Security' },
  { id: 'ast-8', name: 'Musical Instruments Set', type: 'Equipment', location: 'Music Room', purchaseDate: '2023-09-01', value: '$6,800', condition: 'Good', assignedTo: 'Music Dept' },
];

const seedFacilityBookings: FacilityBooking[] = [
  { id: 'fb-1', room: 'Hall A', event: 'Grade 12 Math Exam', date: '2026-03-06', time: '09:00-11:30', bookedBy: 'Examinations Office', status: 'Confirmed' },
  { id: 'fb-2', room: 'Library', event: 'Reading Club Session', date: '2026-03-06', time: '14:00-15:30', bookedBy: 'Ms. Rivera', status: 'Confirmed' },
  { id: 'fb-3', room: 'Hall A', event: 'Parent-Teacher Conference', date: '2026-03-10', time: '08:00-17:00', bookedBy: 'Admin Office', status: 'Confirmed' },
  { id: 'fb-4', room: 'Sports Field', event: 'Inter-school Football', date: '2026-03-12', time: '13:00-16:00', bookedBy: 'PE Dept', status: 'Pending' },
  { id: 'fb-5', room: 'Computer Lab', event: 'Coding Workshop', date: '2026-03-08', time: '10:00-12:00', bookedBy: 'Mr. Lopez', status: 'Confirmed' },
  { id: 'fb-6', room: 'Music Room', event: 'Band Practice', date: '2026-03-07', time: '15:00-17:00', bookedBy: 'Mrs. Cho', status: 'Confirmed' },
];

const seedAnnouncements: Announcement[] = [
  { id: 'ann-1', title: 'Parent-Teacher Conferences Schedule', body: 'Parent-teacher conferences will be held March 10-14. Please book your slot through the parent portal.', audience: 'All Parents', author: 'Principal Adams', date: '2026-03-02', status: 'Published', reads: 312, priority: 'info' },
  { id: 'ann-2', title: 'Fire Drill — Thursday March 6', body: 'Mandatory fire drill at 10:30 AM. All staff must review evacuation procedures.', audience: 'All Staff, Students', author: 'Safety Officer', date: '2026-03-03', status: 'Published', reads: 428, priority: 'warning' },
  { id: 'ann-3', title: 'Spring Break Reminders', body: 'Spring break: March 24 – April 4. Office hours during break: 9 AM – 1 PM.', audience: 'All', author: 'Admin Office', date: '2026-03-04', status: 'Draft', reads: 0, priority: 'info' },
  { id: 'ann-4', title: 'Grade 10-12 Career Fair', body: 'Career fair on March 15 featuring 20 companies. Students should register through guidance counselor.', audience: 'Grade 10-12 Students & Parents', author: 'Guidance Counselor', date: '2026-03-01', status: 'Published', reads: 145, priority: 'info' },
  { id: 'ann-5', title: 'Bus Route #4 Temporary Change', body: 'Due to driver availability, Route 4 departure changed from 7:10 to 7:25 AM until further notice.', audience: 'Route 4 Parents', author: 'Transport Coordinator', date: '2026-03-04', status: 'Scheduled', reads: 0, priority: 'warning' },
];

const seedMessages: MessageThread[] = [
  { id: 'msg-1', from: 'Elena Martinez', subject: 'Sophia late pickup today', preview: 'Hi, I will be 30 minutes late picking up Sophia today due to a work meeting...', date: '2026-03-04', unread: true, category: 'Parent' },
  { id: 'msg-2', from: 'Wei Chen', subject: 'Lucas suspension appeal', preview: 'We would like to request a meeting to discuss Lucas\'s suspension and possible reinstatement...', date: '2026-03-03', unread: true, category: 'Parent' },
  { id: 'msg-3', from: 'Mrs. Nelson', subject: 'Lab equipment order request', preview: 'We need to order replacement test tubes and beakers for the chemistry lab before...', date: '2026-03-03', unread: false, category: 'Staff' },
  { id: 'msg-4', from: 'Board of Education', subject: 'Annual compliance report reminder', preview: 'This is a reminder that your annual compliance report is due by March 31st...', date: '2026-03-02', unread: true, category: 'Official' },
  { id: 'msg-5', from: 'PTA Committee', subject: 'Spring fundraiser update', preview: 'Great news! We have secured 12 sponsors for the spring fundraiser event...', date: '2026-03-01', unread: false, category: 'Organization' },
  { id: 'msg-6', from: 'Fatima Rahman', subject: 'Thank you note', preview: 'Thank you for the wonderful education Aisha is receiving. We are very happy with...', date: '2026-02-28', unread: false, category: 'Parent' },
];

const seedTemplates: Template[] = [
  { id: 'tpl-1', name: 'Fee Reminder', type: 'Email', category: 'Finance', body: 'Dear {{guardian_name}}, This is a reminder that {{student_name}} has an outstanding balance of {{balance}}.', lastEdited: '2026-02-20', status: 'Active' },
  { id: 'tpl-2', name: 'Absence Notification', type: 'SMS', category: 'Attendance', body: '{{student_name}} was marked absent on {{date}}. Please contact the school if this is incorrect.', lastEdited: '2026-02-15', status: 'Active' },
  { id: 'tpl-3', name: 'Admission Offer', type: 'Email', category: 'Admissions', body: 'Dear {{guardian_name}}, We are pleased to offer {{student_name}} admission to {{grade}} at Sunrise International Academy.', lastEdited: '2026-03-01', status: 'Active' },
  { id: 'tpl-4', name: 'Parent Meeting Invite', type: 'Email', category: 'Communication', body: 'Dear {{guardian_name}}, You are invited to a parent-teacher conference on {{date}} at {{time}}.', lastEdited: '2026-02-28', status: 'Active' },
  { id: 'tpl-5', name: 'Report Card Notice', type: 'Email', category: 'Exams', body: 'Dear {{guardian_name}}, {{student_name}}\'s report card for {{term}} is now available on the parent portal.', lastEdited: '2026-01-15', status: 'Active' },
  { id: 'tpl-6', name: 'Emergency Alert', type: 'Push', category: 'Safety', body: 'URGENT: {{message}}. Please follow instructions from school administration.', lastEdited: '2025-12-01', status: 'Active' },
];

const seedCommLogs: CommLog[] = [
  { id: 'cl-1', type: 'Fee Reminder', recipient: 'Sophia Martinez (Parent)', subject: 'Outstanding balance: $1,200', sentAt: '2026-03-04 08:30', status: 'Delivered', channel: 'Email' },
  { id: 'cl-2', type: 'Absence Notification', recipient: 'Wei Chen (Parent)', subject: 'Lucas Chen marked absent', sentAt: '2026-03-04 09:15', status: 'Delivered', channel: 'SMS' },
  { id: 'cl-3', type: 'Announcement', recipient: 'All Parents (312)', subject: 'Parent-Teacher Conferences', sentAt: '2026-03-02 10:00', status: 'Delivered', channel: 'Email' },
  { id: 'cl-4', type: 'Announcement', recipient: 'All Staff (45)', subject: 'Fire Drill March 6', sentAt: '2026-03-03 08:00', status: 'Delivered', channel: 'Push' },
  { id: 'cl-5', type: 'Fee Reminder', recipient: 'Yuki Tanaka (Parent)', subject: 'Overdue: $2,200', sentAt: '2026-03-03 08:30', status: 'Failed', channel: 'Email' },
  { id: 'cl-6', type: 'Admission Offer', recipient: 'Karen Thompson (Parent)', subject: 'Admission offer: Mia Thompson', sentAt: '2026-02-28 14:00', status: 'Delivered', channel: 'Email' },
];

const seedAuditLog: AuditEntry[] = [
  { id: 'aud-1', action: 'Student Record Updated', user: 'Ms. Johnson', target: 'Emma Clark — DOB corrected', timestamp: '2026-03-04 09:15', module: 'Students', severity: 'info' },
  { id: 'aud-2', action: 'Admission Approved', user: 'Principal Adams', target: 'Mia Thompson → Grade 4A', timestamp: '2026-03-03 16:20', module: 'Admissions', severity: 'info' },
  { id: 'aud-3', action: 'Invoice Generated', user: 'Finance System', target: 'INV-2026-0412 — Ethan Williams', timestamp: '2026-03-03 14:00', module: 'Finance', severity: 'info' },
  { id: 'aud-4', action: 'Leave Approved', user: 'Principal Adams', target: 'Mr. Okoro — 3 days medical', timestamp: '2026-03-02 11:30', module: 'Staff', severity: 'info' },
  { id: 'aud-5', action: 'Grade Modified', user: 'Mrs. Nelson', target: 'Grade 10 Biology — 3 marks updated', timestamp: '2026-03-02 10:45', module: 'Exams', severity: 'warning' },
  { id: 'aud-6', action: 'Student Suspended', user: 'Principal Adams', target: 'Lucas Chen — Disciplinary', timestamp: '2026-03-01 15:00', module: 'Students', severity: 'critical' },
  { id: 'aud-7', action: 'Fee Discount Applied', user: 'Finance Admin', target: 'Marcus Wilson — 25% scholarship', timestamp: '2026-02-28 09:00', module: 'Finance', severity: 'warning' },
  { id: 'aud-8', action: 'Bulk Attendance Correction', user: 'Mrs. Grant', target: 'Grade 8A — Feb 28 records', timestamp: '2026-02-28 16:30', module: 'Attendance', severity: 'warning' },
];

const seedComplianceTasks: ComplianceTask[] = [
  { id: 'ct-1', area: 'Fire Safety', description: 'Renew fire safety certificate — expired Mar 1', dueDate: '2026-03-10', assignee: 'Facilities Manager', status: 'Overdue', priority: 'Critical' },
  { id: 'ct-2', area: 'Staff Background', description: 'Complete background checks for 3 new hires', dueDate: '2026-03-15', assignee: 'HR Admin', status: 'In Progress', priority: 'High' },
  { id: 'ct-3', area: 'Student Records', description: 'Ensure all Grade 12 records ready for transcripts', dueDate: '2026-03-20', assignee: 'Registrar', status: 'Open', priority: 'Medium' },
  { id: 'ct-4', area: 'Health & Hygiene', description: 'Monthly cafeteria inspection', dueDate: '2026-03-08', assignee: 'Health Officer', status: 'Scheduled', priority: 'Medium' },
  { id: 'ct-5', area: 'Data Protection', description: 'Annual FERPA compliance audit', dueDate: '2026-03-30', assignee: 'IT Admin', status: 'Open', priority: 'High' },
  { id: 'ct-6', area: 'Building Codes', description: 'Annual safety inspection — Board of Ed', dueDate: '2026-03-20', assignee: 'Facilities Manager', status: 'Scheduled', priority: 'High' },
  { id: 'ct-7', area: 'Staff CPR', description: '3 staff CPR certifications expiring this month', dueDate: '2026-03-31', assignee: 'HR Admin', status: 'Open', priority: 'Medium' },
  { id: 'ct-8', area: 'Insurance', description: 'Verify all bus insurance policies current', dueDate: '2026-03-15', assignee: 'Transport Coordinator', status: 'Open', priority: 'Medium' },
];

const seedAdmissions: AdmissionApp[] = [
  { id: 'adm-1', studentName: 'Sophia Martinez', grade: 'Grade 6', guardian: 'Elena Martinez', guardianPhone: '+1-555-2005', previousSchool: 'Lincoln Elementary', appliedDate: '2026-02-28', stage: 'new', status: 'Under Review', documents: [{ name: 'Birth Certificate', status: 'Verified' }, { name: 'Report Card', status: 'Pending' }] },
  { id: 'adm-2', studentName: "Liam O'Brien", grade: 'Grade 3', guardian: "Sean O'Brien", appliedDate: '2026-03-01', stage: 'new', status: 'New', documents: [{ name: 'Birth Certificate', status: 'Pending' }] },
  { id: 'adm-3', studentName: 'Aisha Rahman', grade: 'Grade 7', guardian: 'Fatima Rahman', guardianPhone: '+1-555-2003', previousSchool: 'Al-Noor Academy', appliedDate: '2026-02-20', stage: 'under_review', status: 'Under Review', documents: [{ name: 'Birth Certificate', status: 'Verified' }, { name: 'Report Card', status: 'Verified' }, { name: 'Medical Records', status: 'Verified' }, { name: 'Transfer Certificate', status: 'Verified' }, { name: 'Photo', status: 'Pending' }], interviewScore: 88 },
  { id: 'adm-4', studentName: 'Noah Kim', grade: 'Grade 9', guardian: 'Min-Jun Kim', appliedDate: '2026-02-22', stage: 'under_review', status: 'Under Review', documents: [{ name: 'Birth Certificate', status: 'Verified' }, { name: 'Report Card', status: 'Verified' }, { name: 'Medical Records', status: 'Verified' }, { name: 'Transfer Certificate', status: 'Verified' }, { name: 'Photo', status: 'Verified' }] },
  { id: 'adm-5', studentName: 'Lucas Chen', grade: 'Grade 10', guardian: 'Wei Chen', appliedDate: '2026-02-18', stage: 'interview', status: 'Interview Scheduled', interviewDate: '2026-03-05', documents: [{ name: 'All', status: 'Verified' }] },
  { id: 'adm-6', studentName: 'Mia Thompson', grade: 'Grade 4', guardian: 'Karen Thompson', appliedDate: '2026-02-15', stage: 'accepted', status: 'Accepted', interviewScore: 92, documents: [{ name: 'All', status: 'Verified' }], notes: 'Enrollment fee paid' },
  { id: 'adm-7', studentName: 'Ethan Williams', grade: 'Grade 8', guardian: 'John Williams', appliedDate: '2026-02-12', stage: 'accepted', status: 'Accepted', interviewScore: 78, documents: [{ name: 'All', status: 'Verified' }], notes: 'Enrollment fee pending' },
  { id: 'adm-8', studentName: 'Zara Ahmed', grade: 'Grade 7', guardian: 'Ahmed Family', appliedDate: '2026-02-10', stage: 'waitlisted', status: 'Waitlisted', documents: [{ name: 'All', status: 'Verified' }], notes: 'Section full — 7A, 7B' },
];

const seedTransportIncidents: TransportIncident[] = [
  { id: 'ti-1', route: 'Route #4', vehicle: 'Bus-004', date: '2026-03-04', type: 'Driver Absence', description: 'Driver called in sick, no replacement available', severity: 'High', status: 'Open', actionTaken: 'Seeking substitute driver' },
  { id: 'ti-2', route: 'Route #1', vehicle: 'Bus-001', date: '2026-03-03', type: 'Delay', description: '15-minute delay due to road closure on Oak Street', severity: 'Low', status: 'Resolved', actionTaken: 'Alternate route taken; parents notified' },
  { id: 'ti-3', route: 'Route #3', vehicle: 'Bus-003', date: '2026-03-01', type: 'Minor Accident', description: 'Rear fender dent from parking lot incident', severity: 'Medium', status: 'Resolved', actionTaken: 'Police report filed; repair scheduled' },
  { id: 'ti-4', route: 'Route #2', vehicle: 'Bus-002', date: '2026-02-28', type: 'Student Behavior', description: 'Two students involved in altercation on bus', severity: 'Medium', status: 'Resolved', actionTaken: 'Parents notified; disciplinary referral' },
];

const seedAttendanceCorrections: AttendanceCorrection[] = [
  { id: 'ac-1', student: 'Noah Kim', grade: 'Grade 9B', date: '2026-03-03', from: 'Absent', to: 'Excused', requestedBy: 'Min-Jun Kim (Parent)', reason: 'Medical appointment — doctor note provided', status: 'Pending' },
  { id: 'ac-2', student: 'Sophia Martinez', grade: 'Grade 6A', date: '2026-03-02', from: 'Late', to: 'Present', requestedBy: 'Elena Martinez (Parent)', reason: 'Arrived on time, marked incorrectly', status: 'Pending' },
  { id: 'ac-3', student: 'Grade 8A (bulk)', grade: 'Grade 8A', date: '2026-02-28', from: 'Various', to: 'Corrected', requestedBy: 'Mrs. Grant (Teacher)', reason: 'System error — marked all absent incorrectly', status: 'Approved' },
];

const seedDisciplinary: DisciplinaryRecord[] = [
  { id: 'disc-1', studentId: 'stu-10', studentName: 'Lucas Chen', grade: 'Grade 10B', date: '2026-03-01', type: 'Behavioral', description: 'Repeated truancy — absent 5 days without notice', actionTaken: '3-day suspension', followUpDate: '2026-03-10', status: 'Active' },
  { id: 'disc-2', studentId: 'stu-8', studentName: 'Noah Kim', grade: 'Grade 9B', date: '2026-02-20', type: 'Academic Integrity', description: 'Copying during math quiz', actionTaken: 'Warning + parent meeting', status: 'Resolved' },
];

const seedTransfers: TransferRecord[] = [
  { id: 'tr-1', studentId: 'stu-x1', studentName: 'Sarah Kim', grade: 'Grade 8B', fromSchool: 'Sunrise International Academy', toSchool: 'Westside Academy', reason: 'Family relocation', date: '2026-02-20', status: 'Completed' },
  { id: 'tr-2', studentId: 'stu-x2', studentName: 'Rachel Green', grade: 'Grade 6A', fromSchool: 'Central Middle School', toSchool: 'Sunrise International Academy', reason: 'Transfer request — better program', date: '2026-03-03', status: 'In Progress' },
];

const seedSnapshot: TodaySnapshot = {
  classesRunning: 24,
  totalClasses: 28,
  absentTeachers: [
    { name: 'Mrs. Chen', subject: 'Mathematics', substitute: 'Unassigned' },
    { name: 'Mr. Okoro', subject: 'Physical Ed', substitute: 'Mr. Thompson' },
  ],
  transportTrips: { completed: 8, inProgress: 4, pending: 2, issues: 1 },
  examsToday: [
    { subject: 'Grade 10 Biology', time: '09:00', room: 'Hall A', invigilator: 'Mrs. Adams' },
    { subject: 'Grade 8 English', time: '11:00', room: 'Room 105', invigilator: 'Mr. Davis' },
  ],
  paymentsDue: { count: 12, total: '$18,600' },
  announcements: [
    { text: 'Parent-teacher conferences next week (Mar 10-14)', priority: 'info' },
    { text: 'Fire drill scheduled for Thursday at 10:30 AM', priority: 'warning' },
    { text: 'Spring break starts March 24', priority: 'info' },
  ],
  complianceAlerts: [
    { text: '3 staff CPR certifications expiring this month', level: 'warning' },
    { text: 'Annual safety inspection due Mar 20', level: 'critical' },
  ],
};

/* Pipeline from admissions for Kanban */
import { admissionsPipeline as seedPipeline } from '@/views/admin/data/demo-data';

/* ═══════════════════ CREATE STORE ═══════════════════ */

export const useAdminStore = create<AdminDataState>()((set, get) => ({
    /* ── Control Center ── */
    actionInbox: createCrudSlice<ActionItem>('actionInbox', seedActionInbox, set as any, get),
    approvals: createCrudSlice<ApprovalItem>('approvals', seedApprovals, set as any, get),
    calendar: createCrudSlice<CalendarEvent>('calendar', seedCalendar, set as any, get),
    issues: createCrudSlice<SchoolIssue>('issues', seedIssues, set as any, get),
    todaySnapshot: seedSnapshot,
    updateSnapshot: (patch) => set((s) => ({ todaySnapshot: { ...s.todaySnapshot, ...patch } })),

    /* ── People ── */
    students: createCrudSlice<Student>('students', seedStudents, set as any, get),
    staff: createCrudSlice<StaffMember>('staff', seedStaff, set as any, get),
    leaveRequests: createCrudSlice<LeaveRequest>('leaveRequests', seedLeave, set as any, get),
    disciplinary: createCrudSlice<DisciplinaryRecord>('disciplinary', seedDisciplinary, set as any, get),
    transfers: createCrudSlice<TransferRecord>('transfers', seedTransfers, set as any, get),

    /* ── Academics ── */
    classes: createCrudSlice<AcademicClass>('classes', seedClasses, set as any, get),
    subjects: createCrudSlice<Subject>('subjects', seedSubjects, set as any, get),
    exams: createCrudSlice<Exam>('exams', seedExams, set as any, get),

    /* ── Finance ── */
    invoices: createCrudSlice<Invoice>('invoices', seedInvoices, set as any, get),
    feeTypes: createCrudSlice<FeeType>('feeTypes', seedFeeTypes, set as any, get),
    discounts: createCrudSlice<Discount>('discounts', seedDiscounts, set as any, get),

    /* ── Admissions ── */
    admissions: createCrudSlice<AdmissionApp>('admissions', seedAdmissions, set as any, get),
    admissionPipeline: seedPipeline,
    setAdmissionPipeline: (cols) => set({ admissionPipeline: cols }),
    moveAdmissionCard: (cardId, fromCol, toCol) => set((s) => {
      const pipeline = s.admissionPipeline.map(c => ({ ...c, cards: [...c.cards] }));
      const from = pipeline.find(c => c.id === fromCol);
      const to = pipeline.find(c => c.id === toCol);
      if (!from || !to) return s;
      const cardIdx = from.cards.findIndex(c => c.id === cardId);
      if (cardIdx === -1) return s;
      const [card] = from.cards.splice(cardIdx, 1);
      to.cards.push(card);
      return { admissionPipeline: pipeline };
    }),

    /* ── Attendance ── */
    attendanceRecords: createCrudSlice<AttendanceRecord>('attendanceRecords', [], set as any, get),
    attendanceCorrections: createCrudSlice<AttendanceCorrection>('attendanceCorrections', seedAttendanceCorrections, set as any, get),

    /* ── Transport ── */
    routes: createCrudSlice<TransportRoute>('routes', seedRoutes, set as any, get),
    vehicles: createCrudSlice<Vehicle>('vehicles', seedVehicles, set as any, get),
    transportIncidents: createCrudSlice<TransportIncident>('transportIncidents', seedTransportIncidents, set as any, get),

    /* ── Facilities ── */
    rooms: createCrudSlice<Room>('rooms', seedRooms, set as any, get),
    maintenanceRequests: createCrudSlice<MaintenanceRequest>('maintenanceRequests', seedMaintenanceRequests, set as any, get),
    assets: createCrudSlice<Asset>('assets', seedAssets, set as any, get),
    facilityBookings: createCrudSlice<FacilityBooking>('facilityBookings', seedFacilityBookings, set as any, get),

    /* ── Communication ── */
    announcementsList: createCrudSlice<Announcement>('announcementsList', seedAnnouncements, set as any, get),
    messages: createCrudSlice<MessageThread>('messages', seedMessages, set as any, get),
    templates: createCrudSlice<Template>('templates', seedTemplates, set as any, get),
    commLogs: createCrudSlice<CommLog>('commLogs', seedCommLogs, set as any, get),

    /* ── Audit ── */
    auditLog: createCrudSlice<AuditEntry>('auditLog', seedAuditLog, set as any, get),
    complianceTasks: createCrudSlice<ComplianceTask>('complianceTasks', seedComplianceTasks, set as any, get),

    /* ── Auto-logger ── */
    logAction: (action, user, target, module, severity = 'info') => {
      const entry: AuditEntry = {
        id: genId('aud'),
        action,
        user,
        target,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        module,
        severity,
      };
      set((s) => ({
        auditLog: { ...s.auditLog, items: [entry, ...s.auditLog.items] },
      }));
    },
  }));
