/* ─── School Admin Demo Data ─── Realistic operating school data ─── */
import type { ActionItem, ApprovalItem } from '@/components/features/school-admin';
import type { KanbanColumn } from '@/components/features/school-admin';
import {
  UserPlus, CreditCard, Calendar, FileText,
  Clock, Wallet,
} from 'lucide-react';

/* ═══ Action Inbox Items ═══ */
export const actionInboxItems: ActionItem[] = [
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

/* ═══ Approval Center Items ═══ */
export const approvalItems: ApprovalItem[] = [
  { id: 'ap-1', title: 'Admission: Aisha Rahman → Grade 7', description: 'All documents verified. Interview score: 88/100. Seat available in 7B.', type: 'Admission', requestedBy: 'Ms. Johnson (Registrar)', requestedAt: '2h ago', priority: 'high', dueDate: 'Today', icon: UserPlus },
  { id: 'ap-2', title: 'Fee Discount: Scholarship — Marcus Wilson', description: '25% tuition waiver for academic excellence. GPA: 3.95', type: 'Discount', requestedBy: 'Finance Dept', requestedAt: '4h ago', priority: 'medium', dueDate: 'Mar 6', icon: CreditCard },
  { id: 'ap-3', title: 'Refund: Lab fee — Sarah Kim (transferred)', description: 'Pro-rated refund of $120 for unused lab sessions', type: 'Refund', requestedBy: 'Accountant', requestedAt: '1d ago', priority: 'low', dueDate: 'Mar 8', icon: Wallet },
  { id: 'ap-4', title: 'Leave: Mr. Patel — 3 days (personal)', description: 'Mar 10-12. Substitute: Ms. Davis (confirmed available)', type: 'Leave', requestedBy: 'Mr. Patel', requestedAt: '6h ago', priority: 'medium', dueDate: 'Mar 7', icon: Calendar },
  { id: 'ap-5', title: 'Schedule Change: Grade 9 Science → Room 301', description: 'Room 204 under maintenance. Move to Room 301 for 2 weeks.', type: 'Schedule', requestedBy: 'Scheduler', requestedAt: '3h ago', priority: 'high', dueDate: 'Today', icon: Clock },
  { id: 'ap-6', title: 'Record Correction: Emma Clark — DOB', description: 'Date of birth correction from 2012-05-15 to 2012-06-15. Birth certificate provided.', type: 'Record', requestedBy: 'Registrar', requestedAt: '1d ago', priority: 'low', icon: FileText },
];

/* ═══ Today's Snapshot ═══ */
export const todaySnapshot = {
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
    { text: 'Parent-teacher conferences next week (Mar 10-14)', priority: 'info' as const },
    { text: 'Fire drill scheduled for Thursday at 10:30 AM', priority: 'warning' as const },
    { text: 'Spring break starts March 24', priority: 'info' as const },
  ],
  complianceAlerts: [
    { text: '3 staff CPR certifications expiring this month', level: 'warning' as const },
    { text: 'Annual safety inspection due Mar 20', level: 'critical' as const },
  ],
};

/* ═══ Issues & Exceptions ═══ */
export const issuesAndExceptions = [
  { id: 'ie-1', type: 'Timetable Conflict', desc: 'Room 204 double-booked: Grade 7 Math + Grade 9 Science, 10:00 AM', severity: 'high' as const },
  { id: 'ie-2', type: 'Duplicate Record', desc: 'Possible duplicate: "Mohammad Ali" in Grade 5A and Grade 5B', severity: 'medium' as const },
  { id: 'ie-3', type: 'Over Capacity', desc: 'Grade 8A: 34 students assigned, capacity 30', severity: 'high' as const },
  { id: 'ie-4', type: 'Missing Grades', desc: '12 students in Grade 10 missing Biology mid-term marks', severity: 'medium' as const },
  { id: 'ie-5', type: 'Overdue Balance', desc: '8 families with balance >$5,000 and >60 days overdue', severity: 'critical' as const },
  { id: 'ie-6', type: 'Incomplete Profile', desc: '15 students missing emergency contact information', severity: 'low' as const },
  { id: 'ie-7', type: 'Transport', desc: 'Bus Route #4 overcapacity: 52 students, bus capacity 48', severity: 'medium' as const },
];

