/* ─── Teacher Portal V2 — Realistic Demo Data ────────────────────── 
 * Every teacher module uses this for fallback when API returns empty.
 * Data represents Ms. Sarah Chen, a Math & Science teacher at Lincoln Academy.
 * Date context: March 2026 academic year.
 * ──────────────────────────────────────────────────────────────────── */

// ── Teacher's classes ──
export interface TeacherClassDemo {
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

export const teacherClassesDemo: TeacherClassDemo[] = [
  { id: 'c1', name: 'Algebra II', subject: 'Mathematics', gradeLevel: 'Grade 10', period: 1, room: 'Room 204', studentCount: 28, avgGrade: 84.2, nextSession: '08:00 – 08:50', color: '#818cf8' },
  { id: 'c2', name: 'AP Calculus AB', subject: 'Mathematics', gradeLevel: 'Grade 12', period: 2, room: 'Room 204', studentCount: 22, avgGrade: 88.7, nextSession: '09:00 – 09:50', color: '#34d399' },
  { id: 'c3', name: 'Geometry', subject: 'Mathematics', gradeLevel: 'Grade 9', period: 3, room: 'Room 106', studentCount: 31, avgGrade: 79.5, nextSession: '10:15 – 11:05', color: '#f472b6' },
  { id: 'c4', name: 'Physics Honors', subject: 'Science', gradeLevel: 'Grade 11', period: 5, room: 'Lab 301', studentCount: 24, avgGrade: 82.1, nextSession: '13:00 – 13:50', color: '#fbbf24' },
  { id: 'c5', name: 'Pre-Algebra', subject: 'Mathematics', gradeLevel: 'Grade 8', period: 6, room: 'Room 204', studentCount: 30, avgGrade: 76.8, nextSession: '14:00 – 14:50', color: '#a78bfa' },
];

// ── Today's schedule (command center) ──
export interface ScheduleItemDemo {
  id: string;
  time: string;
  endTime: string;
  title: string;
  type: 'class' | 'meeting' | 'prep' | 'duty' | 'break';
  room: string;
  classId?: string;
  studentCount?: number;
  notes?: string;
}

export const todayScheduleDemo: ScheduleItemDemo[] = [
  { id: 's1', time: '07:45', endTime: '07:55', title: 'Morning Briefing', type: 'meeting', room: 'Staff Room' },
  { id: 's2', time: '08:00', endTime: '08:50', title: 'Algebra II — Grade 10', type: 'class', room: 'Room 204', classId: 'c1', studentCount: 28 },
  { id: 's3', time: '09:00', endTime: '09:50', title: 'AP Calculus AB — Grade 12', type: 'class', room: 'Room 204', classId: 'c2', studentCount: 22 },
  { id: 's4', time: '10:00', endTime: '10:15', title: 'Break', type: 'break', room: '' },
  { id: 's5', time: '10:15', endTime: '11:05', title: 'Geometry — Grade 9', type: 'class', room: 'Room 106', classId: 'c3', studentCount: 31 },
  { id: 's6', time: '11:15', endTime: '12:00', title: 'Planning Period', type: 'prep', room: 'Room 204', notes: 'Finish grading AP Calc quiz' },
  { id: 's7', time: '12:00', endTime: '12:45', title: 'Lunch', type: 'break', room: 'Cafeteria' },
  { id: 's8', time: '12:45', endTime: '12:55', title: 'Hallway Duty', type: 'duty', room: 'C-Wing Hallway' },
  { id: 's9', time: '13:00', endTime: '13:50', title: 'Physics Honors — Grade 11', type: 'class', room: 'Lab 301', classId: 'c4', studentCount: 24 },
  { id: 's10', time: '14:00', endTime: '14:50', title: 'Pre-Algebra — Grade 8', type: 'class', room: 'Room 204', classId: 'c5', studentCount: 30 },
  { id: 's11', time: '15:00', endTime: '15:30', title: 'Parent Conference — Jordan Kim', type: 'meeting', room: 'Room 204', notes: 'Discuss missing assignments' },
];

// ── Action items (urgent tasks for today) ──
export interface ActionItemDemo {
  id: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'grading' | 'attendance' | 'meeting' | 'admin' | 'student';
  dueBy: string;
  classId?: string;
}

export const actionItemsDemo: ActionItemDemo[] = [
  { id: 'a1', title: 'Grade AP Calculus Quiz #4', description: '22 papers, due back tomorrow', priority: 'HIGH', category: 'grading', dueBy: 'Today 5:00 PM', classId: 'c2' },
  { id: 'a2', title: 'Submit attendance for Period 3', description: 'Geometry — 3 students absent yesterday, unverified', priority: 'HIGH', category: 'attendance', dueBy: 'Today 11:30 AM', classId: 'c3' },
  { id: 'a3', title: 'Parent conference: Jordan Kim', description: 'Re: missing 3 assignments in Pre-Algebra', priority: 'HIGH', category: 'meeting', dueBy: 'Today 3:00 PM', classId: 'c5' },
  { id: 'a4', title: 'Review IEP accommodations update', description: 'New accommodations for Alex Rivera (extra time on tests)', priority: 'MEDIUM', category: 'admin', dueBy: 'This week' },
  { id: 'a5', title: 'Update lesson plan for quadratic equations', description: 'Algebra II Unit 4 starts Monday — materials needed', priority: 'MEDIUM', category: 'grading', dueBy: 'Friday', classId: 'c1' },
  { id: 'a6', title: 'Maria Garcia — check-in on dropped grade', description: 'Grade fell 12% over 2 weeks, possible personal issue', priority: 'MEDIUM', category: 'student', dueBy: 'This week', classId: 'c3' },
];

// ── Student alerts ──
export interface StudentAlertDemo {
  id: string;
  studentName: string;
  studentInitials: string;
  className: string;
  classId: string;
  alert: string;
  severity: 'high' | 'medium' | 'info';
  timestamp: string;
}

export const studentAlertsDemo: StudentAlertDemo[] = [
  { id: 'al1', studentName: 'Maria Garcia', studentInitials: 'MG', className: 'Geometry', classId: 'c3', alert: 'Grade dropped 12% in 2 weeks — from B+ to C', severity: 'high', timestamp: '2h ago' },
  { id: 'al2', studentName: 'Jordan Kim', studentInitials: 'JK', className: 'Pre-Algebra', classId: 'c5', alert: '3 missing assignments this month', severity: 'high', timestamp: '1d ago' },
  { id: 'al3', studentName: 'Alex Rivera', studentInitials: 'AR', className: 'Algebra II', classId: 'c1', alert: 'IEP update: extended time on tests +50%', severity: 'medium', timestamp: '3d ago' },
  { id: 'al4', studentName: 'Sam Lee', studentInitials: 'SL', className: 'AP Calculus AB', classId: 'c2', alert: 'Perfect score on Quiz #3 — 3rd consecutive A+', severity: 'info', timestamp: '1d ago' },
  { id: 'al5', studentName: 'Chen Wei', studentInitials: 'CW', className: 'Physics Honors', classId: 'c4', alert: 'Absent 3 times this week — possible illness', severity: 'high', timestamp: '4h ago' },
];

// ── Grading queue (assignments needing grades) ──
export interface GradingQueueItemDemo {
  id: string;
  assignment: string;
  className: string;
  classId: string;
  submitted: number;
  total: number;
  dueDate: string;
  avgScore?: number;
  type: 'homework' | 'quiz' | 'test' | 'project' | 'essay';
}

export const gradingQueueDemo: GradingQueueItemDemo[] = [
  { id: 'g1', assignment: 'Quiz #4 — Derivatives', className: 'AP Calculus AB', classId: 'c2', submitted: 22, total: 22, dueDate: 'Due yesterday', type: 'quiz' },
  { id: 'g2', assignment: 'Homework Set 7 — Polynomials', className: 'Algebra II', classId: 'c1', submitted: 26, total: 28, dueDate: 'Due today', type: 'homework' },
  { id: 'g3', assignment: 'Lab Report: Projectile Motion', className: 'Physics Honors', classId: 'c4', submitted: 20, total: 24, dueDate: 'Due today', type: 'project' },
  { id: 'g4', assignment: 'Chapter 5 Practice Set', className: 'Pre-Algebra', classId: 'c5', submitted: 28, total: 30, dueDate: 'Due in 2 days', type: 'homework' },
  { id: 'g5', assignment: 'Triangle Proofs Worksheet', className: 'Geometry', classId: 'c3', submitted: 29, total: 31, dueDate: 'Due in 3 days', type: 'homework' },
];

// ── Attendance demo students (for take attendance) ──
export interface AttendanceStudentDemo {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | null;
  streak: number; // consecutive days present
  overallRate: number;
}

export const attendanceStudentsDemo: AttendanceStudentDemo[] = [
  { id: 'st1', name: 'Sarah Ahmad', initials: 'SA', status: null, streak: 14, overallRate: 98 },
  { id: 'st2', name: 'James Baker', initials: 'JB', status: null, streak: 7, overallRate: 94 },
  { id: 'st3', name: 'Chen Wei', initials: 'CW', status: null, streak: 0, overallRate: 82 },
  { id: 'st4', name: 'Maria Garcia', initials: 'MG', status: null, streak: 3, overallRate: 91 },
  { id: 'st5', name: 'David Johnson', initials: 'DJ', status: null, streak: 21, overallRate: 99 },
  { id: 'st6', name: 'Jordan Kim', initials: 'JK', status: null, streak: 1, overallRate: 85 },
  { id: 'st7', name: 'Emma Larsson', initials: 'EL', status: null, streak: 10, overallRate: 96 },
  { id: 'st8', name: 'Alex Rivera', initials: 'AR', status: null, streak: 5, overallRate: 93 },
  { id: 'st9', name: 'Sam Lee', initials: 'SL', status: null, streak: 28, overallRate: 100 },
  { id: 'st10', name: 'Priya Patel', initials: 'PP', status: null, streak: 12, overallRate: 97 },
  { id: 'st11', name: 'Tyler Brooks', initials: 'TB', status: null, streak: 0, overallRate: 78 },
  { id: 'st12', name: 'Aisha Mohammed', initials: 'AM', status: null, streak: 9, overallRate: 95 },
];

// ── Lesson plans ──
export interface LessonPlanDemo {
  id: string;
  title: string;
  className: string;
  classId: string;
  date: string;
  duration: string;
  objectives: string[];
  status: 'draft' | 'ready' | 'taught' | 'reviewed';
  resources: string[];
}

export const lessonPlansDemo: LessonPlanDemo[] = [
  { id: 'lp1', title: 'Introduction to Derivatives', className: 'AP Calculus AB', classId: 'c2', date: '2026-03-09', duration: '50 min', objectives: ['Define derivative as a limit', 'Calculate simple derivatives using definition'], status: 'ready', resources: ['Textbook Ch. 3', 'Desmos Activity', 'Practice worksheet'] },
  { id: 'lp2', title: 'Quadratic Equations — Completing the Square', className: 'Algebra II', classId: 'c1', date: '2026-03-09', duration: '50 min', objectives: ['Solve quadratics by completing the square', 'Convert between standard and vertex form'], status: 'draft', resources: ['Guided notes template', 'GeoGebra demo'] },
  { id: 'lp3', title: 'Triangle Congruence Proofs', className: 'Geometry', classId: 'c3', date: '2026-03-10', duration: '50 min', objectives: ['Apply SSS, SAS, ASA congruence postulates', 'Write two-column proofs'], status: 'ready', resources: ['Proof worksheet', 'Geometry construction tools'] },
  { id: 'lp4', title: 'Projectile Motion Lab', className: 'Physics Honors', classId: 'c4', date: '2026-03-10', duration: '50 min', objectives: ['Predict projectile trajectory', 'Measure and record launch data', 'Calculate range and max height'], status: 'taught', resources: ['Lab kit', 'Data collection sheet', 'PhET simulation'] },
  { id: 'lp5', title: 'Operations with Fractions Review', className: 'Pre-Algebra', classId: 'c5', date: '2026-03-11', duration: '50 min', objectives: ['Add, subtract, multiply, divide fractions', 'Solve real-world fraction problems'], status: 'draft', resources: ['Practice set', 'Fraction manipulatives'] },
];

// ── Assignments ──
export interface AssignmentDemo {
  id: string;
  title: string;
  className: string;
  classId: string;
  type: 'homework' | 'quiz' | 'test' | 'project' | 'essay' | 'lab';
  dueDate: string;
  assignedDate: string;
  totalPoints: number;
  submitted: number;
  total: number;
  avgScore: number | null;
  status: 'active' | 'closed' | 'draft';
}

export const assignmentsDemo: AssignmentDemo[] = [
  { id: 'as1', title: 'Homework Set 7 — Polynomials', className: 'Algebra II', classId: 'c1', type: 'homework', dueDate: '2026-03-06', assignedDate: '2026-03-03', totalPoints: 50, submitted: 26, total: 28, avgScore: 42.5, status: 'active' },
  { id: 'as2', title: 'Quiz #4 — Derivatives', className: 'AP Calculus AB', classId: 'c2', type: 'quiz', dueDate: '2026-03-05', assignedDate: '2026-03-05', totalPoints: 100, submitted: 22, total: 22, avgScore: null, status: 'closed' },
  { id: 'as3', title: 'Triangle Proofs Worksheet', className: 'Geometry', classId: 'c3', type: 'homework', dueDate: '2026-03-09', assignedDate: '2026-03-04', totalPoints: 30, submitted: 29, total: 31, avgScore: null, status: 'active' },
  { id: 'as4', title: 'Lab Report: Projectile Motion', className: 'Physics Honors', classId: 'c4', type: 'lab', dueDate: '2026-03-06', assignedDate: '2026-03-03', totalPoints: 75, submitted: 20, total: 24, avgScore: null, status: 'active' },
  { id: 'as5', title: 'Chapter 5 Practice Set', className: 'Pre-Algebra', classId: 'c5', type: 'homework', dueDate: '2026-03-08', assignedDate: '2026-03-04', totalPoints: 40, submitted: 28, total: 30, avgScore: null, status: 'active' },
  { id: 'as6', title: 'Unit 3 Test — Quadratic Functions', className: 'Algebra II', classId: 'c1', type: 'test', dueDate: '2026-03-12', assignedDate: '2026-03-01', totalPoints: 100, submitted: 0, total: 28, avgScore: null, status: 'draft' },
];

// ── Gradebook entries ──
export interface GradebookStudentDemo {
  id: string;
  name: string;
  initials: string;
  scores: Record<string, number | null>; // assignmentId → score
  average: number;
  trend: 'up' | 'down' | 'flat';
  letterGrade: string;
}

export const gradebookStudentsDemo: GradebookStudentDemo[] = [
  { id: 'gs1', name: 'Sarah Ahmad', initials: 'SA', scores: { q1: 92, q2: 88, hw1: 95, hw2: 90, t1: 87 }, average: 90.4, trend: 'up', letterGrade: 'A-' },
  { id: 'gs2', name: 'James Baker', initials: 'JB', scores: { q1: 78, q2: 82, hw1: 85, hw2: 80, t1: 75 }, average: 80.0, trend: 'up', letterGrade: 'B-' },
  { id: 'gs3', name: 'Chen Wei', initials: 'CW', scores: { q1: 95, q2: 97, hw1: 100, hw2: 98, t1: 94 }, average: 96.8, trend: 'up', letterGrade: 'A+' },
  { id: 'gs4', name: 'Maria Garcia', initials: 'MG', scores: { q1: 85, q2: 72, hw1: 78, hw2: 65, t1: 70 }, average: 74.0, trend: 'down', letterGrade: 'C' },
  { id: 'gs5', name: 'David Johnson', initials: 'DJ', scores: { q1: 88, q2: 90, hw1: 92, hw2: 94, t1: 91 }, average: 91.0, trend: 'up', letterGrade: 'A-' },
  { id: 'gs6', name: 'Jordan Kim', initials: 'JK', scores: { q1: 65, q2: 58, hw1: null, hw2: null, t1: 62 }, average: 61.7, trend: 'down', letterGrade: 'D' },
  { id: 'gs7', name: 'Emma Larsson', initials: 'EL', scores: { q1: 91, q2: 93, hw1: 88, hw2: 95, t1: 89 }, average: 91.2, trend: 'flat', letterGrade: 'A-' },
  { id: 'gs8', name: 'Alex Rivera', initials: 'AR', scores: { q1: 82, q2: 79, hw1: 85, hw2: 82, t1: 80 }, average: 81.6, trend: 'flat', letterGrade: 'B-' },
];

export const gradebookAssignmentsDemo = [
  { id: 'q1', title: 'Quiz 1', weight: 15, maxScore: 100 },
  { id: 'q2', title: 'Quiz 2', weight: 15, maxScore: 100 },
  { id: 'hw1', title: 'HW Set 5', weight: 10, maxScore: 50 },
  { id: 'hw2', title: 'HW Set 6', weight: 10, maxScore: 50 },
  { id: 't1', title: 'Unit Test 2', weight: 25, maxScore: 100 },
];

// ── Exam schedule ──
export interface ExamDemo {
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
  status: 'upcoming' | 'in-progress' | 'completed' | 'graded';
  avgScore?: number;
}

export const examsDemo: ExamDemo[] = [
  { id: 'ex1', title: 'Unit 3 Test — Quadratic Functions', subject: 'Algebra II', className: 'Algebra II', classId: 'c1', date: '2026-03-12', startTime: '08:00', endTime: '08:50', room: 'Room 204', totalStudents: 28, status: 'upcoming' },
  { id: 'ex2', title: 'AP Practice Exam #2', subject: 'AP Calculus', className: 'AP Calculus AB', classId: 'c2', date: '2026-03-14', startTime: '09:00', endTime: '10:30', room: 'Room 204', totalStudents: 22, status: 'upcoming' },
  { id: 'ex3', title: 'Midterm — Geometry', subject: 'Geometry', className: 'Geometry', classId: 'c3', date: '2026-03-19', startTime: '10:15', endTime: '11:45', room: 'Room 106', totalStudents: 31, status: 'upcoming' },
  { id: 'ex4', title: 'Lab Practical: Forces & Motion', subject: 'Physics', className: 'Physics Honors', classId: 'c4', date: '2026-03-05', startTime: '13:00', endTime: '13:50', room: 'Lab 301', totalStudents: 24, status: 'graded', avgScore: 81.3 },
  { id: 'ex5', title: 'Chapter 4 Quiz', subject: 'Pre-Algebra', className: 'Pre-Algebra', classId: 'c5', date: '2026-03-04', startTime: '14:00', endTime: '14:30', room: 'Room 204', totalStudents: 30, status: 'graded', avgScore: 74.8 },
];

// ── Messages (threads) ──
export interface MessageThreadDemo {
  id: string;
  subject: string;
  participants: string[];
  lastMessage: string;
  lastSender: string;
  timestamp: string;
  unread: boolean;
  category: 'parent' | 'student' | 'staff' | 'admin';
}

export const messageThreadsDemo: MessageThreadDemo[] = [
  { id: 'mt1', subject: 'Jordan\'s missing assignments', participants: ['Mrs. Kim (Parent)'], lastMessage: 'Thank you, Ms. Chen. We will make sure Jordan completes the work this weekend.', lastSender: 'Mrs. Kim', timestamp: '2h ago', unread: true, category: 'parent' },
  { id: 'mt2', subject: 'AP Calc study session room booking', participants: ['Mr. Davis (Admin)'], lastMessage: 'Room 108 is available Saturday 10am-1pm. I\'ve reserved it for your students.', lastSender: 'Mr. Davis', timestamp: '5h ago', unread: false, category: 'admin' },
  { id: 'mt3', subject: 'Extra credit question — Physics', participants: ['Chen Wei (Student)'], lastMessage: 'Ms. Chen, can I do the advanced projectile problem for extra credit?', lastSender: 'Chen Wei', timestamp: '1d ago', unread: true, category: 'student' },
  { id: 'mt4', subject: 'Maria Garcia grade concern', participants: ['Ms. Johnson (Counselor)'], lastMessage: 'I spoke with Maria today. There may be issues at home. Let\'s coordinate.', lastSender: 'Ms. Johnson', timestamp: '1d ago', unread: false, category: 'staff' },
  { id: 'mt5', subject: 'Field trip permission — Science Museum', participants: ['Mrs. Patel (Parent)', 'Mr. Lee (Parent)'], lastMessage: 'Permission slips are due by March 10th. Please sign and return.', lastSender: 'You', timestamp: '2d ago', unread: false, category: 'parent' },
];

// ── Announcements ──
export interface AnnouncementDemo {
  id: string;
  title: string;
  body: string;
  author: string;
  audience: string;
  publishedAt: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  read: boolean;
}

export const announcementsDemo: AnnouncementDemo[] = [
  { id: 'an1', title: 'Spring Break Schedule Change', body: 'Spring break will now run March 23–30. The last day of classes is March 20, not March 21 as previously communicated.', author: 'Principal Martinez', audience: 'All Staff', publishedAt: '2026-03-04', priority: 'HIGH', read: false },
  { id: 'an2', title: 'Professional Development Day — March 15', body: 'Mandatory PD session on differentiated instruction strategies. Location: Auditorium A, 8:00 AM – 3:00 PM. Lunch provided.', author: 'VP Richardson', audience: 'All Teachers', publishedAt: '2026-03-03', priority: 'MEDIUM', read: false },
  { id: 'an3', title: 'Standardized Testing Window Open', body: 'State assessment testing begins March 17. Please review accommodation lists and testing room assignments.', author: 'Testing Coordinator', audience: 'All Teachers', publishedAt: '2026-03-02', priority: 'HIGH', read: true },
  { id: 'an4', title: 'New Copier Codes Issued', body: 'New department copier codes are active. Math department: 4472. Check your email for individual codes.', author: 'Office Manager', audience: 'All Staff', publishedAt: '2026-03-01', priority: 'LOW', read: true },
  { id: 'an5', title: 'Science Fair Volunteers Needed', body: 'We need 5 teacher judges for the regional science fair on March 22. Sign up in the front office.', author: 'Science Dept. Head', audience: 'All Teachers', publishedAt: '2026-02-28', priority: 'LOW', read: true },
];

// ── Behavior notes ──
export interface BehaviorNoteDemo {
  id: string;
  studentName: string;
  studentInitials: string;
  className: string;
  classId: string;
  type: 'positive' | 'concern' | 'incident';
  note: string;
  date: string;
  followUp?: string;
}

export const behaviorNotesDemo: BehaviorNoteDemo[] = [
  { id: 'bn1', studentName: 'Sam Lee', studentInitials: 'SL', className: 'AP Calculus AB', classId: 'c2', type: 'positive', note: 'Led group study session voluntarily. Helped 3 peers with integration concepts.', date: '2026-03-05' },
  { id: 'bn2', studentName: 'Tyler Brooks', studentInitials: 'TB', className: 'Pre-Algebra', classId: 'c5', type: 'concern', note: 'Frequently off-task on device. Warned twice this week.', date: '2026-03-05', followUp: 'Contact parent if continues' },
  { id: 'bn3', studentName: 'Jordan Kim', studentInitials: 'JK', className: 'Pre-Algebra', classId: 'c5', type: 'incident', note: 'Disruptive during group work. Moved to individual seating for remainder of class.', date: '2026-03-04', followUp: 'Counselor referral submitted' },
  { id: 'bn4', studentName: 'Emma Larsson', studentInitials: 'EL', className: 'Geometry', classId: 'c3', type: 'positive', note: 'Excellent presentation on geometric proofs. Class gave standing ovation.', date: '2026-03-03' },
  { id: 'bn5', studentName: 'Priya Patel', studentInitials: 'PP', className: 'Physics Honors', classId: 'c4', type: 'positive', note: 'Designed creative experiment for extra credit. Outstanding initiative.', date: '2026-03-02' },
  { id: 'bn6', studentName: 'Maria Garcia', studentInitials: 'MG', className: 'Geometry', classId: 'c3', type: 'concern', note: 'Seems withdrawn and disengaged. Not participating in class discussions.', date: '2026-03-04', followUp: 'Check in privately' },
];

// ── Meetings ──
export interface MeetingDemo {
  id: string;
  title: string;
  type: 'parent-conference' | 'staff-meeting' | 'department' | 'iep' | 'office-hours';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  attendees: string[];
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export const meetingsDemo: MeetingDemo[] = [
  { id: 'me1', title: 'Parent Conference — Jordan Kim', type: 'parent-conference', date: '2026-03-06', startTime: '15:00', endTime: '15:30', location: 'Room 204', attendees: ['Mrs. Kim (Parent)'], notes: 'Discuss missing assignments and action plan', status: 'scheduled' },
  { id: 'me2', title: 'Math Department Meeting', type: 'department', date: '2026-03-07', startTime: '07:30', endTime: '08:00', location: 'Room 108', attendees: ['Mr. Thompson', 'Mrs. Blake', 'Mr. Nguyen'], notes: 'Curriculum alignment for state testing', status: 'scheduled' },
  { id: 'me3', title: 'IEP Review — Alex Rivera', type: 'iep', date: '2026-03-10', startTime: '14:00', endTime: '15:00', location: 'Conference Room B', attendees: ['Mrs. Rivera (Parent)', 'Ms. Johnson (Counselor)', 'Dr. Patel (SpEd)'], notes: 'Annual IEP review — test accommodations update', status: 'scheduled' },
  { id: 'me4', title: 'Staff Meeting — Spring Testing', type: 'staff-meeting', date: '2026-03-11', startTime: '15:30', endTime: '16:30', location: 'Auditorium A', attendees: ['All Staff'], notes: 'Testing procedures and room assignments', status: 'scheduled' },
  { id: 'me5', title: 'Office Hours', type: 'office-hours', date: '2026-03-06', startTime: '15:30', endTime: '16:30', location: 'Room 204', attendees: [], notes: 'Open drop-in for students and parents', status: 'scheduled' },
  { id: 'me6', title: 'Parent Conference — Chen Wei Illness', type: 'parent-conference', date: '2026-03-04', startTime: '16:00', endTime: '16:30', location: 'Phone Call', attendees: ['Mr. Wei (Parent)'], notes: 'Confirmed Chen has flu, expected return Monday', status: 'completed' },
];

// ── Class performance summary (for reports) ──
export interface ClassPerformanceDemo {
  classId: string;
  className: string;
  avgGrade: number;
  passRate: number;
  attendanceRate: number;
  assignmentCompletion: number;
  topStudents: string[];
  atRiskStudents: string[];
}

export const classPerformanceDemo: ClassPerformanceDemo[] = [
  { classId: 'c1', className: 'Algebra II', avgGrade: 84.2, passRate: 92, attendanceRate: 96.5, assignmentCompletion: 89, topStudents: ['Chen Wei', 'David Johnson', 'Sarah Ahmad'], atRiskStudents: ['Jordan Kim'] },
  { classId: 'c2', className: 'AP Calculus AB', avgGrade: 88.7, passRate: 95, attendanceRate: 98.1, assignmentCompletion: 96, topStudents: ['Sam Lee', 'Chen Wei', 'Emma Larsson'], atRiskStudents: [] },
  { classId: 'c3', className: 'Geometry', avgGrade: 79.5, passRate: 84, attendanceRate: 93.2, assignmentCompletion: 82, topStudents: ['Emma Larsson', 'Sarah Ahmad'], atRiskStudents: ['Maria Garcia', 'Tyler Brooks'] },
  { classId: 'c4', className: 'Physics Honors', avgGrade: 82.1, passRate: 88, attendanceRate: 91.7, assignmentCompletion: 85, topStudents: ['Priya Patel', 'Chen Wei'], atRiskStudents: ['Chen Wei (attendance)'] },
  { classId: 'c5', className: 'Pre-Algebra', avgGrade: 76.8, passRate: 80, attendanceRate: 89.4, assignmentCompletion: 78, topStudents: ['Aisha Mohammed', 'David Johnson'], atRiskStudents: ['Jordan Kim', 'Tyler Brooks'] },
];

// ── Comment bank ──
export interface CommentBankItemDemo {
  id: string;
  category: 'positive' | 'improvement' | 'concern' | 'encouragement';
  text: string;
  uses: number;
}

export const commentBankDemo: CommentBankItemDemo[] = [
  { id: 'cb1', category: 'positive', text: 'Excellent work! Shows deep understanding of the material and applies concepts creatively.', uses: 42 },
  { id: 'cb2', category: 'positive', text: 'Great participation in class discussions. Your insights elevate the whole group.', uses: 35 },
  { id: 'cb3', category: 'improvement', text: 'Needs to show more work in solving problems step by step.', uses: 28 },
  { id: 'cb4', category: 'improvement', text: 'Strong conceptual understanding but careless arithmetic errors. Double-check calculations.', uses: 22 },
  { id: 'cb5', category: 'concern', text: 'Missing several assignments. Please schedule a meeting to discuss support options.', uses: 15 },
  { id: 'cb6', category: 'encouragement', text: 'Great improvement this quarter! Keep building on this momentum.', uses: 31 },
  { id: 'cb7', category: 'concern', text: 'Grade has declined significantly. Recommend tutoring and parent conference.', uses: 8 },
  { id: 'cb8', category: 'encouragement', text: 'Don\'t be discouraged by this result — your effort and growth mindset will pay off.', uses: 19 },
];

// ── Utility: format date for display ──
export function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatTimeRange(start: string, end: string): string {
  const fmt = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return m === 0 ? `${hour} ${suffix}` : `${hour}:${m.toString().padStart(2, '0')} ${suffix}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}
