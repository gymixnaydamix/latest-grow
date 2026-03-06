/* ─── Student Data Store ─── Comprehensive demo data for Student Portal ─── */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/* ══════════════════════════════════════════════════════════════════════
 * TYPES
 * ══════════════════════════════════════════════════════════════════════ */

export type AssignmentStatus = 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'graded' | 'returned' | 'missing' | 'late';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type ExamStatus = 'upcoming' | 'in_progress' | 'completed' | 'result_published';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'partial';
export type Priority = 'high' | 'medium' | 'low';
export type AnnouncementCategory = 'academic' | 'event' | 'urgent' | 'general' | 'exam';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  teacherId: string;
  room: string;
  credits: number;
  syllabus: string[];
  currentUnit: string;
  progress: number;
}

export interface TimetableEntry {
  id: string;
  subjectId: string;
  dayOfWeek: number; // 0=Mon, 4=Fri
  startTime: string; // "08:00"
  endTime: string;   // "08:50"
  room: string;
  teacherId: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'exam' | 'event';
  cancelled?: boolean;
  substituteTeacher?: string;
  note?: string;
  onlineLink?: string;
}

export interface StudentAssignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  type: 'homework' | 'project' | 'worksheet' | 'essay' | 'presentation' | 'lab_report';
  dueDate: string;
  assignedDate: string;
  status: AssignmentStatus;
  priority: Priority;
  maxScore: number;
  score?: number;
  feedback?: string;
  instructions: string;
  attachments: string[];
  submittedAt?: string;
  submissionFile?: string;
  allowResubmit: boolean;
  rubric?: { criterion: string; maxPoints: number; points?: number; comment?: string }[];
}

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  seat?: string;
  instructions: string[];
  status: ExamStatus;
  score?: number;
  maxScore: number;
  grade?: string;
  type: 'midterm' | 'final' | 'quiz' | 'unit_test' | 'practical';
}

export interface GradeEntry {
  id: string;
  subjectId: string;
  title: string;
  type: 'assignment' | 'exam' | 'quiz' | 'participation' | 'project';
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  feedback?: string;
  gradedAt: string;
  weight: number;
  rubric?: { criterion: string; earned: number; max: number }[];
}

export interface FeedbackNote {
  id: string;
  from: string;
  fromRole: 'teacher' | 'admin';
  subjectId?: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: 'praise' | 'improvement' | 'general' | 'warning';
}

export interface AttendanceRecord {
  id: string;
  date: string;
  subjectId?: string;
  status: AttendanceStatus;
  remark?: string;
  markedBy?: string;
  period?: number;
}

export interface MessageThread {
  id: string;
  subject: string;
  participantIds: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  priority?: Priority;
  archived: boolean;
  type: 'teacher' | 'class' | 'support' | 'admin';
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  body: string;
  sentAt: string;
  read: boolean;
  attachments?: string[];
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  author: string;
  authorRole: string;
  createdAt: string;
  read: boolean;
  pinned: boolean;
  bookmarked: boolean;
  attachments?: string[];
  targetAudience: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location: string;
  type: 'academic' | 'sports' | 'cultural' | 'trip' | 'workshop' | 'competition' | 'club';
  registrationOpen: boolean;
  registered: boolean;
  capacity?: number;
  enrolled?: number;
}

export interface StudentDocument {
  id: string;
  title: string;
  type: 'report_card' | 'transcript' | 'certificate' | 'letter' | 'id_card' | 'permission_form' | 'enrollment';
  uploadedAt: string;
  fileSize: string;
  downloadUrl: string;
  status: 'available' | 'pending' | 'expired';
}

export interface StudentInvoice {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  paidAmount: number;
  items: { description: string; amount: number }[];
  issuedAt: string;
  receiptUrl?: string;
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'technical' | 'finance' | 'document' | 'general';
  status: TicketStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  responses: { from: string; message: string; at: string }[];
}

export interface StudentNotification {
  id: string;
  title: string;
  message: string;
  type: 'assignment' | 'exam' | 'grade' | 'attendance' | 'announcement' | 'message' | 'fee' | 'timetable' | 'document';
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}

export interface CalendarItem {
  id: string;
  title: string;
  date: string;
  type: 'holiday' | 'exam' | 'event' | 'deadline' | 'class';
  color: string;
}

/* ══════════════════════════════════════════════════════════════════════
 * DEMO DATA — Realistic school content
 * ══════════════════════════════════════════════════════════════════════ */

const TEACHERS: Teacher[] = [
  { id: 't1', name: 'Mr. Robert Johnson', email: 'r.johnson@school.edu', department: 'Mathematics' },
  { id: 't2', name: 'Dr. Sarah Mitchell', email: 's.mitchell@school.edu', department: 'Science' },
  { id: 't3', name: 'Ms. Emily Chen', email: 'e.chen@school.edu', department: 'English' },
  { id: 't4', name: 'Mr. David Williams', email: 'd.williams@school.edu', department: 'History' },
  { id: 't5', name: 'Mrs. Laura Martinez', email: 'l.martinez@school.edu', department: 'Art' },
  { id: 't6', name: 'Mr. James Thompson', email: 'j.thompson@school.edu', department: 'Physical Education' },
  { id: 't7', name: 'Dr. Priya Kapoor', email: 'p.kapoor@school.edu', department: 'Computer Science' },
  { id: 't8', name: 'Mrs. Angela Roberts', email: 'a.roberts@school.edu', department: 'French' },
];

const SUBJECTS: Subject[] = [
  { id: 's1', name: 'Mathematics', code: 'MATH-301', color: '#818cf8', teacherId: 't1', room: 'Room 201', credits: 4, syllabus: ['Calculus II', 'Linear Algebra', 'Differential Equations', 'Statistics'], currentUnit: 'Linear Algebra', progress: 68 },
  { id: 's2', name: 'Physics', code: 'PHYS-201', color: '#34d399', teacherId: 't2', room: 'Lab 102', credits: 4, syllabus: ['Mechanics', 'Thermodynamics', 'Waves & Optics', 'Electromagnetism'], currentUnit: 'Waves & Optics', progress: 55 },
  { id: 's3', name: 'English Literature', code: 'ENG-201', color: '#f472b6', teacherId: 't3', room: 'Room 305', credits: 3, syllabus: ['Shakespeare', 'Modern Poetry', 'Essay Writing', 'Literary Criticism'], currentUnit: 'Modern Poetry', progress: 72 },
  { id: 's4', name: 'World History', code: 'HIST-202', color: '#f97316', teacherId: 't4', room: 'Room 108', credits: 3, syllabus: ['World War II', 'Cold War Era', 'Decolonization', 'Modern Conflicts'], currentUnit: 'Cold War Era', progress: 60 },
  { id: 's5', name: 'Visual Arts', code: 'ART-101', color: '#a78bfa', teacherId: 't5', room: 'Art Studio', credits: 2, syllabus: ['Color Theory', 'Perspective Drawing', 'Digital Art', 'Portfolio'], currentUnit: 'Digital Art', progress: 80 },
  { id: 's6', name: 'Computer Science', code: 'CS-301', color: '#38bdf8', teacherId: 't7', room: 'Lab 201', credits: 4, syllabus: ['Data Structures', 'Algorithms', 'Web Development', 'Databases'], currentUnit: 'Algorithms', progress: 62 },
  { id: 's7', name: 'Physical Education', code: 'PE-101', color: '#84cc16', teacherId: 't6', room: 'Gymnasium', credits: 1, syllabus: ['Fitness', 'Team Sports', 'Individual Sports', 'Health'], currentUnit: 'Team Sports', progress: 75 },
  { id: 's8', name: 'French', code: 'FR-201', color: '#fbbf24', teacherId: 't8', room: 'Room 402', credits: 3, syllabus: ['Grammar', 'Conversation', 'Literature', 'Culture'], currentUnit: 'Conversation', progress: 58 },
];