/* ═══ Calendar Events ═══ */
export const calendarEvents = [
  { id: 'ev-1', title: 'Parent-Teacher Conference', date: '2026-03-10', type: 'meeting', color: '#818cf8' },
  { id: 'ev-2', title: 'Grade 10 Biology Exam', date: '2026-03-04', type: 'exam', color: '#f59e0b' },
  { id: 'ev-3', title: 'Fire Drill', date: '2026-03-06', type: 'event', color: '#ef4444' },
  { id: 'ev-4', title: 'Staff Professional Development', date: '2026-03-08', type: 'training', color: '#10b981' },
  { id: 'ev-5', title: 'Board Meeting', date: '2026-03-12', type: 'meeting', color: '#818cf8' },
  { id: 'ev-6', title: 'Spring Break Begins', date: '2026-03-24', type: 'holiday', color: '#ec4899' },
  { id: 'ev-7', title: 'Grade 8 English Exam', date: '2026-03-04', type: 'exam', color: '#f59e0b' },
  { id: 'ev-8', title: 'Annual Safety Inspection', date: '2026-03-20', type: 'compliance', color: '#ef4444' },
];

/* ═══ Admissions Pipeline ═══ */
export const admissionsPipeline: KanbanColumn[] = [
  {
    id: 'new', title: 'New', color: '#6366f1',
    cards: [
      { id: 'app-1', title: 'Sophia Martinez', subtitle: 'Grade 6 · Applied Feb 28', priority: 'medium', meta: 'Parent: Elena Martinez', badges: [{ label: 'Transfer' }] },
      { id: 'app-2', title: 'Liam O\'Brien', subtitle: 'Grade 3 · Applied Mar 1', priority: 'low', meta: 'Parent: Sean O\'Brien' },
    ],
  },
  {
    id: 'under_review', title: 'Under Review', color: '#f59e0b',
    cards: [
      { id: 'app-3', title: 'Aisha Rahman', subtitle: 'Grade 7 · Applied Feb 20', priority: 'high', meta: 'Docs: 4/5 verified', badges: [{ label: 'Scholarship' }] },
      { id: 'app-4', title: 'Noah Kim', subtitle: 'Grade 9 · Applied Feb 22', priority: 'medium', meta: 'Docs: 5/5 verified' },
      { id: 'app-5', title: 'Emma Davis', subtitle: 'Grade 1 · Applied Feb 25', priority: 'low', meta: 'Docs: 3/5 verified' },
    ],
  },
  {
    id: 'interview', title: 'Interview Scheduled', color: '#3b82f6',
    cards: [
      { id: 'app-6', title: 'Lucas Chen', subtitle: 'Grade 10 · Interview Mar 5', priority: 'high', meta: 'With: Principal Adams' },
    ],
  },
  {
    id: 'accepted', title: 'Accepted', color: '#10b981',
    cards: [
      { id: 'app-7', title: 'Mia Thompson', subtitle: 'Grade 4 · Accepted Mar 1', priority: 'low', meta: 'Enrollment fee: Paid' },
      { id: 'app-8', title: 'Ethan Williams', subtitle: 'Grade 8 · Accepted Feb 28', priority: 'medium', meta: 'Enrollment fee: Pending' },
    ],
  },
  {
    id: 'waitlisted', title: 'Waitlisted', color: '#8b5cf6',
    cards: [
      { id: 'app-9', title: 'Zara Ahmed', subtitle: 'Grade 7 · Waitlist #3', priority: 'medium', meta: 'Section full — 7A, 7B' },
    ],
  },
  {
    id: 'enrolled', title: 'Enrolled', color: '#059669',
    cards: [
      { id: 'app-10', title: 'James Park', subtitle: 'Grade 5B · Enrolled', meta: 'Started Mar 3' },
      { id: 'app-11', title: 'Olivia Brown', subtitle: 'Grade 2A · Enrolled', meta: 'Started Feb 24' },
    ],
  },
];

