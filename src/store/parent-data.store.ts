/* ---- Parent Data Store ---- Zustand store for parent portal --------
 * Rich demo data for 2 children: academics, attendance, billing,
 * events, wellness, clubs, staff directory, lunch menu
 * --------------------------------------------------------------------- */
import { create } from 'zustand';

/* ---- Types ---- */
export type MoodLevel = 'happy' | 'good' | 'neutral' | 'sad' | 'stressed';
export type AssignmentStatus = 'upcoming' | 'submitted' | 'graded' | 'missing' | 'late';
export type InvoiceStatus = 'paid' | 'pending' | 'overdue';
export type AttendanceStatus = 'present' | 'absent' | 'tardy' | 'excused';
export type EventType = 'conference' | 'performance' | 'academic' | 'ceremony' | 'sports' | 'holiday';

export interface ChildProfile {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  school: string;
  avatar?: string;
  age: number;
  dateOfBirth: string;
  homeroom: string;
  counselor: string;
}

export interface SubjectGrade {
  id: string;
  childId: string;
  subject: string;
  teacher: string;
  color: string;
  currentGrade: number;
  letterGrade: string;
  recentWork: { title: string; score: number; maxScore: number; date: string; type: string }[];
  trend: number[];
}

export interface ChildAssignment {
  id: string;
  childId: string;
  title: string;
  subject: string;
  teacher: string;
  dueDate: string;
  assignedDate: string;
  status: AssignmentStatus;
  score?: number;
  maxScore?: number;
  feedback?: string;
}

export interface AttendanceRecord {
  id: string;
  childId: string;
  date: string;
  status: AttendanceStatus;
  period?: string;
  subject?: string;
  note?: string;
}

export interface ScheduleEntry {
  id: string;
  childId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
}

export interface PortfolioItem {
  id: string;
  childId: string;
  title: string;
  subject: string;
  date: string;
  score: number;
  maxScore: number;
  type: 'essay' | 'project' | 'presentation' | 'artwork' | 'lab_report';
  note?: string;
}

export interface ParentInvoice {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  paidAt?: string;
  paidAmount: number;
  category: 'tuition' | 'activity' | 'lunch' | 'other';
  childId?: string;
}

export interface SchoolEventItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  type: EventType;
  rsvp: boolean;
  description?: string;
}

export interface ParentMessage {
  id: string;
  from: string;
  role: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  childId?: string;
}

export interface MoodEntry {
  childId: string;
  date: string;
  mood: MoodLevel;
}

export interface WellnessGoal {
  id: string;
  childId: string;
  title: string;
  progress: number;
  target: number;
  unit: string;
}

export interface ClubActivity {
  id: string;
  name: string;
  advisor: string;
  schedule: string;
  location: string;
  description: string;
  enrolled: boolean;
  childId?: string;
}

export interface LunchMenuItem {
  day: string;
  entree: string;
  sides: string[];
  allergens: string[];
}

export interface StaffContact {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone?: string;
  office?: string;
}

export interface DigestItem {
  childId: string;
  type: 'achievement' | 'alert' | 'improvement' | 'attendance';
  message: string;
}

export interface FeedbackSurvey {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'open' | 'completed';
}

export interface VolunteerOpportunity {
  id: string;
  title: string;
  date: string;
  spotsLeft: number;
  signedUp: boolean;
  location: string;
}

/* ---- State ---- */
export interface ParentDataState {
  children: ChildProfile[];
  selectedChildId: string;
  grades: SubjectGrade[];
  assignments: ChildAssignment[];
  attendance: AttendanceRecord[];
  schedule: ScheduleEntry[];
  portfolio: PortfolioItem[];
  invoices: ParentInvoice[];
  events: SchoolEventItem[];
  messages: ParentMessage[];
  moodEntries: MoodEntry[];
  wellnessGoals: WellnessGoal[];
  clubs: ClubActivity[];
  lunchMenu: LunchMenuItem[];
  staff: StaffContact[];
  digest: DigestItem[];
  surveys: FeedbackSurvey[];
  volunteers: VolunteerOpportunity[];

  // Actions
  selectChild: (id: string) => void;
  markMessageRead: (id: string) => void;
  toggleRSVP: (eventId: string) => void;
  toggleVolunteer: (id: string) => void;

