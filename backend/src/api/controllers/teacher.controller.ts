import type { Request, Response } from 'express';

// ---------------------------------------------------------------------------
// In-memory teacher stores — production would use Prisma models
// ---------------------------------------------------------------------------

let uid = 1000;
const nextId = (prefix: string) => `${prefix}-${++uid}`;

// ── Profile ──
const teacherProfile = {
  id: 'teacher-001',
  firstName: 'Sarah',
  lastName: 'Chen',
  email: 'sarah.chen@lincoln.edu',
  avatar: '',
  department: 'Mathematics & Science',
  title: 'Senior Mathematics Teacher',
  phone: '+1 (555) 234-5678',
  bio: 'Mathematics and physics educator with 12 years of experience. Passionate about making STEM accessible to all learners.',
  subjectAreas: ['Mathematics', 'Physics'],
  schoolId: 'school-001',
};

// ── Schedule ──
const schedule = [
  { id: 's1', time: '07:45', endTime: '07:55', title: 'Morning Briefing', type: 'meeting', room: 'Staff Room' },
  { id: 's2', time: '08:00', endTime: '08:50', title: 'Algebra II — Grade 10', type: 'class', room: 'Room 204', classId: 'c1', studentCount: 28 },
  { id: 's3', time: '09:00', endTime: '09:50', title: 'AP Calculus AB — Grade 12', type: 'class', room: 'Room 204', classId: 'c2', studentCount: 22 },
  { id: 's4', time: '10:00', endTime: '10:15', title: 'Break', type: 'break', room: '' },
  { id: 's5', time: '10:15', endTime: '11:05', title: 'Geometry — Grade 9', type: 'class', room: 'Room 106', classId: 'c3', studentCount: 31 },
  { id: 's6', time: '11:15', endTime: '12:00', title: 'Planning Period', type: 'prep', room: 'Room 204', notes: 'Finish grading AP Calc quiz' },
  { id: 's7', time: '12:00', endTime: '12:45', title: 'Lunch', type: 'break', room: 'Cafeteria' },
  { id: 's8', time: '13:00', endTime: '13:50', title: 'Physics Honors — Grade 11', type: 'class', room: 'Lab 301', classId: 'c4', studentCount: 24 },
  { id: 's9', time: '14:00', endTime: '14:50', title: 'Pre-Algebra — Grade 8', type: 'class', room: 'Room 204', classId: 'c5', studentCount: 30 },
  { id: 's10', time: '15:00', endTime: '15:30', title: 'Parent Conference — Jordan Kim', type: 'meeting', room: 'Room 204' },
];

// ── Classes ──
const classes = [
  { id: 'c1', name: 'Algebra II', subject: 'Mathematics', gradeLevel: 'Grade 10', period: 1, room: 'Room 204', studentCount: 28, avgGrade: 84.2, nextSession: '08:00 – 08:50', color: '#818cf8' },
  { id: 'c2', name: 'AP Calculus AB', subject: 'Mathematics', gradeLevel: 'Grade 12', period: 2, room: 'Room 204', studentCount: 22, avgGrade: 88.7, nextSession: '09:00 – 09:50', color: '#34d399' },
  { id: 'c3', name: 'Geometry', subject: 'Mathematics', gradeLevel: 'Grade 9', period: 3, room: 'Room 106', studentCount: 31, avgGrade: 79.5, nextSession: '10:15 – 11:05', color: '#f472b6' },
  { id: 'c4', name: 'Physics Honors', subject: 'Science', gradeLevel: 'Grade 11', period: 5, room: 'Lab 301', studentCount: 24, avgGrade: 82.1, nextSession: '13:00 – 13:50', color: '#fbbf24' },
  { id: 'c5', name: 'Pre-Algebra', subject: 'Mathematics', gradeLevel: 'Grade 8', period: 6, room: 'Room 204', studentCount: 30, avgGrade: 76.8, nextSession: '14:00 – 14:50', color: '#a78bfa' },
];

// ── Action items ──
const actionItems = [
  { id: 'a1', title: 'Grade AP Calculus Quiz #4', description: '22 papers, due back tomorrow', priority: 'HIGH', category: 'grading', dueBy: 'Today 5:00 PM', classId: 'c2' },
  { id: 'a2', title: 'Submit attendance for Period 3', description: 'Geometry — 3 students absent yesterday, unverified', priority: 'HIGH', category: 'attendance', dueBy: 'Today 11:30 AM', classId: 'c3' },
  { id: 'a3', title: 'Parent conference: Jordan Kim', description: 'Re: missing 3 assignments in Pre-Algebra', priority: 'HIGH', category: 'meeting', dueBy: 'Today 3:00 PM', classId: 'c5' },
  { id: 'a4', title: 'Review IEP accommodations update', description: 'New accommodations for Alex Rivera (extra time on tests)', priority: 'MEDIUM', category: 'admin', dueBy: 'This week' },
  { id: 'a5', title: 'Update lesson plan for quadratic equations', description: 'Algebra II Unit 4 starts Monday — materials needed', priority: 'MEDIUM', category: 'grading', dueBy: 'Friday', classId: 'c1' },
];