const TIMETABLE: TimetableEntry[] = [
  // Monday
  { id: 'tt-01', subjectId: 's1', dayOfWeek: 0, startTime: '08:00', endTime: '08:50', room: 'Room 201', teacherId: 't1', type: 'lecture' },
  { id: 'tt-02', subjectId: 's2', dayOfWeek: 0, startTime: '09:00', endTime: '09:50', room: 'Lab 102', teacherId: 't2', type: 'lab' },
  { id: 'tt-03', subjectId: 's3', dayOfWeek: 0, startTime: '10:10', endTime: '11:00', room: 'Room 305', teacherId: 't3', type: 'lecture' },
  { id: 'tt-04', subjectId: 's6', dayOfWeek: 0, startTime: '11:10', endTime: '12:00', room: 'Lab 201', teacherId: 't7', type: 'lecture' },
  { id: 'tt-05', subjectId: 's4', dayOfWeek: 0, startTime: '13:00', endTime: '13:50', room: 'Room 108', teacherId: 't4', type: 'lecture' },
  { id: 'tt-06', subjectId: 's7', dayOfWeek: 0, startTime: '14:00', endTime: '14:50', room: 'Gymnasium', teacherId: 't6', type: 'lecture' },
  // Tuesday
  { id: 'tt-07', subjectId: 's6', dayOfWeek: 1, startTime: '08:00', endTime: '08:50', room: 'Lab 201', teacherId: 't7', type: 'lab' },
  { id: 'tt-08', subjectId: 's1', dayOfWeek: 1, startTime: '09:00', endTime: '09:50', room: 'Room 201', teacherId: 't1', type: 'lecture' },
  { id: 'tt-09', subjectId: 's8', dayOfWeek: 1, startTime: '10:10', endTime: '11:00', room: 'Room 402', teacherId: 't8', type: 'lecture' },
  { id: 'tt-10', subjectId: 's2', dayOfWeek: 1, startTime: '11:10', endTime: '12:00', room: 'Lab 102', teacherId: 't2', type: 'lecture' },
  { id: 'tt-11', subjectId: 's5', dayOfWeek: 1, startTime: '13:00', endTime: '13:50', room: 'Art Studio', teacherId: 't5', type: 'lecture' },
  { id: 'tt-12', subjectId: 's3', dayOfWeek: 1, startTime: '14:00', endTime: '14:50', room: 'Room 305', teacherId: 't3', type: 'tutorial' },
  // Wednesday
  { id: 'tt-13', subjectId: 's2', dayOfWeek: 2, startTime: '08:00', endTime: '09:30', room: 'Lab 102', teacherId: 't2', type: 'lab' },
  { id: 'tt-14', subjectId: 's4', dayOfWeek: 2, startTime: '09:45', endTime: '10:35', room: 'Room 108', teacherId: 't4', type: 'lecture' },
  { id: 'tt-15', subjectId: 's1', dayOfWeek: 2, startTime: '10:45', endTime: '11:35', room: 'Room 201', teacherId: 't1', type: 'tutorial' },
  { id: 'tt-16', subjectId: 's6', dayOfWeek: 2, startTime: '13:00', endTime: '13:50', room: 'Lab 201', teacherId: 't7', type: 'lecture' },
  { id: 'tt-17', subjectId: 's8', dayOfWeek: 2, startTime: '14:00', endTime: '14:50', room: 'Room 402', teacherId: 't8', type: 'lecture' },
  // Thursday
  { id: 'tt-18', subjectId: 's3', dayOfWeek: 3, startTime: '08:00', endTime: '08:50', room: 'Room 305', teacherId: 't3', type: 'lecture' },
  { id: 'tt-19', subjectId: 's5', dayOfWeek: 3, startTime: '09:00', endTime: '10:30', room: 'Art Studio', teacherId: 't5', type: 'lab' },
  { id: 'tt-20', subjectId: 's1', dayOfWeek: 3, startTime: '10:45', endTime: '11:35', room: 'Room 201', teacherId: 't1', type: 'lecture' },
  { id: 'tt-21', subjectId: 's2', dayOfWeek: 3, startTime: '13:00', endTime: '13:50', room: 'Lab 102', teacherId: 't2', type: 'lecture' },
  { id: 'tt-22', subjectId: 's4', dayOfWeek: 3, startTime: '14:00', endTime: '14:50', room: 'Room 108', teacherId: 't4', type: 'lecture' },
  // Friday
  { id: 'tt-23', subjectId: 's6', dayOfWeek: 4, startTime: '08:00', endTime: '09:30', room: 'Lab 201', teacherId: 't7', type: 'lab' },
  { id: 'tt-24', subjectId: 's8', dayOfWeek: 4, startTime: '09:45', endTime: '10:35', room: 'Room 402', teacherId: 't8', type: 'lecture' },
  { id: 'tt-25', subjectId: 's7', dayOfWeek: 4, startTime: '10:45', endTime: '11:35', room: 'Gymnasium', teacherId: 't6', type: 'lecture' },
  { id: 'tt-26', subjectId: 's3', dayOfWeek: 4, startTime: '13:00', endTime: '13:50', room: 'Room 305', teacherId: 't3', type: 'tutorial' },
  { id: 'tt-27', subjectId: 's1', dayOfWeek: 4, startTime: '14:00', endTime: '14:50', room: 'Room 201', teacherId: 't1', type: 'lecture' },
  // Cancelled class
  { id: 'tt-28', subjectId: 's5', dayOfWeek: 4, startTime: '13:00', endTime: '13:50', room: 'Art Studio', teacherId: 't5', type: 'lecture', cancelled: true, note: 'Teacher on professional development' },
];

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