  // Getters
  getChild: (id: string) => ChildProfile | undefined;
  childGrades: (childId: string) => SubjectGrade[];
  childAssignments: (childId: string) => ChildAssignment[];
  childAttendance: (childId: string) => AttendanceRecord[];
  childSchedule: (childId: string) => ScheduleEntry[];
  childPortfolio: (childId: string) => PortfolioItem[];
  childMood: (childId: string) => MoodEntry[];
  childGoals: (childId: string) => WellnessGoal[];
  unreadMessages: () => number;
  overdueInvoices: () => ParentInvoice[];
}

/* ---- Demo Data ---- */
const demoChildren: ChildProfile[] = [
  { id: 'c1', firstName: 'Emily', lastName: 'Johnson', grade: '10th Grade', school: 'Lincoln High School', age: 16, dateOfBirth: '2009-08-14', homeroom: 'Room 204', counselor: 'Ms. Rivera' },
  { id: 'c2', firstName: 'Jake', lastName: 'Johnson', grade: '7th Grade', school: 'Lincoln Middle School', age: 13, dateOfBirth: '2012-11-03', homeroom: 'Room 112', counselor: 'Mr. Adams' },
];

const demoGrades: SubjectGrade[] = [
  { id: 'g1', childId: 'c1', subject: 'AP English', teacher: 'Ms. Rodriguez', color: '#818cf8', currentGrade: 91, letterGrade: 'A-',
    recentWork: [
      { title: 'WWII Essay', score: 92, maxScore: 100, date: '2026-02-28', type: 'essay' },
      { title: 'Vocab Test Ch.12', score: 88, maxScore: 100, date: '2026-02-25', type: 'test' },
      { title: 'Reading Response', score: 95, maxScore: 100, date: '2026-02-20', type: 'homework' },
    ], trend: [88, 89, 90, 91, 89, 92, 91] },
  { id: 'g2', childId: 'c1', subject: 'Algebra II', teacher: 'Mr. Thompson', color: '#34d399', currentGrade: 85, letterGrade: 'B+',
    recentWork: [
      { title: 'Quiz Ch.5', score: 85, maxScore: 100, date: '2026-02-27', type: 'quiz' },
      { title: 'Homework Set 14', score: 90, maxScore: 100, date: '2026-02-24', type: 'homework' },
      { title: 'Midterm Exam', score: 82, maxScore: 100, date: '2026-02-18', type: 'exam' },
    ], trend: [82, 83, 84, 85, 84, 86, 85] },
  { id: 'g3', childId: 'c1', subject: 'Chemistry', teacher: 'Dr. Patel', color: '#f97316', currentGrade: 95, letterGrade: 'A',
    recentWork: [
      { title: 'Lab Report #8', score: 98, maxScore: 100, date: '2026-02-26', type: 'lab_report' },
      { title: 'Unit Test Ch.9', score: 93, maxScore: 100, date: '2026-02-21', type: 'test' },
      { title: 'Lab Quiz', score: 95, maxScore: 100, date: '2026-02-17', type: 'quiz' },
    ], trend: [92, 93, 94, 94, 95, 96, 95] },
  { id: 'g4', childId: 'c1', subject: 'US History', teacher: 'Mr. Chen', color: '#f43f5e', currentGrade: 78, letterGrade: 'C+',
    recentWork: [
      { title: 'Chapter Test', score: 72, maxScore: 100, date: '2026-02-27', type: 'test' },
      { title: 'Document Analysis', score: 85, maxScore: 100, date: '2026-02-22', type: 'essay' },
      { title: 'Quiz: Civil War', score: 78, maxScore: 100, date: '2026-02-19', type: 'quiz' },
    ], trend: [80, 79, 78, 77, 76, 78, 78] },
  { id: 'g5', childId: 'c1', subject: 'Biology', teacher: 'Ms. Park', color: '#38bdf8', currentGrade: 93, letterGrade: 'A',
    recentWork: [
      { title: 'Genetics Project', score: 96, maxScore: 100, date: '2026-02-28', type: 'project' },
      { title: 'Cell Division Quiz', score: 90, maxScore: 100, date: '2026-02-23', type: 'quiz' },
    ], trend: [90, 91, 92, 93, 92, 94, 93] },
  { id: 'g6', childId: 'c2', subject: 'English 7', teacher: 'Mrs. Lee', color: '#818cf8', currentGrade: 87, letterGrade: 'B+',
    recentWork: [
      { title: 'Book Report', score: 90, maxScore: 100, date: '2026-02-28', type: 'essay' },
      { title: 'Grammar Quiz', score: 82, maxScore: 100, date: '2026-02-25', type: 'quiz' },
      { title: 'Spelling Test', score: 88, maxScore: 100, date: '2026-02-20', type: 'test' },
    ], trend: [84, 85, 86, 87, 86, 88, 87] },
  { id: 'g7', childId: 'c2', subject: 'Pre-Algebra', teacher: 'Mr. Garcia', color: '#34d399', currentGrade: 82, letterGrade: 'B',
    recentWork: [
      { title: 'Chapter 8 Test', score: 80, maxScore: 100, date: '2026-02-26', type: 'test' },
      { title: 'Problem Set 12', score: 85, maxScore: 100, date: '2026-02-22', type: 'homework' },
    ], trend: [80, 81, 80, 82, 83, 82, 82] },
  { id: 'g8', childId: 'c2', subject: 'Life Science', teacher: 'Ms. Park', color: '#f97316', currentGrade: 91, letterGrade: 'A-',
    recentWork: [
      { title: 'Ecosystem Project', score: 94, maxScore: 100, date: '2026-02-27', type: 'project' },
      { title: 'Chapter Quiz', score: 88, maxScore: 100, date: '2026-02-23', type: 'quiz' },
    ], trend: [88, 89, 90, 91, 90, 92, 91] },
  { id: 'g9', childId: 'c2', subject: 'World History', teacher: 'Mr. Brooks', color: '#f43f5e', currentGrade: 85, letterGrade: 'B+',
    recentWork: [
      { title: 'Timeline Project', score: 88, maxScore: 100, date: '2026-02-28', type: 'project' },
      { title: 'Map Quiz', score: 82, maxScore: 100, date: '2026-02-24', type: 'quiz' },
    ], trend: [82, 83, 84, 85, 84, 86, 85] },
];