// ── Student alerts ──
const studentAlerts = [
  { id: 'al1', studentName: 'Maria Garcia', studentInitials: 'MG', className: 'Geometry', classId: 'c3', alert: 'Grade dropped 12% in 2 weeks — from B+ to C', severity: 'high', timestamp: '2h ago' },
  { id: 'al2', studentName: 'Jordan Kim', studentInitials: 'JK', className: 'Pre-Algebra', classId: 'c5', alert: '3 missing assignments this month', severity: 'high', timestamp: '1d ago' },
  { id: 'al3', studentName: 'Alex Rivera', studentInitials: 'AR', className: 'Algebra II', classId: 'c1', alert: 'IEP update: extended time on tests +50%', severity: 'medium', timestamp: '3d ago' },
  { id: 'al4', studentName: 'Sam Lee', studentInitials: 'SL', className: 'AP Calculus AB', classId: 'c2', alert: 'Perfect score on Quiz #3 — 3rd consecutive A+', severity: 'info', timestamp: '1d ago' },
  { id: 'al5', studentName: 'Chen Wei', studentInitials: 'CW', className: 'Physics Honors', classId: 'c4', alert: 'Absent 3 times this week — possible illness', severity: 'high', timestamp: '4h ago' },
];

// ── Grading queue ──
const gradingQueue = [
  { id: 'g1', assignment: 'Quiz #4 — Derivatives', className: 'AP Calculus AB', classId: 'c2', submitted: 22, total: 22, dueDate: 'Due yesterday', type: 'quiz' },
  { id: 'g2', assignment: 'Homework Set 7 — Polynomials', className: 'Algebra II', classId: 'c1', submitted: 26, total: 28, dueDate: 'Due today', type: 'homework' },
  { id: 'g3', assignment: 'Lab Report: Projectile Motion', className: 'Physics Honors', classId: 'c4', submitted: 20, total: 24, dueDate: 'Due today', type: 'project' },
  { id: 'g4', assignment: 'Chapter 5 Practice Set', className: 'Pre-Algebra', classId: 'c5', submitted: 28, total: 30, dueDate: 'Due in 2 days', type: 'homework' },
];

// ── Attendance students per class ──
const attendanceStudents: Record<string, Array<{ id: string; name: string; initials: string; streak: number; overallRate: number }>> = {
  c1: [
    { id: 'st1', name: 'Sarah Ahmad', initials: 'SA', streak: 14, overallRate: 98 },
    { id: 'st2', name: 'James Baker', initials: 'JB', streak: 7, overallRate: 94 },
    { id: 'st6', name: 'Jordan Kim', initials: 'JK', streak: 1, overallRate: 85 },
    { id: 'st8', name: 'Alex Rivera', initials: 'AR', streak: 5, overallRate: 93 },
  ],
  c2: [
    { id: 'st9', name: 'Sam Lee', initials: 'SL', streak: 28, overallRate: 100 },
    { id: 'st3', name: 'Chen Wei', initials: 'CW', streak: 0, overallRate: 82 },
    { id: 'st7', name: 'Emma Larsson', initials: 'EL', streak: 10, overallRate: 96 },
  ],
  c3: [
    { id: 'st4', name: 'Maria Garcia', initials: 'MG', streak: 3, overallRate: 91 },
    { id: 'st7', name: 'Emma Larsson', initials: 'EL', streak: 10, overallRate: 96 },
    { id: 'st11', name: 'Tyler Brooks', initials: 'TB', streak: 0, overallRate: 78 },
  ],
};

// ── Attendance history ──
const attendanceHistory: Array<{ id: string; classId: string; className: string; date: string; present: number; absent: number; late: number; excused: number; total: number }> = [
  { id: 'ah1', classId: 'c1', className: 'Algebra II', date: '2026-03-05', present: 26, absent: 1, late: 1, excused: 0, total: 28 },
  { id: 'ah2', classId: 'c2', className: 'AP Calculus AB', date: '2026-03-05', present: 21, absent: 1, late: 0, excused: 0, total: 22 },
  { id: 'ah3', classId: 'c3', className: 'Geometry', date: '2026-03-05', present: 28, absent: 2, late: 1, excused: 0, total: 31 },
  { id: 'ah4', classId: 'c1', className: 'Algebra II', date: '2026-03-04', present: 27, absent: 0, late: 1, excused: 0, total: 28 },
  { id: 'ah5', classId: 'c4', className: 'Physics Honors', date: '2026-03-05', present: 21, absent: 3, late: 0, excused: 0, total: 24 },
];