const ASSIGNMENTS: StudentAssignment[] = [
  {
    id: 'a1', title: 'Derivatives & Integration Practice Set', description: 'Complete problems 1-25 from Chapter 7. Show all work and verify solutions.', subjectId: 's1', type: 'homework',
    dueDate: fmt(addDays(today, 1)), assignedDate: fmt(addDays(today, -5)), status: 'in_progress', priority: 'high', maxScore: 100, instructions: 'Show all working. Use standard mathematical notation. Submit as PDF.',
    attachments: ['chapter7_problems.pdf'], allowResubmit: false,
  },
  {
    id: 'a2', title: 'Wave Interference Lab Report', description: 'Write up the findings from the double-slit experiment performed in class.', subjectId: 's2', type: 'lab_report',
    dueDate: fmt(addDays(today, 2)), assignedDate: fmt(addDays(today, -7)), status: 'in_progress', priority: 'high', maxScore: 80, instructions: 'Include hypothesis, methodology, data tables, analysis, and conclusion. Minimum 1500 words.',
    attachments: ['lab_template.docx', 'experiment_data.csv'], allowResubmit: true,
  },
  {
    id: 'a3', title: 'Poetry Analysis Essay — Robert Frost', description: 'Analyse "The Road Not Taken" using literary criticism techniques discussed in class.', subjectId: 's3', type: 'essay',
    dueDate: fmt(addDays(today, 4)), assignedDate: fmt(addDays(today, -3)), status: 'not_started', priority: 'medium', maxScore: 100, instructions: 'MLA format, 1000-1500 words. Include at least 3 scholarly sources.',
    attachments: [], allowResubmit: true,
  },
  {
    id: 'a4', title: 'Cold War Timeline Project', description: 'Create an interactive timeline of major Cold War events from 1947 to 1991.', subjectId: 's4', type: 'project',
    dueDate: fmt(addDays(today, 7)), assignedDate: fmt(addDays(today, -14)), status: 'in_progress', priority: 'medium', maxScore: 150, instructions: 'Include at least 20 events with descriptions, images, and sources. Digital submission.',
    attachments: ['timeline_rubric.pdf'], allowResubmit: false,
  },
  {
    id: 'a5', title: 'Binary Search Tree Implementation', description: 'Implement a BST with insert, delete, search, and traversal operations in Python.', subjectId: 's6', type: 'project',
    dueDate: fmt(addDays(today, 5)), assignedDate: fmt(addDays(today, -10)), status: 'in_progress', priority: 'high', maxScore: 120, instructions: 'Include unit tests. Handle edge cases. Document time complexity.',
    attachments: ['starter_code.py'], allowResubmit: true,
  },
  {
    id: 'a6', title: 'French Conversation Dialogue', description: 'Write and record a 3-minute dialogue about daily routines with a partner.', subjectId: 's8', type: 'presentation',
    dueDate: fmt(addDays(today, 3)), assignedDate: fmt(addDays(today, -6)), status: 'not_started', priority: 'medium', maxScore: 60, instructions: 'Use present tense and reflexive verbs. Submit written script + audio recording.',
    attachments: [], allowResubmit: false,
  },
  {
    id: 'a7', title: 'Digital Self-Portrait', description: 'Create a digital self-portrait using the techniques learned in the Digital Art module.', subjectId: 's5', type: 'project',
    dueDate: fmt(addDays(today, 10)), assignedDate: fmt(addDays(today, -3)), status: 'not_started', priority: 'low', maxScore: 100, instructions: 'Minimum resolution 2000x2000px. Submit PSD and final JPEG.',
    attachments: ['digital_art_guide.pdf'], allowResubmit: true,
  },
  // Past completed/graded assignments
  {
    id: 'a8', title: 'Quadratic Equations Worksheet', description: 'Practice solving quadratic equations using various methods.', subjectId: 's1', type: 'worksheet',
    dueDate: fmt(addDays(today, -10)), assignedDate: fmt(addDays(today, -17)), status: 'graded', priority: 'medium', maxScore: 50, score: 47, feedback: 'Excellent work! Minor error in problem 12 — check your factoring.',
    instructions: 'Show all steps.', attachments: [], submittedAt: fmt(addDays(today, -11)), allowResubmit: false,
  },
  {
    id: 'a9', title: 'Thermodynamics Problem Set', description: 'Solve problems on heat transfer and entropy.', subjectId: 's2', type: 'homework',
    dueDate: fmt(addDays(today, -5)), assignedDate: fmt(addDays(today, -12)), status: 'graded', priority: 'high', maxScore: 80, score: 72, feedback: 'Good understanding of core concepts. Review entropy calculations.',
    instructions: 'Include diagrams where applicable.', attachments: [], submittedAt: fmt(addDays(today, -5)), allowResubmit: false,
  },
  {
    id: 'a10', title: 'Shakespeare Sonnet Analysis', description: 'Analyse Sonnet 18 and its literary devices.', subjectId: 's3', type: 'essay',
    dueDate: fmt(addDays(today, -8)), assignedDate: fmt(addDays(today, -15)), status: 'graded', priority: 'medium', maxScore: 100, score: 91,
    feedback: 'Outstanding analysis of metaphor and meter. Your thesis was compelling and well-supported.',
    instructions: 'MLA format.', attachments: [], submittedAt: fmt(addDays(today, -9)), allowResubmit: false,
    rubric: [
      { criterion: 'Thesis & Argument', maxPoints: 25, points: 24, comment: 'Strong, clear thesis' },
      { criterion: 'Evidence & Analysis', maxPoints: 30, points: 28, comment: 'Excellent textual evidence' },
      { criterion: 'Organization', maxPoints: 20, points: 19, comment: 'Well-structured' },
      { criterion: 'Language & Style', maxPoints: 15, points: 13, comment: 'Minor grammar issues' },
      { criterion: 'Sources & Citations', maxPoints: 10, points: 7, comment: 'Add one more scholarly source' },
    ],
  },
  {
    id: 'a11', title: 'WWII Research Paper', description: 'Research paper on D-Day and its strategic significance.', subjectId: 's4', type: 'essay',
    dueDate: fmt(addDays(today, -3)), assignedDate: fmt(addDays(today, -20)), status: 'submitted', priority: 'high', maxScore: 100,
    instructions: 'Chicago style. 2500-3000 words.', attachments: [], submittedAt: fmt(addDays(today, -4)), allowResubmit: false,
  },
  // Missing assignment
  {
    id: 'a12', title: 'Fitness Activity Log — Week 8', description: 'Log your weekly fitness activities.', subjectId: 's7', type: 'worksheet',
    dueDate: fmt(addDays(today, -2)), assignedDate: fmt(addDays(today, -9)), status: 'missing', priority: 'low', maxScore: 20,
    instructions: 'Record type, duration, and intensity of each activity.', attachments: [], allowResubmit: true,
  },
];