const demoAssignments: ChildAssignment[] = [
  { id: 'a1', childId: 'c1', title: 'Shakespeare Analysis Essay', subject: 'AP English', teacher: 'Ms. Rodriguez', dueDate: '2026-03-07', assignedDate: '2026-02-28', status: 'upcoming', maxScore: 100 },
  { id: 'a2', childId: 'c1', title: 'Problem Set 15', subject: 'Algebra II', teacher: 'Mr. Thompson', dueDate: '2026-03-05', assignedDate: '2026-02-27', status: 'submitted' },
  { id: 'a3', childId: 'c1', title: 'History DBQ Practice', subject: 'US History', teacher: 'Mr. Chen', dueDate: '2026-03-01', assignedDate: '2026-02-22', status: 'missing', maxScore: 50 },
  { id: 'a4', childId: 'c1', title: 'Lab Report #9', subject: 'Chemistry', teacher: 'Dr. Patel', dueDate: '2026-03-10', assignedDate: '2026-03-01', status: 'upcoming', maxScore: 100 },
  { id: 'a5', childId: 'c1', title: 'Genetics Worksheet', subject: 'Biology', teacher: 'Ms. Park', dueDate: '2026-03-03', assignedDate: '2026-02-26', status: 'graded', score: 96, maxScore: 100, feedback: 'Excellent understanding of Punnett squares!' },
  { id: 'a6', childId: 'c1', title: 'WWII Essay', subject: 'AP English', teacher: 'Ms. Rodriguez', dueDate: '2026-02-28', assignedDate: '2026-02-14', status: 'graded', score: 92, maxScore: 100, feedback: 'Strong thesis and supporting evidence.' },
  { id: 'a7', childId: 'c2', title: 'Book Report: Island of the Blue Dolphins', subject: 'English 7', teacher: 'Mrs. Lee', dueDate: '2026-03-06', assignedDate: '2026-02-24', status: 'upcoming', maxScore: 100 },
  { id: 'a8', childId: 'c2', title: 'Chapter 9 Review Problems', subject: 'Pre-Algebra', teacher: 'Mr. Garcia', dueDate: '2026-03-04', assignedDate: '2026-02-27', status: 'submitted' },
  { id: 'a9', childId: 'c2', title: 'Ecosystem Diorama', subject: 'Life Science', teacher: 'Ms. Park', dueDate: '2026-03-08', assignedDate: '2026-02-25', status: 'upcoming', maxScore: 100 },
  { id: 'a10', childId: 'c2', title: 'Ancient Greece Timeline', subject: 'World History', teacher: 'Mr. Brooks', dueDate: '2026-02-28', assignedDate: '2026-02-18', status: 'graded', score: 88, maxScore: 100 },
];