// ── Lesson plans ──
const lessonPlans = [
  { id: 'lp1', title: 'Introduction to Derivatives', className: 'AP Calculus AB', classId: 'c2', date: '2026-03-09', duration: '50 min', objectives: ['Define derivative as a limit', 'Calculate simple derivatives using definition'], status: 'ready', resources: ['Textbook Ch. 3', 'Desmos Activity', 'Practice worksheet'] },
  { id: 'lp2', title: 'Quadratic Equations — Completing the Square', className: 'Algebra II', classId: 'c1', date: '2026-03-09', duration: '50 min', objectives: ['Solve quadratics by completing the square', 'Convert between standard and vertex form'], status: 'draft', resources: ['Guided notes template', 'GeoGebra demo'] },
  { id: 'lp3', title: 'Triangle Congruence Proofs', className: 'Geometry', classId: 'c3', date: '2026-03-10', duration: '50 min', objectives: ['Apply SSS, SAS, ASA congruence postulates', 'Write two-column proofs'], status: 'ready', resources: ['Proof worksheet', 'Geometry construction tools'] },
  { id: 'lp4', title: 'Projectile Motion Lab', className: 'Physics Honors', classId: 'c4', date: '2026-03-10', duration: '50 min', objectives: ['Predict projectile trajectory', 'Measure and record launch data'], status: 'taught', resources: ['Lab kit', 'Data collection sheet', 'PhET simulation'] },
  { id: 'lp5', title: 'Operations with Fractions Review', className: 'Pre-Algebra', classId: 'c5', date: '2026-03-11', duration: '50 min', objectives: ['Add, subtract, multiply, divide fractions'], status: 'draft', resources: ['Practice set', 'Fraction manipulatives'] },
];

// ── Assignments ──
const assignments = [
  { id: 'as1', title: 'Homework Set 7 — Polynomials', className: 'Algebra II', classId: 'c1', type: 'homework', dueDate: '2026-03-06', assignedDate: '2026-03-03', totalPoints: 50, submitted: 26, total: 28, avgScore: 42.5, status: 'active' },
  { id: 'as2', title: 'Quiz #4 — Derivatives', className: 'AP Calculus AB', classId: 'c2', type: 'quiz', dueDate: '2026-03-05', assignedDate: '2026-03-05', totalPoints: 100, submitted: 22, total: 22, avgScore: null, status: 'closed' },
  { id: 'as3', title: 'Triangle Proofs Worksheet', className: 'Geometry', classId: 'c3', type: 'homework', dueDate: '2026-03-09', assignedDate: '2026-03-04', totalPoints: 30, submitted: 29, total: 31, avgScore: null, status: 'active' },
  { id: 'as4', title: 'Lab Report: Projectile Motion', className: 'Physics Honors', classId: 'c4', type: 'lab', dueDate: '2026-03-06', assignedDate: '2026-03-03', totalPoints: 75, submitted: 20, total: 24, avgScore: null, status: 'active' },
  { id: 'as5', title: 'Chapter 5 Practice Set', className: 'Pre-Algebra', classId: 'c5', type: 'homework', dueDate: '2026-03-08', assignedDate: '2026-03-04', totalPoints: 40, submitted: 28, total: 30, avgScore: null, status: 'active' },
  { id: 'as6', title: 'Unit 3 Test — Quadratic Functions', className: 'Algebra II', classId: 'c1', type: 'test', dueDate: '2026-03-12', assignedDate: '2026-03-01', totalPoints: 100, submitted: 0, total: 28, avgScore: null, status: 'draft' },
];

// ── Gradebook ──
const gradebookData: Record<string, { students: Array<{ id: string; name: string; scores: Record<string, number | null>; average: number; letterGrade: string }>; assignments: Array<{ id: string; title: string; weight: number; maxScore: number }> }> = {
  c1: {
    students: [
      { id: 'gs1', name: 'Sarah Ahmad', scores: { q1: 92, q2: 88, hw1: 95, hw2: 90, t1: 87 }, average: 90.4, letterGrade: 'A-' },
      { id: 'gs2', name: 'James Baker', scores: { q1: 78, q2: 82, hw1: 85, hw2: 80, t1: 75 }, average: 80.0, letterGrade: 'B-' },
      { id: 'gs4', name: 'Maria Garcia', scores: { q1: 85, q2: 72, hw1: 78, hw2: 65, t1: 70 }, average: 74.0, letterGrade: 'C' },
      { id: 'gs6', name: 'Jordan Kim', scores: { q1: 65, q2: 58, hw1: null, hw2: null, t1: 62 }, average: 61.7, letterGrade: 'D' },
    ],
    assignments: [
      { id: 'q1', title: 'Quiz 1', weight: 15, maxScore: 100 },
      { id: 'q2', title: 'Quiz 2', weight: 15, maxScore: 100 },
      { id: 'hw1', title: 'HW Set 5', weight: 10, maxScore: 50 },
      { id: 'hw2', title: 'HW Set 6', weight: 10, maxScore: 50 },
      { id: 't1', title: 'Unit Test 2', weight: 25, maxScore: 100 },
    ],
  },
};