const EXAMS: Exam[] = [
  { id: 'e1', title: 'Mathematics Midterm', subjectId: 's1', date: fmt(addDays(today, 12)), startTime: '09:00', endTime: '11:00', venue: 'Exam Hall A', seat: 'Row 3, Seat 14', instructions: ['Calculator allowed (no CAS)', 'Formula sheet provided', 'No electronic devices', 'Write in blue or black ink'], status: 'upcoming', maxScore: 100, type: 'midterm' },
  { id: 'e2', title: 'Physics Unit Test — Waves', subjectId: 's2', date: fmt(addDays(today, 5)), startTime: '10:00', endTime: '11:00', venue: 'Room 108', instructions: ['Closed book', 'Calculator allowed', 'Draw diagrams where needed'], status: 'upcoming', maxScore: 60, type: 'unit_test' },
  { id: 'e3', title: 'English Literature Quiz', subjectId: 's3', date: fmt(addDays(today, 3)), startTime: '08:00', endTime: '08:30', venue: 'Room 305', instructions: ['Short answer format', 'Cover chapters 5-8'], status: 'upcoming', maxScore: 30, type: 'quiz' },
  { id: 'e4', title: 'History Midterm', subjectId: 's4', date: fmt(addDays(today, 15)), startTime: '09:00', endTime: '11:00', venue: 'Exam Hall B', seat: 'Row 5, Seat 8', instructions: ['Essay format', 'Choose 3 of 5 questions', 'No notes allowed'], status: 'upcoming', maxScore: 100, type: 'midterm' },
  { id: 'e5', title: 'CS Algorithms Practical', subjectId: 's6', date: fmt(addDays(today, 8)), startTime: '14:00', endTime: '16:00', venue: 'Lab 201', instructions: ['Programming exam on school laptops', 'Internet NOT allowed', 'Standard library only'], status: 'upcoming', maxScore: 80, type: 'practical' },
  { id: 'e6', title: 'French Oral Exam', subjectId: 's8', date: fmt(addDays(today, 18)), startTime: '13:00', endTime: '13:20', venue: 'Room 402', instructions: ['5-minute prepared topic + 10-minute discussion', 'Speak only in French'], status: 'upcoming', maxScore: 50, type: 'final' },
  // Past exams with results
  { id: 'e7', title: 'Mathematics Quiz — Calculus', subjectId: 's1', date: fmt(addDays(today, -14)), startTime: '08:00', endTime: '08:30', venue: 'Room 201', instructions: [], status: 'result_published', maxScore: 30, score: 28, grade: 'A', type: 'quiz' },
  { id: 'e8', title: 'Physics Unit Test — Thermodynamics', subjectId: 's2', date: fmt(addDays(today, -21)), startTime: '10:00', endTime: '11:00', venue: 'Room 108', instructions: [], status: 'result_published', maxScore: 60, score: 52, grade: 'B+', type: 'unit_test' },
  { id: 'e9', title: 'CS Data Structures Quiz', subjectId: 's6', date: fmt(addDays(today, -7)), startTime: '14:00', endTime: '14:30', venue: 'Lab 201', instructions: [], status: 'result_published', maxScore: 40, score: 38, grade: 'A', type: 'quiz' },
];

const GRADES: GradeEntry[] = [
  { id: 'g1', subjectId: 's1', title: 'Quadratic Equations Worksheet', type: 'assignment', score: 47, maxScore: 50, percentage: 94, grade: 'A', feedback: 'Excellent work!', gradedAt: fmt(addDays(today, -9)), weight: 10 },
  { id: 'g2', subjectId: 's1', title: 'Calculus Quiz', type: 'quiz', score: 28, maxScore: 30, percentage: 93, grade: 'A', gradedAt: fmt(addDays(today, -13)), weight: 15 },
  { id: 'g3', subjectId: 's2', title: 'Thermodynamics Problem Set', type: 'assignment', score: 72, maxScore: 80, percentage: 90, grade: 'A-', feedback: 'Review entropy calculations.', gradedAt: fmt(addDays(today, -4)), weight: 10 },
  { id: 'g4', subjectId: 's2', title: 'Thermodynamics Unit Test', type: 'exam', score: 52, maxScore: 60, percentage: 87, grade: 'B+', gradedAt: fmt(addDays(today, -20)), weight: 25 },
  { id: 'g5', subjectId: 's3', title: 'Shakespeare Sonnet Analysis', type: 'assignment', score: 91, maxScore: 100, percentage: 91, grade: 'A', feedback: 'Outstanding analysis.', gradedAt: fmt(addDays(today, -7)), weight: 20,
    rubric: [
      { criterion: 'Thesis & Argument', earned: 24, max: 25 },
      { criterion: 'Evidence & Analysis', earned: 28, max: 30 },
      { criterion: 'Organization', earned: 19, max: 20 },
      { criterion: 'Language & Style', earned: 13, max: 15 },
      { criterion: 'Sources', earned: 7, max: 10 },
    ],
  },
  { id: 'g6', subjectId: 's3', title: 'Participation — Q1', type: 'participation', score: 18, maxScore: 20, percentage: 90, grade: 'A-', gradedAt: fmt(addDays(today, -15)), weight: 5 },
  { id: 'g7', subjectId: 's4', title: 'WWII Map Analysis', type: 'assignment', score: 42, maxScore: 50, percentage: 84, grade: 'B', feedback: 'Good detail, but missing Southeast Asian theatre.', gradedAt: fmt(addDays(today, -12)), weight: 10 },
  { id: 'g8', subjectId: 's5', title: 'Perspective Drawing Portfolio', type: 'project', score: 88, maxScore: 100, percentage: 88, grade: 'B+', feedback: 'Beautiful technique. Work on vanishing point accuracy.', gradedAt: fmt(addDays(today, -6)), weight: 30 },
  { id: 'g9', subjectId: 's6', title: 'Data Structures Quiz', type: 'quiz', score: 38, maxScore: 40, percentage: 95, grade: 'A', gradedAt: fmt(addDays(today, -6)), weight: 15 },
  { id: 'g10', subjectId: 's6', title: 'Linked List Implementation', type: 'project', score: 112, maxScore: 120, percentage: 93, grade: 'A', feedback: 'Clean code, excellent test coverage.', gradedAt: fmt(addDays(today, -18)), weight: 20 },
  { id: 'g11', subjectId: 's7', title: 'Fitness Assessment', type: 'participation', score: 16, maxScore: 20, percentage: 80, grade: 'B', gradedAt: fmt(addDays(today, -25)), weight: 20 },
  { id: 'g12', subjectId: 's8', title: 'Grammar Test', type: 'quiz', score: 27, maxScore: 30, percentage: 90, grade: 'A-', gradedAt: fmt(addDays(today, -10)), weight: 15 },
  { id: 'g13', subjectId: 's8', title: 'Reading Comprehension', type: 'assignment', score: 43, maxScore: 50, percentage: 86, grade: 'B+', feedback: 'Good understanding but watch verb tense agreement.', gradedAt: fmt(addDays(today, -3)), weight: 10 },
];