const demoAttendance: AttendanceRecord[] = [
  { id: 'at1', childId: 'c1', date: '2026-03-05', status: 'present', period: 'All Day' },
  { id: 'at2', childId: 'c1', date: '2026-03-04', status: 'present', period: 'All Day' },
  { id: 'at3', childId: 'c1', date: '2026-03-03', status: 'tardy', period: 'Period 1', subject: 'AP English', note: 'Arrived 10 min late' },
  { id: 'at4', childId: 'c1', date: '2026-02-28', status: 'present', period: 'All Day' },
  { id: 'at5', childId: 'c1', date: '2026-02-27', status: 'present', period: 'All Day' },
  { id: 'at6', childId: 'c1', date: '2026-02-26', status: 'absent', period: 'All Day', note: 'Doctor appointment' },
  { id: 'at7', childId: 'c1', date: '2026-02-25', status: 'present', period: 'All Day' },
  { id: 'at8', childId: 'c1', date: '2026-02-24', status: 'present', period: 'All Day' },
  { id: 'at9', childId: 'c1', date: '2026-02-21', status: 'present', period: 'All Day' },
  { id: 'at10', childId: 'c1', date: '2026-02-20', status: 'excused', period: 'All Day', note: 'Family event' },
  { id: 'at11', childId: 'c2', date: '2026-03-05', status: 'present', period: 'All Day' },
  { id: 'at12', childId: 'c2', date: '2026-03-04', status: 'present', period: 'All Day' },
  { id: 'at13', childId: 'c2', date: '2026-03-03', status: 'present', period: 'All Day' },
  { id: 'at14', childId: 'c2', date: '2026-02-28', status: 'present', period: 'All Day' },
  { id: 'at15', childId: 'c2', date: '2026-02-27', status: 'present', period: 'All Day' },
  { id: 'at16', childId: 'c2', date: '2026-02-26', status: 'present', period: 'All Day' },
];

const demoSchedule: ScheduleEntry[] = [
  { id: 's1', childId: 'c1', dayOfWeek: 0, startTime: '08:00', endTime: '08:50', subject: 'AP English', teacher: 'Ms. Rodriguez', room: '204' },
  { id: 's2', childId: 'c1', dayOfWeek: 0, startTime: '09:00', endTime: '09:50', subject: 'Algebra II', teacher: 'Mr. Thompson', room: '118' },
  { id: 's3', childId: 'c1', dayOfWeek: 0, startTime: '10:00', endTime: '10:50', subject: 'Chemistry', teacher: 'Dr. Patel', room: 'Lab 3' },
  { id: 's4', childId: 'c1', dayOfWeek: 0, startTime: '11:00', endTime: '11:30', subject: 'Lunch', teacher: '', room: 'Cafeteria' },
  { id: 's5', childId: 'c1', dayOfWeek: 0, startTime: '11:40', endTime: '12:30', subject: 'US History', teacher: 'Mr. Chen', room: '310' },
  { id: 's6', childId: 'c1', dayOfWeek: 0, startTime: '12:40', endTime: '13:30', subject: 'Biology', teacher: 'Ms. Park', room: 'Lab 1' },
  { id: 's7', childId: 'c1', dayOfWeek: 1, startTime: '08:00', endTime: '08:50', subject: 'Algebra II', teacher: 'Mr. Thompson', room: '118' },
  { id: 's8', childId: 'c1', dayOfWeek: 1, startTime: '09:00', endTime: '09:50', subject: 'AP English', teacher: 'Ms. Rodriguez', room: '204' },
  { id: 's9', childId: 'c1', dayOfWeek: 1, startTime: '10:00', endTime: '10:50', subject: 'US History', teacher: 'Mr. Chen', room: '310' },
  { id: 's10', childId: 'c1', dayOfWeek: 1, startTime: '11:00', endTime: '11:30', subject: 'Lunch', teacher: '', room: 'Cafeteria' },
  { id: 's11', childId: 'c1', dayOfWeek: 1, startTime: '11:40', endTime: '12:30', subject: 'Chemistry', teacher: 'Dr. Patel', room: 'Lab 3' },
  { id: 's12', childId: 'c1', dayOfWeek: 1, startTime: '12:40', endTime: '13:30', subject: 'Biology', teacher: 'Ms. Park', room: 'Lab 1' },
  { id: 's13', childId: 'c2', dayOfWeek: 0, startTime: '08:15', endTime: '09:00', subject: 'English 7', teacher: 'Mrs. Lee', room: '112' },
  { id: 's14', childId: 'c2', dayOfWeek: 0, startTime: '09:10', endTime: '09:55', subject: 'Pre-Algebra', teacher: 'Mr. Garcia', room: '108' },
  { id: 's15', childId: 'c2', dayOfWeek: 0, startTime: '10:05', endTime: '10:50', subject: 'Life Science', teacher: 'Ms. Park', room: 'Lab 2' },
  { id: 's16', childId: 'c2', dayOfWeek: 0, startTime: '11:00', endTime: '11:30', subject: 'Lunch', teacher: '', room: 'Cafeteria' },
  { id: 's17', childId: 'c2', dayOfWeek: 0, startTime: '11:40', endTime: '12:25', subject: 'World History', teacher: 'Mr. Brooks', room: '215' },
  { id: 's18', childId: 'c2', dayOfWeek: 0, startTime: '12:35', endTime: '13:20', subject: 'Art', teacher: 'Ms. Kim', room: 'Art Studio' },
];