// ── Comment Bank ──
const commentBank = [
  { id: 'cb1', category: 'positive', text: 'Excellent work! Shows deep understanding of the material and applies concepts creatively.', uses: 42 },
  { id: 'cb2', category: 'positive', text: 'Great participation in class discussions. Your insights elevate the whole group.', uses: 35 },
  { id: 'cb3', category: 'improvement', text: 'Needs to show more work in solving problems step by step.', uses: 28 },
  { id: 'cb4', category: 'improvement', text: 'Strong conceptual understanding but careless arithmetic errors. Double-check calculations.', uses: 22 },
  { id: 'cb5', category: 'concern', text: 'Missing several assignments. Please schedule a meeting to discuss support options.', uses: 15 },
  { id: 'cb6', category: 'encouragement', text: 'Great improvement this quarter! Keep building on this momentum.', uses: 31 },
  { id: 'cb7', category: 'concern', text: 'Grade has declined significantly. Recommend tutoring and parent conference.', uses: 8 },
  { id: 'cb8', category: 'encouragement', text: "Don't be discouraged by this result — your effort and growth mindset will pay off.", uses: 19 },
];

// ── Exams ──
const exams = [
  { id: 'ex1', title: 'Unit 3 Test — Quadratic Functions', subject: 'Algebra II', className: 'Algebra II', classId: 'c1', date: '2026-03-12', startTime: '08:00', endTime: '08:50', room: 'Room 204', totalStudents: 28, status: 'upcoming' },
  { id: 'ex2', title: 'AP Practice Exam #2', subject: 'AP Calculus', className: 'AP Calculus AB', classId: 'c2', date: '2026-03-14', startTime: '09:00', endTime: '10:30', room: 'Room 204', totalStudents: 22, status: 'upcoming' },
  { id: 'ex3', title: 'Midterm — Geometry', subject: 'Geometry', className: 'Geometry', classId: 'c3', date: '2026-03-19', startTime: '10:15', endTime: '11:45', room: 'Room 106', totalStudents: 31, status: 'upcoming' },
  { id: 'ex4', title: 'Lab Practical: Forces & Motion', subject: 'Physics', className: 'Physics Honors', classId: 'c4', date: '2026-03-05', startTime: '13:00', endTime: '13:50', room: 'Lab 301', totalStudents: 24, status: 'graded', avgScore: 81.3 },
  { id: 'ex5', title: 'Chapter 4 Quiz', subject: 'Pre-Algebra', className: 'Pre-Algebra', classId: 'c5', date: '2026-03-04', startTime: '14:00', endTime: '14:30', room: 'Room 204', totalStudents: 30, status: 'graded', avgScore: 74.8 },
];

// ── Messages ──
const messages = [
  { id: 'mt1', subject: "Jordan's missing assignments", participants: ['Mrs. Kim (Parent)'], lastMessage: 'Thank you, Ms. Chen. We will make sure Jordan completes the work this weekend.', lastSender: 'Mrs. Kim', timestamp: '2h ago', unread: true, category: 'parent' },
  { id: 'mt2', subject: 'AP Calc study session room booking', participants: ['Mr. Davis (Admin)'], lastMessage: "Room 108 is available Saturday 10am-1pm. I've reserved it for your students.", lastSender: 'Mr. Davis', timestamp: '5h ago', unread: false, category: 'admin' },
  { id: 'mt3', subject: 'Extra credit question — Physics', participants: ['Chen Wei (Student)'], lastMessage: 'Ms. Chen, can I do the advanced projectile problem for extra credit?', lastSender: 'Chen Wei', timestamp: '1d ago', unread: true, category: 'student' },
  { id: 'mt4', subject: 'Maria Garcia grade concern', participants: ['Ms. Johnson (Counselor)'], lastMessage: "I spoke with Maria today. There may be issues at home. Let's coordinate.", lastSender: 'Ms. Johnson', timestamp: '1d ago', unread: false, category: 'staff' },
];