const FEEDBACK: FeedbackNote[] = [
  { id: 'f1', from: 'Mr. Robert Johnson', fromRole: 'teacher', subjectId: 's1', message: 'Your calculus quiz performance was impressive. Consider joining the Math Olympiad team this semester.', createdAt: fmt(addDays(today, -2)), read: false, type: 'praise' },
  { id: 'f2', from: 'Dr. Sarah Mitchell', fromRole: 'teacher', subjectId: 's2', message: 'Your lab reports are thorough but need to improve your error analysis section. See the guide I attached.', createdAt: fmt(addDays(today, -4)), read: true, type: 'improvement' },
  { id: 'f3', from: 'Ms. Emily Chen', fromRole: 'teacher', subjectId: 's3', message: 'Wonderful essay on Sonnet 18. Your analysis of extended metaphor was the best in the class. Keep it up!', createdAt: fmt(addDays(today, -6)), read: true, type: 'praise' },
  { id: 'f4', from: 'Dr. Priya Kapoor', fromRole: 'teacher', subjectId: 's6', message: 'Great job on the linked list project. Your code was clean and well-documented. Consider contributing to our open-source project.', createdAt: fmt(addDays(today, -5)), read: false, type: 'praise' },
  { id: 'f5', from: 'Mr. David Williams', fromRole: 'teacher', subjectId: 's4', message: 'Your timeline project is progressing well. Make sure to include primary sources for key events.', createdAt: fmt(addDays(today, -1)), read: false, type: 'general' },
  { id: 'f6', from: 'Academic Office', fromRole: 'admin', message: 'Congratulations on making the Honor Roll for Q1! Your hard work is paying off.', createdAt: fmt(addDays(today, -8)), read: true, type: 'praise' },
  { id: 'f7', from: 'Mrs. Laura Martinez', fromRole: 'teacher', subjectId: 's5', message: 'Your color theory work shows real talent. I recommend submitting your portfolio to the state art competition.', createdAt: fmt(addDays(today, -3)), read: false, type: 'praise' },
];

// Generate attendance for last 30 school days
function generateAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  let id = 1;
  for (let i = 45; i >= 0; i--) {
    const d = addDays(today, -i);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue; // skip weekends
    const rand = Math.random();
    const status: AttendanceStatus = rand < 0.88 ? 'present' : rand < 0.93 ? 'late' : rand < 0.97 ? 'excused' : 'absent';
    records.push({
      id: `att-${id++}`,
      date: fmt(d),
      status,
      remark: status === 'late' ? 'Arrived 10 minutes late' : status === 'excused' ? 'Medical appointment' : status === 'absent' ? 'Unexcused absence' : undefined,
      markedBy: 'Homeroom Teacher',
    });
  }
  return records;
}

const ATTENDANCE = generateAttendance();

const THREADS: MessageThread[] = [
  { id: 'mt1', subject: 'Question about calculus homework', participantIds: ['t1'], participantNames: ['Mr. Robert Johnson'], lastMessage: 'Sure, I can explain that derivative rule during office hours.', lastMessageAt: fmt(addDays(today, -1)) + 'T15:30:00', unreadCount: 1, type: 'teacher', archived: false },
  { id: 'mt2', subject: 'Lab report feedback', participantIds: ['t2'], participantNames: ['Dr. Sarah Mitchell'], lastMessage: 'I have attached the error analysis guide for your reference.', lastMessageAt: fmt(addDays(today, -3)) + 'T10:15:00', unreadCount: 0, type: 'teacher', archived: false },
  { id: 'mt3', subject: 'Class 11-B Group Chat', participantIds: ['g1'], participantNames: ['Class 11-B'], lastMessage: 'Does anyone have notes from yesterday\'s physics lecture?', lastMessageAt: fmt(today) + 'T08:45:00', unreadCount: 5, type: 'class', archived: false },
  { id: 'mt4', subject: 'IT Help — Password Reset', participantIds: ['support'], participantNames: ['IT Support'], lastMessage: 'Your password has been reset. Please check your email.', lastMessageAt: fmt(addDays(today, -7)) + 'T09:00:00', unreadCount: 0, type: 'support', archived: false },
  { id: 'mt5', subject: 'Art competition submission', participantIds: ['t5'], participantNames: ['Mrs. Laura Martinez'], lastMessage: 'The deadline for the state competition is March 20. Let me know if you need help.', lastMessageAt: fmt(addDays(today, -2)) + 'T14:20:00', unreadCount: 1, type: 'teacher', archived: false },
  { id: 'mt6', subject: 'Timeline project clarification', participantIds: ['t4'], participantNames: ['Mr. David Williams'], lastMessage: 'Great question. Yes, include the Berlin Blockade as a separate event.', lastMessageAt: fmt(addDays(today, 0)) + 'T11:00:00', unreadCount: 0, type: 'teacher', archived: false },
];

const MESSAGES: ChatMessage[] = [
  { id: 'msg1', threadId: 'mt1', senderId: 'student', senderName: 'You', body: 'Hi Mr. Johnson, I\'m stuck on problem 15 of the derivatives practice set. The chain rule application isn\'t clear to me.', sentAt: fmt(addDays(today, -1)) + 'T14:00:00', read: true },
  { id: 'msg2', threadId: 'mt1', senderId: 't1', senderName: 'Mr. Robert Johnson', body: 'Sure, I can explain that derivative rule during office hours. Come by Room 201 tomorrow at 3 PM.', sentAt: fmt(addDays(today, -1)) + 'T15:30:00', read: false },
  { id: 'msg3', threadId: 'mt3', senderId: 'classmate1', senderName: 'Alex Rivera', body: 'Does anyone have notes from yesterday\'s physics lecture?', sentAt: fmt(today) + 'T08:45:00', read: false },
  { id: 'msg4', threadId: 'mt3', senderId: 'classmate2', senderName: 'Jamie Park', body: 'I have them! I\'ll upload a photo after lunch.', sentAt: fmt(today) + 'T08:47:00', read: false },
];