const demoPortfolio: PortfolioItem[] = [
  { id: 'p1', childId: 'c1', title: 'The Causes and Consequences of World War II', subject: 'AP English', date: '2026-02-28', score: 97, maxScore: 100, type: 'essay', note: 'Featured in school literary magazine' },
  { id: 'p2', childId: 'c1', title: 'Molecular Structure 3D Model', subject: 'Chemistry', date: '2026-02-15', score: 100, maxScore: 100, type: 'project', note: 'Selected for Science Fair' },
  { id: 'p3', childId: 'c1', title: 'Genetics Research Presentation', subject: 'Biology', date: '2026-02-10', score: 96, maxScore: 100, type: 'presentation' },
  { id: 'p4', childId: 'c2', title: 'Ecosystem Diorama — Coral Reef', subject: 'Life Science', date: '2026-02-20', score: 94, maxScore: 100, type: 'project', note: 'Displayed in school showcase' },
  { id: 'p5', childId: 'c2', title: 'Ancient Rome Timeline Poster', subject: 'World History', date: '2026-02-12', score: 90, maxScore: 100, type: 'project' },
];

const demoInvoices: ParentInvoice[] = [
  { id: 'inv1', title: 'Tuition — March 2026', amount: 2450, dueDate: '2026-03-01', status: 'pending', paidAmount: 0, category: 'tuition' },
  { id: 'inv2', title: 'Activity Fee — Spring Sports', amount: 350, dueDate: '2026-03-15', status: 'pending', paidAmount: 0, category: 'activity', childId: 'c1' },
  { id: 'inv3', title: 'Tuition — February 2026', amount: 2450, dueDate: '2026-02-01', status: 'paid', paidAt: '2026-01-28', paidAmount: 2450, category: 'tuition' },
  { id: 'inv4', title: 'Tuition — January 2026', amount: 2450, dueDate: '2026-01-01', status: 'paid', paidAt: '2025-12-28', paidAmount: 2450, category: 'tuition' },
  { id: 'inv5', title: 'Field Trip — Science Museum', amount: 45, dueDate: '2026-02-20', status: 'paid', paidAt: '2026-02-15', paidAmount: 45, category: 'activity', childId: 'c2' },
  { id: 'inv6', title: 'Lunch Account Top-Up', amount: 100, dueDate: '2026-02-01', status: 'paid', paidAt: '2026-01-30', paidAmount: 100, category: 'lunch' },
  { id: 'inv7', title: 'Yearbook — 2026 Edition', amount: 65, dueDate: '2026-04-01', status: 'pending', paidAmount: 0, category: 'other' },
  { id: 'inv8', title: 'Tuition — December 2025', amount: 2450, dueDate: '2025-12-01', status: 'paid', paidAt: '2025-11-28', paidAmount: 2450, category: 'tuition' },
];