// ── Thread message history ──
const threadMessages: Record<string, Array<{ id: string; sender: string; body: string; time: string }>> = {
  mt1: [
    { id: 'tm1', sender: 'You', body: "Hi Mrs. Kim, I wanted to reach out about Jordan's missing assignments in Pre-Algebra. He has 3 outstanding this month.", time: 'Mar 4, 2:30 PM' },
    { id: 'tm2', sender: 'Mrs. Kim', body: 'Thank you for letting me know, Ms. Chen. We were not aware of this. Can you send the list of assignments?', time: 'Mar 4, 4:15 PM' },
    { id: 'tm3', sender: 'You', body: 'Of course — HW Set 5, Chapter 4 Practice, and the Fraction Review worksheet. All were due within the past 2 weeks.', time: 'Mar 4, 4:45 PM' },
    { id: 'tm4', sender: 'Mrs. Kim', body: 'Thank you, Ms. Chen. We will make sure Jordan completes the work this weekend.', time: 'Mar 5, 9:20 AM' },
  ],
  mt2: [
    { id: 'tm5', sender: 'You', body: 'Hi Mr. Davis, is there a room available Saturday for an AP Calculus study session? About 15 students.', time: 'Mar 3, 10:00 AM' },
    { id: 'tm6', sender: 'Mr. Davis', body: "Room 108 is available Saturday 10am-1pm. I've reserved it for your students.", time: 'Mar 3, 11:30 AM' },
  ],
  mt3: [
    { id: 'tm7', sender: 'Chen Wei', body: 'Ms. Chen, can I do the advanced projectile problem for extra credit?', time: 'Mar 4, 3:10 PM' },
  ],
  mt4: [
    { id: 'tm8', sender: 'Ms. Johnson', body: "Hi Sarah, I noticed Maria Garcia's grades are slipping. Have you seen anything in class?", time: 'Mar 3, 11:00 AM' },
    { id: 'tm9', sender: 'You', body: "Yes, she's been very withdrawn the past two weeks. Not participating at all.", time: 'Mar 3, 12:15 PM' },
    { id: 'tm10', sender: 'Ms. Johnson', body: "I spoke with Maria today. There may be issues at home. Let's coordinate.", time: 'Mar 4, 10:30 AM' },
  ],
};

// ── Announcements ──
const announcements = [
  { id: 'an1', title: 'Spring Break Schedule Change', body: 'Spring break will now run March 23–30.', author: 'Principal Martinez', audience: 'All Staff', publishedAt: '2026-03-04', priority: 'HIGH', read: false },
  { id: 'an2', title: 'Professional Development Day — March 15', body: 'Mandatory PD session on differentiated instruction strategies.', author: 'VP Richardson', audience: 'All Teachers', publishedAt: '2026-03-03', priority: 'MEDIUM', read: false },
  { id: 'an3', title: 'Standardized Testing Window Open', body: 'State assessment testing begins March 17.', author: 'Testing Coordinator', audience: 'All Teachers', publishedAt: '2026-03-02', priority: 'HIGH', read: true },
];

// ── Behavior notes ──
const behaviorNotes: Array<{ id: string; studentName: string; studentInitials: string; className: string; classId: string; type: string; note: string; date: string; followUp?: string }> = [
  { id: 'bn1', studentName: 'Sam Lee', studentInitials: 'SL', className: 'AP Calculus AB', classId: 'c2', type: 'positive', note: 'Led group study session voluntarily.', date: '2026-03-05' },
  { id: 'bn2', studentName: 'Tyler Brooks', studentInitials: 'TB', className: 'Pre-Algebra', classId: 'c5', type: 'concern', note: 'Frequently off-task on device.', date: '2026-03-05', followUp: 'Contact parent if continues' },
  { id: 'bn3', studentName: 'Jordan Kim', studentInitials: 'JK', className: 'Pre-Algebra', classId: 'c5', type: 'incident', note: 'Disruptive during group work.', date: '2026-03-04', followUp: 'Counselor referral submitted' },
  { id: 'bn4', studentName: 'Emma Larsson', studentInitials: 'EL', className: 'Geometry', classId: 'c3', type: 'positive', note: 'Excellent presentation on geometric proofs.', date: '2026-03-03' },
  { id: 'bn5', studentName: 'Maria Garcia', studentInitials: 'MG', className: 'Geometry', classId: 'c3', type: 'concern', note: 'Seems withdrawn and disengaged.', date: '2026-03-04', followUp: 'Check in privately' },
];

// ── Meetings ──
const meetings: Array<{ id: string; title: string; type: string; date: string; startTime: string; endTime: string; location: string; attendees: string[]; notes?: string; status: string }> = [
  { id: 'me1', title: 'Parent Conference — Jordan Kim', type: 'parent-conference', date: '2026-03-06', startTime: '15:00', endTime: '15:30', location: 'Room 204', attendees: ['Mrs. Kim (Parent)'], notes: 'Discuss missing assignments', status: 'scheduled' },
  { id: 'me2', title: 'Math Department Meeting', type: 'department', date: '2026-03-07', startTime: '07:30', endTime: '08:00', location: 'Room 108', attendees: ['Mr. Thompson', 'Mrs. Blake'], notes: 'Curriculum alignment', status: 'scheduled' },
  { id: 'me3', title: 'IEP Review — Alex Rivera', type: 'iep', date: '2026-03-10', startTime: '14:00', endTime: '15:00', location: 'Conference Room B', attendees: ['Mrs. Rivera (Parent)', 'Ms. Johnson (Counselor)'], notes: 'Annual IEP review', status: 'scheduled' },
  { id: 'me4', title: 'Office Hours', type: 'office-hours', date: '2026-03-06', startTime: '15:30', endTime: '16:30', location: 'Room 204', attendees: [], notes: 'Open drop-in', status: 'scheduled' },
];

