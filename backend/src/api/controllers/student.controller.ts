import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { NotFoundError, AppError, UnauthorizedError } from '../../utils/errors.js';
import { prisma } from '../../db/prisma.service.js';

// ---------------------------------------------------------------------------
// In-memory student store
// In production these would be Prisma models
// ---------------------------------------------------------------------------

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  gradeLevel: string;
  section: string;
  enrollmentDate: string;
  schoolId: string;
}

interface StudentDocument {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
}

interface StudentInvoice {
  id: string;
  title: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

interface MoodEntry {
  id: string;
  mood: string;
  note?: string;
  date: string;
  userId: string;
}

interface WellnessSession {
  id: string;
  date: string;
  type: string;
  counselor: string;
  status: string;
  userId: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  type: string;
  subject: string;
  date: string;
  grade?: string;
  description: string;
  tags: string[];
}

interface DeptRequest {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'approved' | 'denied' | 'in-review';
  department: string;
  submittedAt: string;
  description: string;
  response?: string;
}

interface MindMap {
  id: string;
  title: string;
  nodes: number;
  lastEdited: string;
  color: string;
  userId: string;
}

interface Citation {
  id: string;
  type: string;
  title: string;
  authors: string;
  year: number;
  formatted: string;
  project: string;
  userId: string;
}

interface FocusSession {
  id: string;
  duration: number;
  task: string;
  completedAt: string;
  userId: string;
}

interface PlannerBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  day: string;
  color: string;
  userId: string;
}