const demoEvents: SchoolEventItem[] = [
  { id: 'ev1', title: 'Parent-Teacher Conference', date: '2026-03-12', time: '3:00 PM', location: 'Room 204', type: 'conference', rsvp: true, description: 'Mid-semester check-in with all teachers' },
  { id: 'ev2', title: 'Spring Band Concert', date: '2026-03-20', time: '7:00 PM', location: 'Auditorium', type: 'performance', rsvp: false, description: 'Annual spring performance featuring all grade levels' },
  { id: 'ev3', title: 'Science Fair', date: '2026-03-23', time: '10:00 AM', location: 'Gymnasium', type: 'academic', rsvp: false, description: 'Student science projects on display' },
  { id: 'ev4', title: 'Senior Awards Night', date: '2026-03-28', time: '6:00 PM', location: 'Auditorium', type: 'ceremony', rsvp: true },
  { id: 'ev5', title: 'Track & Field Meet', date: '2026-04-05', time: '9:00 AM', location: 'Sports Complex', type: 'sports', rsvp: false },
  { id: 'ev6', title: 'Spring Break', date: '2026-04-14', location: '', type: 'holiday', rsvp: false, description: 'Apr 14-18 — No school' },
  { id: 'ev7', title: 'Art Exhibition', date: '2026-04-25', time: '5:00 PM', location: 'Gallery Wing', type: 'performance', rsvp: false },
];

const demoMessages: ParentMessage[] = [
  { id: 'm1', from: 'Mr. Chen', role: 'History Teacher', subject: 'Missing Assignment — Emily', preview: 'Hi, I wanted to let you know that Emily has a missing DBQ assignment from last week...', date: '2026-03-04', read: false, childId: 'c1' },
  { id: 'm2', from: 'Ms. Rodriguez', role: 'English Teacher', subject: 'Great work on the essay!', preview: "Emily's WWII essay was outstanding. I'd like to recommend it for the literary magazine...", date: '2026-03-03', read: false, childId: 'c1' },
  { id: 'm3', from: 'Principal Williams', role: 'Administration', subject: 'Spring Semester Update', preview: 'Dear Parents, I am writing to share some exciting updates about our spring semester programs...', date: '2026-03-01', read: true },
  { id: 'm4', from: 'Mrs. Lee', role: '7th Grade English', subject: "Jake's reading progress", preview: "Jake has been making great strides in his reading comprehension this month...", date: '2026-02-28', read: true, childId: 'c2' },
  { id: 'm5', from: 'School Nurse', role: 'Health Office', subject: 'Immunization Records Reminder', preview: 'This is a reminder that updated immunization records for the 2026-27 school year are due by...', date: '2026-02-25', read: true },
];

const demoMood: MoodEntry[] = [
  { childId: 'c1', date: '2026-03-05', mood: 'good' },
  { childId: 'c1', date: '2026-03-04', mood: 'happy' },
  { childId: 'c1', date: '2026-03-03', mood: 'neutral' },
  { childId: 'c1', date: '2026-02-28', mood: 'good' },
  { childId: 'c1', date: '2026-02-27', mood: 'happy' },
  { childId: 'c1', date: '2026-02-26', mood: 'sad' },
  { childId: 'c1', date: '2026-02-25', mood: 'good' },
  { childId: 'c2', date: '2026-03-05', mood: 'happy' },
  { childId: 'c2', date: '2026-03-04', mood: 'happy' },
  { childId: 'c2', date: '2026-03-03', mood: 'good' },
  { childId: 'c2', date: '2026-02-28', mood: 'good' },
  { childId: 'c2', date: '2026-02-27', mood: 'happy' },
  { childId: 'c2', date: '2026-02-26', mood: 'good' },
  { childId: 'c2', date: '2026-02-25', mood: 'happy' },
];

const demoGoals: WellnessGoal[] = [
  { id: 'wg1', childId: 'c1', title: 'Practice mindfulness', progress: 5, target: 7, unit: 'days/week' },
  { id: 'wg2', childId: 'c1', title: 'Read for pleasure', progress: 3, target: 5, unit: 'hours/week' },
  { id: 'wg3', childId: 'c1', title: 'Screen-free evening', progress: 4, target: 7, unit: 'days/week' },
  { id: 'wg4', childId: 'c2', title: 'Outdoor activity', progress: 6, target: 7, unit: 'days/week' },
  { id: 'wg5', childId: 'c2', title: 'Practice guitar', progress: 4, target: 5, unit: 'sessions/week' },
];