const ANNOUNCEMENTS: Announcement[] = [
  { id: 'ann1', title: 'Midterm Exam Schedule Published', body: 'The midterm examination schedule for March 2026 has been published. Please check the Exams section for your individual schedule. All exams will be held in the main examination halls unless otherwise noted.', category: 'exam', author: 'Academic Office', authorRole: 'Administration', createdAt: fmt(addDays(today, -1)), read: false, pinned: true, bookmarked: false, targetAudience: 'All Students' },
  { id: 'ann2', title: 'Spring Science Fair — Registration Open', body: 'Registration for the Annual Spring Science Fair is now open! Projects can be individual or in pairs. Registration closes March 15. Prizes include scholarships and lab equipment.', category: 'event', author: 'Dr. Sarah Mitchell', authorRole: 'Science Department', createdAt: fmt(addDays(today, -2)), read: false, pinned: false, bookmarked: false, targetAudience: 'All Students' },
  { id: 'ann3', title: 'Library Hours Extended During Exam Period', body: 'The school library will be open until 8 PM during the examination period (March 10-25). Additional study rooms are available on a first-come basis.', category: 'academic', author: 'Library Services', authorRole: 'Administration', createdAt: fmt(addDays(today, -3)), read: true, pinned: false, bookmarked: true, targetAudience: 'All Students' },
  { id: 'ann4', title: 'School Bus Route Change — Route 7', body: 'Due to road construction, Bus Route 7 will be temporarily rerouted starting March 8. The new route adds approximately 5 minutes to the journey. A map of the new route is attached.', category: 'general', author: 'Transport Office', authorRole: 'Administration', createdAt: fmt(addDays(today, -4)), read: true, pinned: false, bookmarked: false, targetAudience: 'Route 7 Students' },
  { id: 'ann5', title: 'URGENT: Fire Drill Tomorrow at 10 AM', body: 'A scheduled fire drill will take place tomorrow at 10:00 AM. Please follow your class evacuation plan and proceed to the designated assembly point. This is a mandatory safety exercise.', category: 'urgent', author: 'Safety Office', authorRole: 'Administration', createdAt: fmt(today), read: false, pinned: true, bookmarked: false, targetAudience: 'All Students' },
  { id: 'ann6', title: 'Math Olympiad Team Tryouts', body: 'Tryouts for the school Math Olympiad team will be held on March 12 in Room 201. All interested students with a B+ or higher in Mathematics are welcome. Preparation materials available in the Math department.', category: 'academic', author: 'Mr. Robert Johnson', authorRole: 'Mathematics', createdAt: fmt(addDays(today, -5)), read: true, pinned: false, bookmarked: true, targetAudience: 'Grade 10-12' },
  { id: 'ann7', title: 'Photography Club — New Members Welcome', body: 'The Photography Club meets every Wednesday after school in Room 310. We have new DSLR cameras and are planning a nature photography trip this month. No experience needed!', category: 'event', author: 'Mrs. Laura Martinez', authorRole: 'Art Department', createdAt: fmt(addDays(today, -6)), read: true, pinned: false, bookmarked: false, targetAudience: 'All Students' },
  { id: 'ann8', title: 'Grade 11 Parent-Teacher Conference', body: 'The parent-teacher conference for Grade 11 will be held on March 22. Please inform your parents/guardians. Appointment slots can be booked through the parent portal.', category: 'general', author: 'Academic Office', authorRole: 'Administration', createdAt: fmt(addDays(today, -7)), read: true, pinned: false, bookmarked: false, targetAudience: 'Grade 11' },
];

const EVENTS: SchoolEvent[] = [
  { id: 'ev1', title: 'Spring Science Fair', description: 'Annual science fair showcasing student research projects. Prizes for top 3 in each category.', date: fmt(addDays(today, 20)), startTime: '09:00', endTime: '16:00', location: 'Main Auditorium', type: 'competition', registrationOpen: true, registered: false, capacity: 200, enrolled: 145 },
  { id: 'ev2', title: 'Inter-School Basketball Tournament', description: 'Our varsity team competes against Westside Academy. Come support the Eagles!', date: fmt(addDays(today, 6)), startTime: '15:00', endTime: '17:00', location: 'Sports Complex', type: 'sports', registrationOpen: false, registered: false },
  { id: 'ev3', title: 'Creative Writing Workshop', description: 'Guest author Ms. J. Rivera leads a workshop on short fiction writing techniques.', date: fmt(addDays(today, 9)), startTime: '14:00', endTime: '16:00', location: 'Library Hall', type: 'workshop', registrationOpen: true, registered: true, capacity: 30, enrolled: 22 },
  { id: 'ev4', title: 'Robotics Club Showcase', description: 'See the latest projects from the Robotics Club, including autonomous drones and line-following robots.', date: fmt(addDays(today, 13)), startTime: '13:00', endTime: '15:00', location: 'Lab 201', type: 'club', registrationOpen: false, registered: false },
  { id: 'ev5', title: 'Museum Field Trip — Natural History', description: 'Grade 11 field trip to the Natural History Museum. Permission forms required.', date: fmt(addDays(today, 16)), startTime: '08:00', endTime: '15:00', location: 'Off-campus', type: 'trip', registrationOpen: true, registered: false, capacity: 60, enrolled: 48 },
  { id: 'ev6', title: 'Career Day — Tech Industry', description: 'Representatives from Google, Microsoft, and local startups share career insights.', date: fmt(addDays(today, 22)), startTime: '10:00', endTime: '14:00', location: 'Main Auditorium', type: 'workshop', registrationOpen: true, registered: false, capacity: 150, enrolled: 89 },
  { id: 'ev7', title: 'Annual School Concert', description: 'Featuring performances by the school choir, orchestra, and band.', date: fmt(addDays(today, 25)), startTime: '18:00', endTime: '20:00', location: 'Performing Arts Center', type: 'cultural', registrationOpen: false, registered: false },
];

const DOCUMENTS: StudentDocument[] = [
  { id: 'doc1', title: 'Report Card — Q1 2025-26', type: 'report_card', uploadedAt: fmt(addDays(today, -30)), fileSize: '245 KB', downloadUrl: '#', status: 'available' },
  { id: 'doc2', title: 'Report Card — Q2 2025-26', type: 'report_card', uploadedAt: fmt(addDays(today, -5)), fileSize: '252 KB', downloadUrl: '#', status: 'available' },
  { id: 'doc3', title: 'Academic Transcript 2024-25', type: 'transcript', uploadedAt: fmt(addDays(today, -60)), fileSize: '180 KB', downloadUrl: '#', status: 'available' },
  { id: 'doc4', title: 'Certificate of Merit — Science Fair', type: 'certificate', uploadedAt: fmt(addDays(today, -45)), fileSize: '1.2 MB', downloadUrl: '#', status: 'available' },
  { id: 'doc5', title: 'Student ID Pass 2025-26', type: 'id_card', uploadedAt: fmt(addDays(today, -90)), fileSize: '85 KB', downloadUrl: '#', status: 'available' },
  { id: 'doc6', title: 'Museum Field Trip Permission Form', type: 'permission_form', uploadedAt: fmt(addDays(today, -2)), fileSize: '120 KB', downloadUrl: '#', status: 'pending' },
  { id: 'doc7', title: 'Enrollment Confirmation 2025-26', type: 'enrollment', uploadedAt: fmt(addDays(today, -120)), fileSize: '310 KB', downloadUrl: '#', status: 'available' },
  { id: 'doc8', title: 'Character Certificate', type: 'certificate', uploadedAt: fmt(addDays(today, -150)), fileSize: '98 KB', downloadUrl: '#', status: 'expired' },
];