// ── Class performance ──
const classPerformance = [
  { classId: 'c1', className: 'Algebra II', avgGrade: 84.2, passRate: 92, attendanceRate: 96.5, assignmentCompletion: 89, topStudents: ['Chen Wei', 'David Johnson', 'Sarah Ahmad'], atRiskStudents: ['Jordan Kim'] },
  { classId: 'c2', className: 'AP Calculus AB', avgGrade: 88.7, passRate: 95, attendanceRate: 98.1, assignmentCompletion: 96, topStudents: ['Sam Lee', 'Chen Wei', 'Emma Larsson'], atRiskStudents: [] },
  { classId: 'c3', className: 'Geometry', avgGrade: 79.5, passRate: 84, attendanceRate: 93.2, assignmentCompletion: 82, topStudents: ['Emma Larsson', 'Sarah Ahmad'], atRiskStudents: ['Maria Garcia', 'Tyler Brooks'] },
  { classId: 'c4', className: 'Physics Honors', avgGrade: 82.1, passRate: 88, attendanceRate: 91.7, assignmentCompletion: 85, topStudents: ['Priya Patel', 'Chen Wei'], atRiskStudents: [] },
  { classId: 'c5', className: 'Pre-Algebra', avgGrade: 76.8, passRate: 80, attendanceRate: 89.4, assignmentCompletion: 78, topStudents: ['Aisha Mohammed', 'David Johnson'], atRiskStudents: ['Jordan Kim', 'Tyler Brooks'] },
];

// ---------------------------------------------------------------------------
// Controller methods
// ---------------------------------------------------------------------------

const ok = (res: Response, data: unknown) => res.json({ success: true, data });

export const getProfile = (_req: Request, res: Response) => ok(res, teacherProfile);

export const updateProfile = (req: Request, res: Response) => {
  Object.assign(teacherProfile, req.body);
  ok(res, teacherProfile);
};

export const changePassword = (_req: Request, res: Response) => ok(res, { message: 'Password changed successfully' });

export const updateAvatar = (_req: Request, res: Response) => {
  teacherProfile.avatar = '/avatars/teacher-001-new.png';
  ok(res, { avatar: teacherProfile.avatar });
};

export const getSchedule = (_req: Request, res: Response) => ok(res, schedule);
export const getActionItems = (_req: Request, res: Response) => ok(res, actionItems);
export const getStudentAlerts = (_req: Request, res: Response) => ok(res, studentAlerts);
export const getGradingQueue = (_req: Request, res: Response) => ok(res, gradingQueue);

export const getClasses = (_req: Request, res: Response) => ok(res, classes);

export const getClassDetail = (req: Request, res: Response): void => {
  const cls = classes.find((c) => c.id === req.params.classId);
  if (!cls) { res.status(404).json({ success: false, error: 'Class not found' }); return; }

  const classAssignments = assignments.filter((a) => a.classId === cls.id);
  const classStudents = attendanceStudents[cls.id] ?? [];
  const gbData = gradebookData[cls.id];

  // Build enriched student list
  const students = classStudents.map((s) => {
    const gbStudent = gbData?.students.find((gs) => gs.name === s.name);
    const avg = gbStudent?.average ?? cls.avgGrade + (Math.random() * 10 - 5);
    const missing = classAssignments.filter((a) => a.status === 'active').length > 0 ? Math.floor(Math.random() * 3) : 0;
    const attendanceRate = s.overallRate;
    let status: 'on-track' | 'at-risk' | 'excelling' = 'on-track';
    if (avg >= 90 && attendanceRate >= 95) status = 'excelling';
    else if (avg < 70 || attendanceRate < 85 || missing >= 2) status = 'at-risk';
    const letterGrade = gbStudent?.letterGrade ?? (avg >= 90 ? 'A' : avg >= 80 ? 'B' : avg >= 70 ? 'C' : avg >= 60 ? 'D' : 'F');
    return {
      id: s.id,
      name: s.name,
      initials: s.initials,
      email: `${s.name.toLowerCase().replace(/\s/g, '.')}@lincoln.edu`,
      average: Math.round(avg * 10) / 10,
      letterGrade,
      attendanceRate,
      streak: s.streak,
      missingAssignments: missing,
      status,
    };
  });

  // Fill extra students if the class has more students than we have in attendance
  const extraCount = cls.studentCount - students.length;
  const extraNames = [
    ['David Johnson', 'DJ'], ['Priya Patel', 'PP'], ['Aisha Mohammed', 'AM'],
    ['Liam O\'Brien', 'LO'], ['Sofia Martinez', 'SM'], ['Noah Taylor', 'NT'],
    ['Isabella Nguyen', 'IN'], ['Mason Clark', 'MC'], ['Ava Thompson', 'AT'],
    ['Lucas Wright', 'LW'], ['Mia Davis', 'MD'], ['Ethan Wilson', 'EW'],
    ['Harper Brown', 'HB'], ['Oliver Harris', 'OH'], ['Charlotte Lewis', 'CL'],
    ['William Moore', 'WM'], ['Amelia Anderson', 'AA'], ['Benjamin Martin', 'BM'],
    ['Evelyn Jackson', 'EJ'], ['Henry White', 'HW'], ['Scarlett Robinson', 'SR'],
    ['Alexander Hall', 'AH'], ['Chloe Young', 'CY'], ['Daniel King', 'DK'],
    ['Grace Scott', 'GS'], ['Sebastian Green', 'SG'], ['Lily Adams', 'LA'],
    ['Jack Baker', 'JB2'],
  ];
  for (let i = 0; i < Math.min(extraCount, extraNames.length); i++) {
    const [name, initials] = extraNames[i];
    const avg = cls.avgGrade + (Math.random() * 20 - 10);
    const attendanceRate = 85 + Math.random() * 15;
    let status: 'on-track' | 'at-risk' | 'excelling' = 'on-track';
    if (avg >= 90 && attendanceRate >= 95) status = 'excelling';
    else if (avg < 70 || attendanceRate < 85) status = 'at-risk';
    students.push({
      id: `st-extra-${cls.id}-${i}`,
      name,
      initials,
      email: `${name.toLowerCase().replace(/['\s]/g, '.')}@lincoln.edu`,
      average: Math.round(avg * 10) / 10,
      letterGrade: avg >= 90 ? 'A' : avg >= 80 ? 'B' : avg >= 70 ? 'C' : avg >= 60 ? 'D' : 'F',
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      streak: Math.floor(Math.random() * 20),
      missingAssignments: Math.floor(Math.random() * 3),
      status,
    });
  }

  const totalAttendance = students.reduce((s, st) => s + st.attendanceRate, 0);
  const detail = {
    ...cls,
    attendanceRate: Math.round((totalAttendance / (students.length || 1)) * 10) / 10,
    assignmentCompletion: classAssignments.length > 0
      ? Math.round(classAssignments.reduce((s, a) => s + (a.submitted / (a.total || 1)) * 100, 0) / classAssignments.length)
      : 0,
    upcomingAssignments: classAssignments.filter((a) => a.status === 'active' || a.status === 'draft').length,
    recentAssignments: classAssignments.slice(0, 5).map((a) => ({
      id: a.id, title: a.title, type: a.type, dueDate: a.dueDate, avgScore: a.avgScore, status: a.status,
    })),
    students,
  };
  ok(res, detail);
};