/* ═══ Student Directory ═══ */
export const studentDirectory = [
  { id: 'stu-1', name: 'Emma Clark', grade: 'Grade 10A', rollNo: '1001', guardian: 'Robert Clark', status: 'Active', attendance: '96%', gpa: '3.85', feeStatus: 'Paid', joinDate: '2023-09-01' },
  { id: 'stu-2', name: 'James Park', grade: 'Grade 5B', rollNo: '1024', guardian: 'Jina Park', status: 'Active', attendance: '92%', gpa: '3.42', feeStatus: 'Paid', joinDate: '2026-03-03' },
  { id: 'stu-3', name: 'Aisha Rahman', grade: 'Grade 7B', rollNo: '1045', guardian: 'Fatima Rahman', status: 'Active', attendance: '98%', gpa: '3.95', feeStatus: 'Partial', joinDate: '2024-09-01' },
  { id: 'stu-4', name: 'Marcus Wilson', grade: 'Grade 11A', rollNo: '1003', guardian: 'David Wilson', status: 'Active', attendance: '94%', gpa: '3.92', feeStatus: 'Paid', joinDate: '2022-09-01' },
  { id: 'stu-5', name: 'Sophia Martinez', grade: 'Grade 6A', rollNo: '1052', guardian: 'Elena Martinez', status: 'Active', attendance: '89%', gpa: '3.28', feeStatus: 'Overdue', joinDate: '2025-09-01' },
  { id: 'stu-6', name: 'Kenji Tanaka', grade: 'Grade 9A', rollNo: '1018', guardian: 'Yuki Tanaka', status: 'Active', attendance: '91%', gpa: '3.55', feeStatus: 'Paid', joinDate: '2024-01-15' },
  { id: 'stu-7', name: 'Olivia Brown', grade: 'Grade 2A', rollNo: '1067', guardian: 'Lisa Brown', status: 'Active', attendance: '97%', gpa: '—', feeStatus: 'Paid', joinDate: '2026-02-24' },
  { id: 'stu-8', name: 'Noah Kim', grade: 'Grade 9B', rollNo: '1022', guardian: 'Min-Jun Kim', status: 'Active', attendance: '86%', gpa: '3.15', feeStatus: 'Partial', joinDate: '2023-09-01' },
  { id: 'stu-9', name: 'Sarah Mitchell', grade: 'Grade 12A', rollNo: '1002', guardian: 'Tom Mitchell', status: 'Active', attendance: '99%', gpa: '3.98', feeStatus: 'Paid', joinDate: '2022-09-01' },
  { id: 'stu-10', name: 'Lucas Chen', grade: 'Grade 10B', rollNo: '1015', guardian: 'Wei Chen', status: 'Suspended', attendance: '74%', gpa: '2.85', feeStatus: 'Overdue', joinDate: '2023-09-01' },
  { id: 'stu-11', name: 'Mia Thompson', grade: 'Grade 4A', rollNo: '1058', guardian: 'Karen Thompson', status: 'Active', attendance: '95%', gpa: '3.60', feeStatus: 'Paid', joinDate: '2025-09-01' },
  { id: 'stu-12', name: 'Ethan Williams', grade: 'Grade 8A', rollNo: '1030', guardian: 'John Williams', status: 'Active', attendance: '93%', gpa: '3.48', feeStatus: 'Paid', joinDate: '2024-09-01' },
];