interface CommunityPost {
  id: string;
  author: string;
  content: string;
  likes: number;
  replies: number;
  likedBy: string[];
  bookmarkedBy: string[];
  createdAt: string;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  read: boolean;
  date: string;
  userId: string;
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

let nextId = 1000;
const uid = () => `s${nextId++}`;

const profileStore: StudentProfile = {
  id: 'student-1',
  firstName: 'Alex',
  lastName: 'Johnson',
  email: 'alex.johnson@school.edu',
  avatar: '',
  gradeLevel: '10th',
  section: 'A',
  enrollmentDate: '2024-09-01',
  schoolId: 'school-1',
};

const documentsStore: StudentDocument[] = [
  { id: 'd1', name: 'Report Card Q1', type: 'pdf', date: '2025-01-15', size: '245 KB' },
  { id: 'd2', name: 'Enrollment Certificate', type: 'pdf', date: '2024-09-01', size: '120 KB' },
  { id: 'd3', name: 'Transfer Letter', type: 'docx', date: '2024-08-20', size: '85 KB' },
  { id: 'd4', name: 'Medical Records', type: 'pdf', date: '2024-09-05', size: '310 KB' },
];

const invoicesStore: StudentInvoice[] = [
  { id: 'inv1', title: 'Tuition - Spring 2025', amount: 5000, paidAmount: 5000, dueDate: '2025-01-15', status: 'paid' },
  { id: 'inv2', title: 'Lab Fee - Spring 2025', amount: 250, paidAmount: 250, dueDate: '2025-02-01', status: 'paid' },
  { id: 'inv3', title: 'Activity Fee', amount: 150, paidAmount: 0, dueDate: '2025-03-01', status: 'overdue' },
  { id: 'inv4', title: 'Summer Program', amount: 800, paidAmount: 0, dueDate: '2025-05-01', status: 'pending' },
];

const moodStore: MoodEntry[] = [
  { id: 'mood1', mood: 'happy', note: 'Great day in science class', date: '2025-03-15', userId: 'student-1' },
  { id: 'mood2', mood: 'neutral', note: 'Regular day', date: '2025-03-14', userId: 'student-1' },
  { id: 'mood3', mood: 'stressed', note: 'Math exam tomorrow', date: '2025-03-13', userId: 'student-1' },
];

const sessionsStore: WellnessSession[] = [
  { id: 'ws1', date: '2025-03-10', type: 'counseling', counselor: 'Dr. Smith', status: 'completed', userId: 'student-1' },
  { id: 'ws2', date: '2025-03-20', type: 'counseling', counselor: 'Dr. Smith', status: 'scheduled', userId: 'student-1' },
];

const portfolioStore: PortfolioItem[] = [
  { id: 'p1', title: 'Climate Change Research Paper', type: 'essay', subject: 'Science', date: '2025-03-10', grade: 'A', description: 'In-depth analysis of climate change effects.', tags: ['research', 'environment'] },
  { id: 'p2', title: 'Solar System 3D Model', type: 'project', subject: 'Physics', date: '2025-03-05', grade: 'A+', description: 'Interactive 3D model of the solar system.', tags: ['3d', 'physics'] },
  { id: 'p3', title: 'Chat Application', type: 'code', subject: 'CS', date: '2025-03-08', grade: 'A', description: 'Real-time chat app with WebSocket.', tags: ['react', 'websocket'] },
];

const deptRequestsStore: DeptRequest[] = [
  { id: 'dr1', title: 'Official Transcript Request', category: 'transcript', status: 'approved', department: 'Registrar', submittedAt: '2025-03-10', description: 'Need official transcript for college application.', response: 'Transcript mailed.' },
  { id: 'dr2', title: 'Schedule Change', category: 'schedule_change', status: 'in-review', department: 'Academic Affairs', submittedAt: '2025-03-14', description: 'Drop Art 101 and add Music Theory.' },
  { id: 'dr3', title: 'Excused Absence', category: 'excused_absence', status: 'pending', department: 'Student Affairs', submittedAt: '2025-03-15', description: 'Family medical appointment.' },
];

const mindMapsStore: MindMap[] = [
  { id: 'mm1', title: 'Cell Biology Concepts', nodes: 12, lastEdited: '2 hours ago', color: 'bg-indigo-500/10', userId: 'student-1' },
  { id: 'mm2', title: 'World War II Timeline', nodes: 8, lastEdited: '1 day ago', color: 'bg-amber-500/10', userId: 'student-1' },
];

const citationsStore: Citation[] = [
  { id: 'c1', type: 'book', title: 'Introduction to Algorithms', authors: 'Cormen, T. H.', year: 2009, formatted: 'Cormen, T. H. (2009). Introduction to algorithms.', project: 'CS Research', userId: 'student-1' },
  { id: 'c2', type: 'journal', title: 'Attention Is All You Need', authors: 'Vaswani, A.', year: 2017, formatted: 'Vaswani, A. (2017). Attention is all you need.', project: 'CS Research', userId: 'student-1' },
];

const focusSessionsStore: FocusSession[] = [
  { id: 'fs1', duration: 25, task: 'Math homework', completedAt: '2025-03-15T10:00:00Z', userId: 'student-1' },
  { id: 'fs2', duration: 50, task: 'Science reading', completedAt: '2025-03-14T14:00:00Z', userId: 'student-1' },
];

const plannerStore: PlannerBlock[] = [
  { id: 'pb1', title: 'Math Study', startTime: '09:00', endTime: '10:00', day: 'Monday', color: '#818cf8', userId: 'student-1' },
  { id: 'pb2', title: 'Science Lab', startTime: '10:30', endTime: '12:00', day: 'Monday', color: '#34d399', userId: 'student-1' },
  { id: 'pb3', title: 'English Essay', startTime: '14:00', endTime: '15:30', day: 'Tuesday', color: '#f472b6', userId: 'student-1' },
];

const communityPostsStore: CommunityPost[] = [
  { id: 'cp1', author: 'Alex J.', content: 'Anyone have notes from today\'s physics lecture?', likes: 5, replies: 3, likedBy: [], bookmarkedBy: [], createdAt: '2025-03-15T08:00:00Z' },
  { id: 'cp2', author: 'Maria S.', content: 'The robotics club meeting is moved to Friday!', likes: 12, replies: 7, likedBy: [], bookmarkedBy: [], createdAt: '2025-03-14T15:30:00Z' },
];

const notificationsStore: Notification[] = [
  { id: 'n1', title: 'Assignment Due', description: 'Math homework due tomorrow', read: false, date: '2025-03-15', userId: 'student-1' },
  { id: 'n2', title: 'Grade Posted', description: 'Science quiz graded: A', read: false, date: '2025-03-14', userId: 'student-1' },
  { id: 'n3', title: 'Event Reminder', description: 'School assembly at 10 AM', read: true, date: '2025-03-13', userId: 'student-1' },
];

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

export const studentController = {
  // ── Profile ──
  async getProfile(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: profileStore }); }
    catch (e) { next(e); }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      Object.assign(profileStore, req.body);
      res.json({ success: true, data: profileStore });
    } catch (e) { next(e); }
  },

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) throw new UnauthorizedError('Not authenticated');

      const { currentPassword, newPassword } = req.body;
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
      if (!user) throw new NotFoundError('User not found');

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) throw new AppError('Current password is incorrect', 400);

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

      res.json({ success: true, data: { message: 'Password changed successfully' } });
    } catch (e) { next(e); }
  },

  async updateAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      profileStore.avatar = req.body?.avatar || 'avatar-updated.jpg';
      res.json({ success: true, data: { url: profileStore.avatar } });
    } catch (e) { next(e); }
  },

  // ── Documents ──
  async listDocuments(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: documentsStore }); }
    catch (e) { next(e); }
  },

  async downloadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = documentsStore.find(d => d.id === req.params.id);
      if (!doc) { throw new NotFoundError('Document not found'); }
      res.json({ success: true, data: { url: `/files/${doc.name}`, name: doc.name } });
    } catch (e) { next(e); }
  },

  // ── Fees ──
  async listFees(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: invoicesStore }); }
    catch (e) { next(e); }
  },

  async payInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { invoiceId, amount } = req.body;
      const inv = invoicesStore.find(i => i.id === invoiceId);
      if (!inv) { throw new NotFoundError('Invoice not found'); }
      inv.paidAmount = Math.min(inv.paidAmount + amount, inv.amount);
      inv.status = inv.paidAmount >= inv.amount ? 'paid' : 'pending';
      res.json({ success: true, data: inv });
    } catch (e) { next(e); }
  },

  // ── Notifications ──
  async listNotifications(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: notificationsStore }); }
    catch (e) { next(e); }
  },

  async markAllNotificationsRead(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      notificationsStore.forEach(n => { n.read = true; });
      res.json({ success: true, data: null });
    } catch (e) { next(e); }
  },

  async clearNotifications(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      notificationsStore.length = 0;
      res.json({ success: true, data: null });
    } catch (e) { next(e); }
  },

  // ── My Day ──
  async getMyDay(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: { classes: [], assignments: [] } });
    } catch (e) { next(e); }
  },

  // ── Timetable ──
  async getTimetable(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: [] }); }
    catch (e) { next(e); }
  },

  // ── Subjects ──
  async listSubjects(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: [] }); }
    catch (e) { next(e); }
  },

  // ── Grades ──
  async listGrades(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: [] }); }
    catch (e) { next(e); }
  },

  // ── Exams ──
  async listExams(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: [] }); }
    catch (e) { next(e); }
  },

  // ── Attendance ──
  async getAttendance(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: [] }); }
    catch (e) { next(e); }
  },

  // ── Assignments ──
  async listAssignments(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: [] }); }
    catch (e) { next(e); }
  },

  async submitAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) throw new AppError('Not authenticated', 401);

      const assignmentId = String(req.params.id);
      const { content } = req.body;

      const submission = await prisma.submission.upsert({
        where: { assignmentId_studentId: { assignmentId, studentId: String(userId) } },
        update: { content: content ?? '', submittedAt: new Date() },
        create: { assignmentId, studentId: userId, content: content ?? '' },
      });

      res.status(201).json({ success: true, data: { id: submission.id, status: 'submitted', submittedAt: submission.submittedAt.toISOString() } });
    } catch (e) { next(e); }
  },

  // ── Wellness ──
  async getWellness(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Aggregate from existing mood + session stores until dedicated wellness Prisma model exists
      const recentMoods = moodStore.slice(0, 7);
      const positiveCount = recentMoods.filter(m => ['happy', 'great', 'good'].includes(m.mood)).length;
      const score = recentMoods.length > 0 ? Math.round((positiveCount / recentMoods.length) * 100) : 0;
      res.json({ success: true, data: { score, metrics: recentMoods.map(m => ({ mood: m.mood, date: m.date })) } });
    } catch (e) { next(e); }
  },

  async getMoodHistory(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: moodStore }); }
    catch (e) { next(e); }
  },

  async logMood(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry: MoodEntry = { id: uid(), mood: req.body.mood, note: req.body.note, date: new Date().toISOString(), userId: (req as any).user?.id ?? 'student-1' };
      moodStore.unshift(entry);
      res.status(201).json({ success: true, data: entry });
    } catch (e) { next(e); }
  },

  async listSessions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: sessionsStore }); }
    catch (e) { next(e); }
  },

  async bookSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session: WellnessSession = {
        id: uid(), date: req.body.preferredDate || new Date().toISOString(),
        type: req.body.type || 'counseling', counselor: 'Dr. Smith',
        status: 'scheduled', userId: (req as any).user?.id ?? 'student-1',
      };
      sessionsStore.push(session);
      res.status(201).json({ success: true, data: session });
    } catch (e) { next(e); }
  },

  async createWellnessGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({ success: true, data: { id: uid(), ...req.body, progress: 0 } });
    } catch (e) { next(e); }
  },

  async createJournalEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({ success: true, data: { id: uid(), ...req.body, date: new Date().toISOString() } });
    } catch (e) { next(e); }
  },

  // ── Learning Paths ──
  async listLearningPaths(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: [] }); }
    catch (e) { next(e); }
  },

  // ── Portfolio ──
  async listPortfolio(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: portfolioStore }); }
    catch (e) { next(e); }
  },

  async addPortfolioWork(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item: PortfolioItem = {
        id: uid(), title: req.body.title, type: req.body.type,
        subject: req.body.subject || '', date: new Date().toISOString().split('T')[0],
        description: req.body.description || '', tags: req.body.tags || [],
      };
      portfolioStore.push(item);
      res.status(201).json({ success: true, data: item });
    } catch (e) { next(e); }
  },

  // ── Mind Maps ──
  async listMindMaps(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: mindMapsStore }); }
    catch (e) { next(e); }
  },

  async createMindMap(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const map: MindMap = { id: uid(), title: req.body.title, nodes: 0, lastEdited: 'just now', color: req.body.color || 'bg-indigo-500/10', userId: (req as any).user?.id ?? 'student-1' };
      mindMapsStore.push(map);
      res.status(201).json({ success: true, data: map });
    } catch (e) { next(e); }
  },

  // ── Citations ──
  async listCitations(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: citationsStore }); }
    catch (e) { next(e); }
  },

  async generateCitation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const citation: Citation = {
        id: uid(), type: req.body.sourceType, title: req.body.title,
        authors: req.body.authors, year: req.body.year,
        formatted: `${req.body.authors} (${req.body.year}). ${req.body.title}.`,
        project: req.body.project || '', userId: (req as any).user?.id ?? 'student-1',
      };
      citationsStore.push(citation);
      res.status(201).json({ success: true, data: citation });
    } catch (e) { next(e); }
  },

  async deleteCitation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idx = citationsStore.findIndex(c => c.id === req.params.id);
      if (idx === -1) { throw new NotFoundError('Citation not found'); }
      citationsStore.splice(idx, 1);
      res.json({ success: true, data: null });
    } catch (e) { next(e); }
  },

  // ── Focus Sessions ──
  async listFocusSessions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: focusSessionsStore }); }
    catch (e) { next(e); }
  },

  async createFocusSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session: FocusSession = { id: uid(), duration: req.body.duration, task: req.body.task, completedAt: new Date().toISOString(), userId: (req as any).user?.id ?? 'student-1' };
      focusSessionsStore.push(session);
      res.status(201).json({ success: true, data: session });
    } catch (e) { next(e); }
  },

  // ── Planner ──
  async getPlanner(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: plannerStore }); }
    catch (e) { next(e); }
  },

  async addPlannerBlock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const block: PlannerBlock = { id: uid(), title: req.body.title, startTime: req.body.startTime, endTime: req.body.endTime, day: req.body.day, color: req.body.color || '#818cf8', userId: (req as any).user?.id ?? 'student-1' };
      plannerStore.push(block);
      res.status(201).json({ success: true, data: block });
    } catch (e) { next(e); }
  },

  async optimizePlanner(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Simulate AI optimization by sorting blocks by time
      plannerStore.sort((a, b) => a.startTime.localeCompare(b.startTime));
      res.json({ success: true, data: plannerStore });
    } catch (e) { next(e); }
  },

  // ── Messages ──
  async listMessages(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: [] }); }
    catch (e) { next(e); }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({ success: true, data: { id: uid(), ...req.body, sentAt: new Date().toISOString() } });
    } catch (e) { next(e); }
  },

  // ── Announcements ──
  async listAnnouncements(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: [] }); }
    catch (e) { next(e); }
  },

  // ── Community ──
  async listCommunityPosts(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: communityPostsStore }); }
    catch (e) { next(e); }
  },

  async createCommunityPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const post: CommunityPost = { id: uid(), author: 'You', content: req.body.content, likes: 0, replies: 0, likedBy: [], bookmarkedBy: [], createdAt: new Date().toISOString() };
      communityPostsStore.unshift(post);
      res.status(201).json({ success: true, data: post });
    } catch (e) { next(e); }
  },

  async likeCommunityPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const post = communityPostsStore.find(p => p.id === req.params.id);
      if (!post) { throw new NotFoundError('Post not found'); }
      const userId = (req as any).user?.id ?? 'student-1';
      if (post.likedBy.includes(userId)) {
        post.likedBy = post.likedBy.filter(id => id !== userId);
        post.likes--;
      } else {
        post.likedBy.push(userId);
        post.likes++;
      }
      res.json({ success: true, data: null });
    } catch (e) { next(e); }
  },

  async bookmarkCommunityPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const post = communityPostsStore.find(p => p.id === req.params.id);
      if (!post) { throw new NotFoundError('Post not found'); }
      const userId = (req as any).user?.id ?? 'student-1';
      if (post.bookmarkedBy.includes(userId)) {
        post.bookmarkedBy = post.bookmarkedBy.filter(id => id !== userId);
      } else {
        post.bookmarkedBy.push(userId);
      }
      res.json({ success: true, data: null });
    } catch (e) { next(e); }
  },

  // ── Department Requests ──
  async listDeptRequests(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ success: true, data: deptRequestsStore }); }
    catch (e) { next(e); }
  },

  async submitDeptRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request: DeptRequest = {
        id: uid(), title: req.body.title, category: req.body.category,
        status: 'pending', department: 'General',
        submittedAt: new Date().toISOString(), description: req.body.description,
      };
      deptRequestsStore.push(request);
      res.status(201).json({ success: true, data: request });
    } catch (e) { next(e); }
  },
};