export const getAttendanceByClass = (req: Request, res: Response) => {
  const students = attendanceStudents[req.params.classId as string] ?? [];
  ok(res, students.map((s: Record<string, unknown>) => ({ ...s, status: null })));
};

export const getAttendanceHistory = (_req: Request, res: Response) => ok(res, attendanceHistory);

export const submitAttendance = (req: Request, res: Response) => {
  const { classId, date, records } = req.body;
  const present = records.filter((r: any) => r.status === 'PRESENT').length;
  const absent = records.filter((r: any) => r.status === 'ABSENT').length;
  const late = records.filter((r: any) => r.status === 'LATE').length;
  const excused = records.filter((r: any) => r.status === 'EXCUSED').length;
  const cn = classes.find((c) => c.id === classId)?.name ?? classId;
  const entry = { id: nextId('ah'), classId, className: cn, date, present, absent, late, excused, total: records.length };
  attendanceHistory.unshift(entry);
  ok(res, entry);
};

export const getLessonPlans = (_req: Request, res: Response) => ok(res, lessonPlans);

export const createLessonPlan = (req: Request, res: Response) => {
  const { title, classId, objectives, resources, duration, status } = req.body;
  const cn = classes.find((c) => c.id === classId)?.name ?? classId;
  const plan = {
    id: nextId('lp'),
    title,
    className: cn,
    classId,
    date: new Date().toISOString().slice(0, 10),
    duration: duration || '50 min',
    objectives: objectives ? objectives.split('\n').filter(Boolean) : [],
    status: status || 'draft',
    resources: resources ? resources.split(',').map((r: string) => r.trim()) : [],
  };
  lessonPlans.unshift(plan);
  ok(res, plan);
};

export const getAssignments = (_req: Request, res: Response) => ok(res, assignments);

export const createAssignment = (req: Request, res: Response) => {
  const { title, classId, type, dueDate, totalPoints, instructions, status } = req.body;
  const cn = classes.find((c) => c.id === classId)?.name ?? classId;
  const assignment = {
    id: nextId('as'),
    title,
    className: cn,
    classId,
    type: type || 'homework',
    dueDate,
    assignedDate: new Date().toISOString().slice(0, 10),
    totalPoints: totalPoints || 100,
    submitted: 0,
    total: classes.find((c) => c.id === classId)?.studentCount ?? 0,
    avgScore: null,
    status: status || 'active',
    instructions: instructions || '',
  };
  assignments.unshift(assignment);
  ok(res, assignment);
};

export const gradeSubmission = (req: Request, res: Response) => {
  ok(res, { ...req.body, gradedAt: new Date().toISOString() });
};