const INVOICES: StudentInvoice[] = [
  { id: 'inv1', title: 'Tuition Fee — Spring Semester 2026', amount: 4500, dueDate: fmt(addDays(today, 15)), status: 'pending', paidAmount: 0, items: [{ description: 'Tuition Fee', amount: 4000 }, { description: 'Lab Fee', amount: 300 }, { description: 'Technology Fee', amount: 200 }], issuedAt: fmt(addDays(today, -10)) },
  { id: 'inv2', title: 'Tuition Fee — Fall Semester 2025', amount: 4500, dueDate: fmt(addDays(today, -60)), status: 'paid', paidAmount: 4500, items: [{ description: 'Tuition Fee', amount: 4000 }, { description: 'Lab Fee', amount: 300 }, { description: 'Technology Fee', amount: 200 }], issuedAt: fmt(addDays(today, -120)), receiptUrl: '#' },
  { id: 'inv3', title: 'Science Fair Registration Fee', amount: 25, dueDate: fmt(addDays(today, 10)), status: 'pending', paidAmount: 0, items: [{ description: 'Registration Fee', amount: 25 }], issuedAt: fmt(addDays(today, -2)) },
  { id: 'inv4', title: 'Museum Field Trip Fee', amount: 45, dueDate: fmt(addDays(today, 12)), status: 'pending', paidAmount: 0, items: [{ description: 'Transport', amount: 20 }, { description: 'Entry Fee', amount: 15 }, { description: 'Lunch', amount: 10 }], issuedAt: fmt(addDays(today, -3)) },
  { id: 'inv5', title: 'Sports Equipment Fee', amount: 75, dueDate: fmt(addDays(today, -15)), status: 'overdue', paidAmount: 0, items: [{ description: 'Sports Kit', amount: 50 }, { description: 'Locker Rental', amount: 25 }], issuedAt: fmt(addDays(today, -45)) },
];

const TICKETS: SupportTicket[] = [
  { id: 'tk1', title: 'Cannot access online textbook', description: 'The physics e-textbook link gives a 403 error when I try to open Chapter 7.', category: 'technical', status: 'in_progress', priority: 'medium', createdAt: fmt(addDays(today, -2)), updatedAt: fmt(addDays(today, -1)), responses: [
    { from: 'IT Support', message: 'We are looking into this. Your access should be restored within 24 hours.', at: fmt(addDays(today, -1)) },
  ]},
  { id: 'tk2', title: 'Request transcript for college application', description: 'I need an official transcript sent to MIT by March 20.', category: 'document', status: 'open', priority: 'high', createdAt: fmt(addDays(today, -1)), updatedAt: fmt(addDays(today, -1)), responses: [] },
  { id: 'tk3', title: 'Sports equipment fee question', description: 'I was charged for a sports kit but I opted out of the locker rental. Can this be adjusted?', category: 'finance', status: 'resolved', priority: 'low', createdAt: fmt(addDays(today, -10)), updatedAt: fmt(addDays(today, -7)), responses: [
    { from: 'Finance Office', message: 'We have reviewed your account. The locker rental charge of $25 will be credited back.', at: fmt(addDays(today, -8)) },
    { from: 'Finance Office', message: 'Credit has been applied. Your updated invoice is available in the Fees section.', at: fmt(addDays(today, -7)) },
  ]},
];

const NOTIFICATIONS: StudentNotification[] = [
  { id: 'n1', title: 'Assignment Due Tomorrow', message: 'Derivatives & Integration Practice Set is due tomorrow.', type: 'assignment', createdAt: fmt(today) + 'T07:00:00', read: false },
  { id: 'n2', title: 'New Exam Schedule', message: 'Midterm exam schedule has been published.', type: 'exam', createdAt: fmt(addDays(today, -1)) + 'T09:00:00', read: false },
  { id: 'n3', title: 'Grade Posted', message: 'Your French Reading Comprehension grade is now available.', type: 'grade', createdAt: fmt(addDays(today, -3)) + 'T14:00:00', read: true },
  { id: 'n4', title: 'Missing Assignment', message: 'Fitness Activity Log — Week 8 was not submitted by the deadline.', type: 'assignment', createdAt: fmt(addDays(today, -2)) + 'T08:00:00', read: false },
  { id: 'n5', title: 'Teacher Feedback', message: 'Mr. Johnson left you a comment about your calculus performance.', type: 'grade', createdAt: fmt(addDays(today, -2)) + 'T16:00:00', read: false },
  { id: 'n6', title: 'Attendance Alert', message: 'You were marked late on Monday. Review your attendance record.', type: 'attendance', createdAt: fmt(addDays(today, -4)) + 'T09:30:00', read: true },
  { id: 'n7', title: 'Fee Overdue', message: 'Sports Equipment Fee is overdue. Please clear the balance.', type: 'fee', createdAt: fmt(addDays(today, -5)) + 'T10:00:00', read: true },
  { id: 'n8', title: 'New Announcement', message: 'URGENT: Fire Drill Tomorrow at 10 AM', type: 'announcement', createdAt: fmt(today) + 'T06:30:00', read: false },
];

const CALENDAR: CalendarItem[] = [
  { id: 'cal1', title: 'English Literature Quiz', date: fmt(addDays(today, 3)), type: 'exam', color: '#f472b6' },
  { id: 'cal2', title: 'Physics Unit Test', date: fmt(addDays(today, 5)), type: 'exam', color: '#34d399' },
  { id: 'cal3', title: 'Basketball Tournament', date: fmt(addDays(today, 6)), type: 'event', color: '#f97316' },
  { id: 'cal4', title: 'CS Practical Exam', date: fmt(addDays(today, 8)), type: 'exam', color: '#38bdf8' },
  { id: 'cal5', title: 'Writing Workshop', date: fmt(addDays(today, 9)), type: 'event', color: '#a78bfa' },
  { id: 'cal6', title: 'Spring Break Starts', date: fmt(addDays(today, 11)), type: 'holiday', color: '#84cc16' },
  { id: 'cal7', title: 'Math Midterm', date: fmt(addDays(today, 12)), type: 'exam', color: '#818cf8' },
  { id: 'cal8', title: 'History Midterm', date: fmt(addDays(today, 15)), type: 'exam', color: '#f97316' },
  { id: 'cal9', title: 'BST Project Due', date: fmt(addDays(today, 5)), type: 'deadline', color: '#f43f5e' },
  { id: 'cal10', title: 'Museum Field Trip', date: fmt(addDays(today, 16)), type: 'event', color: '#fbbf24' },
];