const demoClubs: ClubActivity[] = [
  { id: 'cl1', name: 'Debate Club', advisor: 'Mr. Chen', schedule: 'Tuesdays & Thursdays 3:30-5:00 PM', location: 'Room 310', description: 'Competitive debate team covering national and international topics.', enrolled: true, childId: 'c1' },
  { id: 'cl2', name: 'Science Olympiad', advisor: 'Dr. Patel', schedule: 'Wednesdays 3:30-5:00 PM', location: 'Lab 3', description: 'Preparation for regional Science Olympiad competitions.', enrolled: true, childId: 'c1' },
  { id: 'cl3', name: 'Art Club', advisor: 'Ms. Kim', schedule: 'Mondays 3:00-4:30 PM', location: 'Art Studio', description: 'Explore various art mediums and techniques.', enrolled: false },
  { id: 'cl4', name: 'Robotics Team', advisor: 'Mr. Wilson', schedule: 'Mon & Wed 3:30-5:00 PM', location: 'STEM Lab', description: 'Design and build robots for competitions.', enrolled: true, childId: 'c2' },
  { id: 'cl5', name: 'Chess Club', advisor: 'Ms. Rivera', schedule: 'Fridays 3:00-4:00 PM', location: 'Room 112', description: 'Learn strategies and compete in chess tournaments.', enrolled: false },
  { id: 'cl6', name: 'Drama Club', advisor: 'Ms. Harper', schedule: 'Tues & Thurs 3:30-5:30 PM', location: 'Auditorium', description: 'Prepare for the annual school play and other performances.', enrolled: false },
  { id: 'cl7', name: 'Student Council', advisor: 'Principal Williams', schedule: 'Wednesdays 12:00-12:30 PM', location: 'Conference Room', description: 'Represent student interests and organize school events.', enrolled: false },
];

const demoLunch: LunchMenuItem[] = [
  { day: 'Monday', entree: 'Grilled Chicken Sandwich', sides: ['Sweet Potato Fries', 'Garden Salad', 'Fresh Fruit'], allergens: ['Wheat', 'Soy'] },
  { day: 'Tuesday', entree: 'Beef Tacos with Cheese', sides: ['Spanish Rice', 'Black Beans', 'Corn'], allergens: ['Wheat', 'Dairy'] },
  { day: 'Wednesday', entree: 'Vegetable Pasta Marinara', sides: ['Garlic Bread', 'Caesar Salad', 'Applesauce'], allergens: ['Wheat', 'Dairy'] },
  { day: 'Thursday', entree: 'BBQ Pulled Pork Slider', sides: ['Coleslaw', 'Baked Beans', 'Watermelon'], allergens: ['Wheat', 'Soy'] },
  { day: 'Friday', entree: 'Cheese Pizza', sides: ['Breadsticks', 'Veggie Sticks', 'Ice Cream Cup'], allergens: ['Wheat', 'Dairy'] },
];

const demoStaff: StaffContact[] = [
  { id: 'st1', name: 'Dr. Sarah Williams', role: 'Principal', department: 'Administration', email: 'williams@lincoln.edu', phone: '(555) 100-0001', office: 'Admin Building 101' },
  { id: 'st2', name: 'Mr. James Adams', role: 'School Counselor', department: 'Student Services', email: 'adams@lincoln.edu', phone: '(555) 100-0012', office: 'Counseling Center 2' },
  { id: 'st3', name: 'Ms. Rivera', role: 'School Counselor', department: 'Student Services', email: 'rivera@lincoln.edu', phone: '(555) 100-0013', office: 'Counseling Center 3' },
  { id: 'st4', name: 'Ms. Rodriguez', role: 'AP English Teacher', department: 'English', email: 'rodriguez@lincoln.edu', office: 'Room 204' },
  { id: 'st5', name: 'Mr. Thompson', role: 'Math Teacher', department: 'Mathematics', email: 'thompson@lincoln.edu', office: 'Room 118' },
  { id: 'st6', name: 'Dr. Patel', role: 'Chemistry Teacher', department: 'Science', email: 'patel@lincoln.edu', office: 'Lab 3' },
  { id: 'st7', name: 'Mr. Chen', role: 'History Teacher', department: 'Social Studies', email: 'chen@lincoln.edu', office: 'Room 310' },
  { id: 'st8', name: 'Ms. Park', role: 'Biology / Life Science', department: 'Science', email: 'park@lincoln.edu', office: 'Lab 1' },
  { id: 'st9', name: 'Mrs. Lee', role: '7th Grade English', department: 'English', email: 'lee@lincoln.edu', office: 'Room 112' },
  { id: 'st10', name: 'Mr. Garcia', role: 'Math Teacher', department: 'Mathematics', email: 'garcia@lincoln.edu', office: 'Room 108' },
  { id: 'st11', name: 'Nurse Thompson', role: 'School Nurse', department: 'Health Services', email: 'nurse@lincoln.edu', phone: '(555) 100-0020', office: 'Health Office' },
];