export const getGradebook = (req: Request, res: Response) => {
  const data = gradebookData[req.params.classId as string] ?? { students: [], assignments: [] };
  ok(res, data);
};

export const saveGrades = (req: Request, res: Response) => {
  ok(res, { saved: req.body.grades?.length ?? 0 });
};

export const exportGrades = (req: Request, res: Response) => {
  ok(res, { url: `/exports/gradebook-${req.body.classId}.csv`, format: req.body.format || 'csv' });
};

export const getCommentBank = (_req: Request, res: Response) => ok(res, commentBank);

export const addComment = (req: Request, res: Response) => {
  const comment = { id: nextId('cb'), category: req.body.category, text: req.body.text, uses: 0 };
  commentBank.push(comment);
  ok(res, comment);
};

export const getExams = (_req: Request, res: Response) => ok(res, exams);

export const saveExamMarks = (req: Request, res: Response) => {
  const exam = exams.find((e) => e.id === req.body.examId);
  if (exam) {
    (exam as any).status = 'graded';
    const marks = req.body.marks as Array<{ score: number }>;
    (exam as any).avgScore = marks.reduce((s, m) => s + m.score, 0) / marks.length;
  }
  ok(res, { saved: req.body.marks?.length ?? 0 });
};

export const getMessages = (_req: Request, res: Response) => ok(res, messages);

export const getThreadMessages = (req: Request, res: Response): void => {
  const threadId = req.params.threadId;
  const thread = messages.find((m) => m.id === threadId);
  if (!thread) { res.status(404).json({ success: false, error: 'Thread not found' }); return; }
  const history = threadMessages[threadId] ?? [];
  ok(res, { threadId, subject: thread.subject, messages: history });
};

export const replyToMessage = (req: Request, res: Response) => {
  const thread = messages.find((m) => m.id === req.body.threadId);
  if (thread) {
    thread.lastMessage = req.body.body;
    thread.lastSender = 'You';
    thread.timestamp = 'Just now';
    thread.unread = false;
    // Store in thread history
    if (!threadMessages[req.body.threadId]) threadMessages[req.body.threadId] = [];
    threadMessages[req.body.threadId].push({
      id: nextId('tm'),
      sender: 'You',
      body: req.body.body,
      time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
    });
  }
  ok(res, { threadId: req.body.threadId, sent: true });
};

export const createThread = (req: Request, res: Response) => {
  const thread = {
    id: nextId('mt'),
    subject: req.body.subject,
    participants: [req.body.recipient],
    lastMessage: req.body.body,
    lastSender: 'You',
    timestamp: 'Just now',
    unread: false,
    category: 'staff' as const,
  };
  messages.unshift(thread);
  ok(res, thread);
};

export const getAnnouncements = (_req: Request, res: Response) => ok(res, announcements);

export const createAnnouncement = (req: Request, res: Response) => {
  const ann = {
    id: nextId('an'),
    title: req.body.title,
    body: req.body.body,
    author: 'You',
    audience: (req.body.audiences || []).join(', ') || 'All',
    publishedAt: new Date().toISOString().slice(0, 10),
    priority: req.body.priority || 'MEDIUM',
    read: true,
  };
  announcements.unshift(ann);
  ok(res, ann);
};

export const getBehaviorNotes = (_req: Request, res: Response) => ok(res, behaviorNotes);

export const saveBehaviorNote = (req: Request, res: Response) => {
  const { studentName, className, classId, type, note, followUp } = req.body;
  const initials = studentName.split(' ').map((w: string) => w[0]).join('').toUpperCase();
  const entry = {
    id: nextId('bn'),
    studentName,
    studentInitials: initials,
    className: className || '',
    classId: classId || '',
    type: type || 'concern',
    note,
    date: new Date().toISOString().slice(0, 10),
    ...(followUp ? { followUp } : {}),
  };
  behaviorNotes.unshift(entry);
  ok(res, entry);
};

export const getMeetings = (_req: Request, res: Response) => ok(res, meetings);

export const scheduleMeeting = (req: Request, res: Response) => {
  const { title, type, date, startTime, endTime, location, attendees, notes } = req.body;
  const meeting = {
    id: nextId('me'),
    title,
    type: type || 'parent-conference',
    date,
    startTime,
    endTime,
    location,
    attendees: attendees ? attendees.split(',').map((a: string) => a.trim()) : [],
    notes: notes || '',
    status: 'scheduled',
  };
  meetings.unshift(meeting);
  ok(res, meeting);
};

export const getClassPerformance = (_req: Request, res: Response) => ok(res, classPerformance);

export const submitTicket = (req: Request, res: Response) => {
  ok(res, { id: nextId('tkt'), ...req.body, status: 'open', createdAt: new Date().toISOString() });
};

export const savePreferences = (req: Request, res: Response) => {
  ok(res, { ...req.body, saved: true });
};

export const uploadResource = (req: Request, res: Response) => {
  ok(res, { id: nextId('res'), ...req.body, uploadedAt: new Date().toISOString() });
};