/* ═══ Academic Classes ═══ */
export const academicClasses = [
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

/* ═══ Finance — Invoices ═══ */
export const invoices = [
  { id: 'inv-1', invoiceNo: 'INV-2026-0401', student: 'Emma Clark', grade: '10A', amount: '$2,400', paid: '$2,400', balance: '$0', status: 'Paid', dueDate: '2026-02-15', type: 'Tuition' },
  { id: 'inv-2', invoiceNo: 'INV-2026-0402', student: 'Sophia Martinez', grade: '6A', amount: '$1,800', paid: '$600', balance: '$1,200', status: 'Partial', dueDate: '2026-02-15', type: 'Tuition' },
  { id: 'inv-3', invoiceNo: 'INV-2026-0403', student: 'Lucas Chen', grade: '10B', amount: '$2,400', paid: '$0', balance: '$2,400', status: 'Overdue', dueDate: '2026-01-15', type: 'Tuition' },
  { id: 'inv-4', invoiceNo: 'INV-2026-0404', student: 'Noah Kim', grade: '9B', amount: '$2,200', paid: '$1,100', balance: '$1,100', status: 'Partial', dueDate: '2026-02-28', type: 'Tuition' },
  { id: 'inv-5', invoiceNo: 'INV-2026-0405', student: 'Aisha Rahman', grade: '7B', amount: '$1,600', paid: '$1,600', balance: '$0', status: 'Paid', dueDate: '2026-03-01', type: 'Tuition' },
  { id: 'inv-6', invoiceNo: 'INV-2026-0410', student: 'Marcus Wilson', grade: '11A', amount: '$350', paid: '$350', balance: '$0', status: 'Paid', dueDate: '2026-03-01', type: 'Lab Fee' },
  { id: 'inv-7', invoiceNo: 'INV-2026-0411', student: 'Kenji Tanaka', grade: '9A', amount: '$2,200', paid: '$0', balance: '$2,200', status: 'Overdue', dueDate: '2026-02-01', type: 'Tuition' },
  { id: 'inv-8', invoiceNo: 'INV-2026-0412', student: 'Ethan Williams', grade: '8A', amount: '$180', paid: '$0', balance: '$180', status: 'Pending', dueDate: '2026-03-15', type: 'Activity Fee' },
];

/* ═══ Staff Directory ═══ */
export const staffDirectory = [
  { id: 'stf-1', name: 'Mrs. Chen', department: 'Mathematics', role: 'Teacher', status: 'Absent', joinDate: '2019-08-15', email: 'chen@school.edu', phone: '+1-555-0101', leaveBalance: '8 days' },
  { id: 'stf-2', name: 'Mr. Patel', department: 'Science', role: 'Teacher', status: 'Active', joinDate: '2020-01-10', email: 'patel@school.edu', phone: '+1-555-0102', leaveBalance: '12 days' },
  { id: 'stf-3', name: 'Ms. Johnson', department: 'Admissions', role: 'Registrar', status: 'Active', joinDate: '2018-06-01', email: 'johnson@school.edu', phone: '+1-555-0103', leaveBalance: '15 days' },
  { id: 'stf-4', name: 'Mr. Davis', department: 'English', role: 'Teacher', status: 'Active', joinDate: '2021-08-20', email: 'davis@school.edu', phone: '+1-555-0104', leaveBalance: '10 days' },
  { id: 'stf-5', name: 'Mrs. Adams', department: 'Primary', role: 'Head of Primary', status: 'Active', joinDate: '2017-03-15', email: 'adams@school.edu', phone: '+1-555-0105', leaveBalance: '14 days' },
  { id: 'stf-6', name: 'Mr. Okoro', department: 'Physical Ed', role: 'Teacher', status: 'Leave', joinDate: '2022-01-05', email: 'okoro@school.edu', phone: '+1-555-0106', leaveBalance: '3 days' },
  { id: 'stf-7', name: 'Mrs. Nelson', department: 'Science', role: 'Senior Teacher', status: 'Active', joinDate: '2016-08-01', email: 'nelson@school.edu', phone: '+1-555-0107', leaveBalance: '18 days' },
  { id: 'stf-8', name: 'Mr. Thompson', department: 'Physical Ed', role: 'Teacher', status: 'Active', joinDate: '2023-01-10', email: 'thompson@school.edu', phone: '+1-555-0108', leaveBalance: '14 days' },
  { id: 'stf-9', name: 'Ms. Cooper', department: 'Primary', role: 'Teacher', status: 'Active', joinDate: '2020-08-15', email: 'cooper@school.edu', phone: '+1-555-0109', leaveBalance: '11 days' },
  { id: 'stf-10', name: 'Mr. Harris', department: 'History', role: 'Teacher', status: 'Active', joinDate: '2019-01-20', email: 'harris@school.edu', phone: '+1-555-0110', leaveBalance: '9 days' },
];

/* ═══ Leave Requests ═══ */
export const leaveRequests = [
  { id: 'lr-1', staff: 'Mr. Patel', department: 'Science', type: 'Personal', dates: 'Mar 10-12', days: 3, status: 'Pending', substitute: 'Ms. Davis', reason: 'Family event' },
  { id: 'lr-2', staff: 'Mr. Okoro', department: 'Physical Ed', type: 'Medical', dates: 'Mar 3-5', days: 3, status: 'Approved', substitute: 'Mr. Thompson', reason: 'Medical appointment' },
  { id: 'lr-3', staff: 'Mrs. Chen', department: 'Mathematics', type: 'Sick', dates: 'Mar 4', days: 1, status: 'Pending', substitute: 'Unassigned', reason: 'Illness' },
  { id: 'lr-4', staff: 'Ms. Cooper', department: 'Primary', type: 'Professional', dates: 'Mar 15', days: 1, status: 'Approved', substitute: 'Mrs. Evans', reason: 'Conference' },
];

/* ═══ Attendance Overview ═══ */
export const attendanceOverview = {
  today: { present: 468, absent: 42, late: 15, onLeave: 5, total: 510, rate: '91.8%' },
  byGrade: [
    { grade: 'Grade 1', present: 20, absent: 2, late: 1, total: 22, rate: '90.9%' },
    { grade: 'Grade 2', present: 22, absent: 2, late: 0, total: 24, rate: '91.7%' },
    { grade: 'Grade 5', present: 50, absent: 4, late: 2, total: 54, rate: '92.6%' },
    { grade: 'Grade 7', present: 54, absent: 5, late: 2, total: 59, rate: '91.5%' },
    { grade: 'Grade 8', present: 30, absent: 4, late: 3, total: 34, rate: '88.2%' },
    { grade: 'Grade 9', present: 48, absent: 3, late: 1, total: 51, rate: '94.1%' },
    { grade: 'Grade 10', present: 45, absent: 4, late: 2, total: 49, rate: '91.8%' },
    { grade: 'Grade 11', present: 20, absent: 2, late: 1, total: 22, rate: '90.9%' },
    { grade: 'Grade 12', present: 19, absent: 1, late: 0, total: 20, rate: '95.0%' },
  ],
  exceptions: [
    { student: 'Noah Kim', grade: '9B', issue: 'Absent 5 consecutive days', severity: 'high' as const },
    { student: 'Lucas Chen', grade: '10B', issue: 'Attendance below 75% this term', severity: 'critical' as const },
    { student: 'Sophia Martinez', grade: '6A', issue: 'Late arrival 8 times this month', severity: 'medium' as const },
    { student: 'Grade 8A', grade: '', issue: 'Class attendance dropped below 90%', severity: 'medium' as const },
  ],
};

/* ═══ Exam Schedule ═══ */
export const examSchedule = [
  { id: 'ex-1', subject: 'Biology', grade: 'Grade 10', date: '2026-03-04', time: '09:00-11:00', room: 'Hall A', invigilator: 'Mrs. Adams', status: 'Today' },
  { id: 'ex-2', subject: 'English Literature', grade: 'Grade 8', date: '2026-03-04', time: '11:00-12:30', room: 'Room 105', invigilator: 'Mr. Davis', status: 'Today' },
  { id: 'ex-3', subject: 'Mathematics', grade: 'Grade 12', date: '2026-03-06', time: '09:00-11:30', room: 'Hall A', invigilator: 'Mrs. Nelson', status: 'Scheduled' },
  { id: 'ex-4', subject: 'Physics', grade: 'Grade 11', date: '2026-03-06', time: '13:00-15:00', room: 'Hall B', invigilator: 'Mr. Patel', status: 'Scheduled' },
  { id: 'ex-5', subject: 'History', grade: 'Grade 9', date: '2026-03-08', time: '09:00-10:30', room: 'Room 301', invigilator: 'Mr. Harris', status: 'Scheduled' },
  { id: 'ex-6', subject: 'Chemistry', grade: 'Grade 10', date: '2026-03-10', time: '09:00-11:00', room: 'Lab 1', invigilator: 'Mrs. Nelson', status: 'Scheduled' },
];

/* ═══ Transport Routes ═══ */
export const transportRoutes = [
  { id: 'rt-1', name: 'Route #1 — North', driver: 'James Wilson', vehicle: 'Bus-001', students: 42, capacity: 48, stops: 8, status: 'Active', morningTime: '07:15', afternoonTime: '15:30' },
  { id: 'rt-2', name: 'Route #2 — South', driver: 'Maria Garcia', vehicle: 'Bus-002', students: 38, capacity: 48, stops: 6, status: 'Active', morningTime: '07:00', afternoonTime: '15:30' },
  { id: 'rt-3', name: 'Route #3 — East', driver: 'David Lee', vehicle: 'Bus-003', students: 45, capacity: 48, stops: 10, status: 'Active', morningTime: '07:20', afternoonTime: '15:45' },
  { id: 'rt-4', name: 'Route #4 — West', driver: 'Unassigned', vehicle: 'Bus-004', students: 52, capacity: 48, stops: 9, status: 'Issue', morningTime: '07:10', afternoonTime: '15:30' },
];

/* ═══ Facilities / Rooms ═══ */
export const facilities = [
  { id: 'fac-1', name: 'Room 101', type: 'Classroom', capacity: 25, allocated: 'Grade 1A', status: 'In Use', floor: 'Ground' },
  { id: 'fac-2', name: 'Room 204', type: 'Classroom', capacity: 30, allocated: 'Under Maintenance', status: 'Maintenance', floor: '2nd' },
  { id: 'fac-3', name: 'Hall A', type: 'Exam Hall', capacity: 120, allocated: 'Exams', status: 'In Use', floor: 'Ground' },
  { id: 'fac-4', name: 'Lab 1', type: 'Science Lab', capacity: 25, allocated: 'Grade 10 Chemistry', status: 'In Use', floor: '3rd' },
  { id: 'fac-5', name: 'Library', type: 'Library', capacity: 60, allocated: 'Open', status: 'Available', floor: '2nd' },
  { id: 'fac-6', name: 'Sports Field', type: 'Outdoor', capacity: 200, allocated: 'PE Classes', status: 'In Use', floor: 'Ext' },
  { id: 'fac-7', name: 'Room 501', type: 'Classroom', capacity: 25, allocated: 'Grade 11A', status: 'In Use', floor: '5th' },
  { id: 'fac-8', name: 'Computer Lab', type: 'Lab', capacity: 30, allocated: 'IT Classes', status: 'In Use', floor: '3rd' },
];

/* ═══ Announcements ═══ */
export const announcements = [
  { id: 'ann-1', title: 'Parent-Teacher Conferences Schedule', audience: 'All Parents', author: 'Principal Adams', date: '2026-03-02', status: 'Published', reads: 312 },
  { id: 'ann-2', title: 'Fire Drill — Thursday March 6', audience: 'All Staff, Students', author: 'Safety Officer', date: '2026-03-03', status: 'Published', reads: 428 },
  { id: 'ann-3', title: 'Spring Break Reminders', audience: 'All', author: 'Admin Office', date: '2026-03-04', status: 'Draft', reads: 0 },
  { id: 'ann-4', title: 'Grade 10-12 Career Fair', audience: 'Grade 10-12 Students & Parents', author: 'Guidance Counselor', date: '2026-03-01', status: 'Published', reads: 145 },
  { id: 'ann-5', title: 'Bus Route #4 Temporary Change', audience: 'Route 4 Parents', author: 'Transport Coordinator', date: '2026-03-04', status: 'Scheduled', reads: 0 },
];

/* ═══ Audit Log ═══ */
export const auditLog = [
  { id: 'aud-1', action: 'Student Record Updated', user: 'Ms. Johnson', target: 'Emma Clark — DOB corrected', timestamp: '2026-03-04 09:15', module: 'Students', severity: 'info' },
  { id: 'aud-2', action: 'Admission Approved', user: 'Principal Adams', target: 'Mia Thompson → Grade 4A', timestamp: '2026-03-03 16:20', module: 'Admissions', severity: 'info' },
  { id: 'aud-3', action: 'Invoice Generated', user: 'Finance System', target: 'INV-2026-0412 — Ethan Williams', timestamp: '2026-03-03 14:00', module: 'Finance', severity: 'info' },
  { id: 'aud-4', action: 'Leave Approved', user: 'Principal Adams', target: 'Mr. Okoro — 3 days medical', timestamp: '2026-03-02 11:30', module: 'Staff', severity: 'info' },
  { id: 'aud-5', action: 'Grade Modified', user: 'Mrs. Nelson', target: 'Grade 10 Biology — 3 marks updated', timestamp: '2026-03-02 10:45', module: 'Exams', severity: 'warning' },
  { id: 'aud-6', action: 'Student Suspended', user: 'Principal Adams', target: 'Lucas Chen — Disciplinary', timestamp: '2026-03-01 15:00', module: 'Students', severity: 'critical' },
  { id: 'aud-7', action: 'Fee Discount Applied', user: 'Finance Admin', target: 'Marcus Wilson — 25% scholarship', timestamp: '2026-02-28 09:00', module: 'Finance', severity: 'warning' },
  { id: 'aud-8', action: 'Bulk Attendance Correction', user: 'Mrs. Grant', target: 'Grade 8A — Feb 28 records', timestamp: '2026-02-28 16:30', module: 'Attendance', severity: 'warning' },
];