const demoDigest: DigestItem[] = [
  { childId: 'c1', type: 'achievement', message: 'Got an A on Chemistry Lab Report #8 (98%)' },
  { childId: 'c1', type: 'alert', message: 'Missing History DBQ assignment (due Mar 1)' },
  { childId: 'c1', type: 'improvement', message: 'Math grade improved from B to B+ this week' },
  { childId: 'c1', type: 'attendance', message: 'Tardy to Period 1 on Mar 3' },
  { childId: 'c2', type: 'achievement', message: 'Selected for Science Fair finals with Ecosystem project' },
  { childId: 'c2', type: 'achievement', message: 'All assignments submitted on time this week' },
  { childId: 'c2', type: 'attendance', message: 'Perfect attendance — 15 day streak!' },
];

const demoSurveys: FeedbackSurvey[] = [
  { id: 'fs1', title: 'Spring Semester Survey', description: 'Rate your experience this semester', deadline: '2026-03-20', status: 'open' },
  { id: 'fs2', title: 'Teacher Evaluation — Emily\'s Teachers', description: 'Annual teacher feedback', deadline: '2026-03-25', status: 'open' },
  { id: 'fs3', title: 'Cafeteria Satisfaction', description: 'Help us improve school meals', deadline: '2026-02-15', status: 'completed' },
  { id: 'fs4', title: 'Bus Route Feedback', description: 'Transportation quality survey', deadline: '2026-02-10', status: 'completed' },
];

const demoVolunteers: VolunteerOpportunity[] = [
  { id: 'v1', title: 'Science Fair Judges Needed', date: '2026-03-23, 9:00 AM', spotsLeft: 5, signedUp: false, location: 'Gymnasium' },
  { id: 'v2', title: 'Library Reading Program', date: '2026-03-26, 2:00 PM', spotsLeft: 3, signedUp: true, location: 'Library' },
  { id: 'v3', title: 'Spring Carnival Setup', date: '2026-04-01, 8:00 AM', spotsLeft: 12, signedUp: true, location: 'School Grounds' },
  { id: 'v4', title: 'Graduation Ceremony Ushers', date: '2026-06-10, 5:00 PM', spotsLeft: 8, signedUp: false, location: 'Auditorium' },
];

/* ---- Store ---- */
export const useParentStore = create<ParentDataState>((set, get) => ({
  children: demoChildren,
  selectedChildId: 'c1',
  grades: demoGrades,
  assignments: demoAssignments,
  attendance: demoAttendance,
  schedule: demoSchedule,
  portfolio: demoPortfolio,
  invoices: demoInvoices,
  events: demoEvents,
  messages: demoMessages,
  moodEntries: demoMood,
  wellnessGoals: demoGoals,
  clubs: demoClubs,
  lunchMenu: demoLunch,
  staff: demoStaff,
  digest: demoDigest,
  surveys: demoSurveys,
  volunteers: demoVolunteers,

  selectChild: (id) => set({ selectedChildId: id }),

  markMessageRead: (id) => set(s => ({
    messages: s.messages.map(m => m.id === id ? { ...m, read: true } : m),
  })),

  toggleRSVP: (eventId) => set(s => ({
    events: s.events.map(e => e.id === eventId ? { ...e, rsvp: !e.rsvp } : e),
  })),

  toggleVolunteer: (id) => set(s => ({
    volunteers: s.volunteers.map(v => v.id === id ? { ...v, signedUp: !v.signedUp } : v),
  })),

  getChild: (id) => get().children.find(c => c.id === id),
  childGrades: (childId) => get().grades.filter(g => g.childId === childId),
  childAssignments: (childId) => get().assignments.filter(a => a.childId === childId),
  childAttendance: (childId) => get().attendance.filter(a => a.childId === childId),
  childSchedule: (childId) => get().schedule.filter(s => s.childId === childId),
  childPortfolio: (childId) => get().portfolio.filter(p => p.childId === childId),
  childMood: (childId) => get().moodEntries.filter(m => m.childId === childId),
  childGoals: (childId) => get().wellnessGoals.filter(g => g.childId === childId),
  unreadMessages: () => get().messages.filter(m => !m.read).length,
  overdueInvoices: () => get().invoices.filter(i => i.status === 'overdue'),
}));