/* ══════════════════════════════════════════════════════════════════════
 * STORE
 * ══════════════════════════════════════════════════════════════════════ */

interface StudentDataState {
  // Data
  teachers: Teacher[];
  subjects: Subject[];
  timetable: TimetableEntry[];
  assignments: StudentAssignment[];
  exams: Exam[];
  grades: GradeEntry[];
  feedback: FeedbackNote[];
  attendance: AttendanceRecord[];
  threads: MessageThread[];
  messages: ChatMessage[];
  announcements: Announcement[];
  events: SchoolEvent[];
  documents: StudentDocument[];
  invoices: StudentInvoice[];
  tickets: SupportTicket[];
  notifications: StudentNotification[];
  calendar: CalendarItem[];

  // Helpers
  getSubject: (id: string) => Subject | undefined;
  getTeacher: (id: string) => Teacher | undefined;
  getTeacherForSubject: (subjectId: string) => Teacher | undefined;

  // Actions
  markAnnouncementRead: (id: string) => void;
  toggleBookmark: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  markFeedbackRead: (id: string) => void;
  updateAssignmentStatus: (id: string, status: AssignmentStatus) => void;
  registerForEvent: (id: string) => void;
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'responses'>) => void;
  sendMessage: (threadId: string, body: string) => void;
  downloadDocument: (id: string) => void;
  payInvoice: (id: string, amount: number) => void;
  changePassword: (oldPw: string, newPw: string) => void;
  updateAvatar: (url: string) => void;
  logMood: (mood: string, note?: string) => void;
  bookSession: () => string;
  addPortfolioWork: (work: { title: string; description: string; type: string }) => void;
  submitDeptRequest: (req: { title: string; category: string; description: string }) => void;
}

export const useStudentStore = create<StudentDataState>()(
  devtools(
    (set, get) => ({
      teachers: TEACHERS,
      subjects: SUBJECTS,
      timetable: TIMETABLE,
      assignments: ASSIGNMENTS,
      exams: EXAMS,
      grades: GRADES,
      feedback: FEEDBACK,
      attendance: ATTENDANCE,
      threads: THREADS,
      messages: MESSAGES,
      announcements: ANNOUNCEMENTS,
      events: EVENTS,
      documents: DOCUMENTS,
      invoices: INVOICES,
      tickets: TICKETS,
      notifications: NOTIFICATIONS,
      calendar: CALENDAR,

      getSubject: (id) => get().subjects.find(s => s.id === id),
      getTeacher: (id) => get().teachers.find(t => t.id === id),
      getTeacherForSubject: (subjectId) => {
        const subj = get().subjects.find(s => s.id === subjectId);
        return subj ? get().teachers.find(t => t.id === subj.teacherId) : undefined;
      },

      markAnnouncementRead: (id) => set(s => ({
        announcements: s.announcements.map(a => a.id === id ? { ...a, read: true } : a),
      })),
      toggleBookmark: (id) => set(s => ({
        announcements: s.announcements.map(a => a.id === id ? { ...a, bookmarked: !a.bookmarked } : a),
      })),
      markNotificationRead: (id) => set(s => ({
        notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      })),
      markAllNotificationsRead: () => set(s => ({
        notifications: s.notifications.map(n => ({ ...n, read: true })),
      })),
      markFeedbackRead: (id) => set(s => ({
        feedback: s.feedback.map(f => f.id === id ? { ...f, read: true } : f),
      })),
      updateAssignmentStatus: (id, status) => set(s => ({
        assignments: s.assignments.map(a => a.id === id ? { ...a, status, ...(status === 'submitted' ? { submittedAt: new Date().toISOString() } : {}) } : a),
      })),
      registerForEvent: (id) => set(s => ({
        events: s.events.map(e => e.id === id ? { ...e, registered: true, enrolled: (e.enrolled ?? 0) + 1 } : e),
      })),
      addTicket: (ticket) => set(s => ({
        tickets: [...s.tickets, { ...ticket, id: `tk${s.tickets.length + 1}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), responses: [] }],
      })),
      sendMessage: (threadId, body) => set(s => ({
        messages: [...s.messages, { id: `msg${s.messages.length + 1}`, threadId, senderId: 'student', senderName: 'You', body, sentAt: new Date().toISOString(), read: true }],
        threads: s.threads.map(t => t.id === threadId ? { ...t, lastMessage: body, lastMessageAt: new Date().toISOString() } : t),
      })),

      downloadDocument: (id) => {
        const doc = get().documents.find(d => d.id === id);
        if (doc) {
          const a = document.createElement('a');
          a.href = doc.downloadUrl;
          a.download = doc.title;
          a.click();
        }
      },

      payInvoice: (id, amount) => set(s => ({
        invoices: s.invoices.map(inv => {
          if (inv.id !== id) return inv;
          const newPaid = inv.paidAmount + amount;
          const newStatus = newPaid >= inv.amount ? 'paid' as const : 'partial' as const;
          return { ...inv, paidAmount: newPaid, status: newStatus, receiptUrl: '#receipt-' + inv.id };
        }),
      })),

      changePassword: () => {
        // In-memory demo — nothing to persist. Real app would hit API.
      },

      updateAvatar: () => {
        // In-memory demo — would upload to S3 then update user record.
      },

      logMood: (mood, note) => set(s => ({
        notifications: [
          {
            id: `n${s.notifications.length + 1}`,
            title: 'Mood Logged',
            message: `You logged "${mood}"${note ? `: ${note}` : ''}.`,
            type: 'announcement',
            createdAt: new Date().toISOString(),
            read: true,
          },
          ...s.notifications,
        ],
      })),

      bookSession: () => {
        const id = `session-${Date.now()}`;
        return id;
      },

      addPortfolioWork: (work) => set(s => ({
        notifications: [
          {
            id: `n${s.notifications.length + 1}`,
            title: 'Portfolio Updated',
            message: `"${work.title}" has been added to your portfolio.`,
            type: 'document',
            createdAt: new Date().toISOString(),
            read: true,
          },
          ...s.notifications,
        ],
      })),

      submitDeptRequest: (req) => set(s => ({
        tickets: [
          ...s.tickets,
          {
            id: `tk${s.tickets.length + 1}`,
            title: req.title,
            description: req.description,
            category: req.category as SupportTicket['category'],
            status: 'open',
            priority: 'medium',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            responses: [],
          },
        ],
      })),
    }),
    { name: 'student-data-store' },
  ),
);
