import type { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../../utils/errors.js';

// ---------------------------------------------------------------------------
// In-memory wellness store (per user, keyed by userId)
// In production these would be Prisma models
// ---------------------------------------------------------------------------

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  moodEmoji: string;
  summary: string;
  userId: string;
  createdAt: string;
}

interface WellnessGoal {
  id: string;
  title: string;
  progress: number;
  target: string;
  current: string;
  userId: string;
}

const journalStore: JournalEntry[] = [
  { id: 'j1', date: 'May 14, 2025', mood: 'Great', moodEmoji: '😊', summary: 'Had a productive morning, completed the yoga session. Feeling energized.', userId: 'system', createdAt: new Date().toISOString() },
  { id: 'j2', date: 'May 13, 2025', mood: 'Okay', moodEmoji: '😐', summary: 'Stressful afternoon meetings but managed with breathing exercises.', userId: 'system', createdAt: new Date().toISOString() },
  { id: 'j3', date: 'May 12, 2025', mood: 'Good', moodEmoji: '😊', summary: 'Good sleep last night. Started a new meditation routine.', userId: 'system', createdAt: new Date().toISOString() },
  { id: 'j4', date: 'May 11, 2025', mood: 'Low', moodEmoji: '😔', summary: 'Feeling overwhelmed. Took a walk and it helped.', userId: 'system', createdAt: new Date().toISOString() },
];

const goalsStore: WellnessGoal[] = [
  { id: 'g1', title: 'Meditate 10 min daily', progress: 80, target: '30 days', current: '24 days', userId: 'system' },
  { id: 'g2', title: 'Exercise 3x per week', progress: 66, target: '12 weeks', current: '8 weeks', userId: 'system' },
  { id: 'g3', title: 'Sleep 7+ hours', progress: 90, target: '30 days', current: '27 days', userId: 'system' },
  { id: 'g4', title: 'Drink 8 glasses of water', progress: 45, target: '30 days', current: '14 days', userId: 'system' },
];

let nextId = 100;

// ---------------------------------------------------------------------------

export const wellnessController = {
  // GET /wellness/metrics
  async getMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        data: {
          wellnessScore: 78,
          moodTrend: 'Improving',
          activitiesDone: 12,
          streak: 5,
        },
      });
    } catch (error) { next(error); }
  },

  // GET /wellness/weekly
  async getWeeklySummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        data: [
          { day: 'Monday', activity: 'Morning meditation — 10 min', mood: 'Great', moodColor: 'border-emerald-500/30 text-emerald-400' },
          { day: 'Tuesday', activity: 'Yoga session — 30 min', mood: 'Good', moodColor: 'border-blue-500/30 text-blue-400' },
          { day: 'Wednesday', activity: 'Journaling — 15 min', mood: 'Neutral', moodColor: 'border-white/10 text-white/40' },
          { day: 'Thursday', activity: 'Group breathing exercise', mood: 'Good', moodColor: 'border-blue-500/30 text-blue-400' },
          { day: 'Friday', activity: 'Mindfulness walk — 20 min', mood: 'Great', moodColor: 'border-emerald-500/30 text-emerald-400' },
        ],
      });
    } catch (error) { next(error); }
  },

  // GET /wellness/journal
  async listJournalEntries(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: journalStore });
    } catch (error) { next(error); }
  },

  // POST /wellness/journal
  async createJournalEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mood, moodEmoji, summary } = req.body;
      const entry: JournalEntry = {
        id: `j${++nextId}`,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        mood: mood ?? 'Neutral',
        moodEmoji: moodEmoji ?? '😐',
        summary: summary ?? '',
        userId: (req as any).user?.id ?? 'system',
        createdAt: new Date().toISOString(),
      };
      journalStore.unshift(entry);
      res.status(201).json({ success: true, data: entry });
    } catch (error) { next(error); }
  },

  // GET /wellness/goals
  async listGoals(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ success: true, data: goalsStore });
    } catch (error) { next(error); }
  },

  // POST /wellness/goals
  async createGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, target } = req.body;
      const goal: WellnessGoal = {
        id: `g${++nextId}`,
        title: title ?? 'New Goal',
        progress: 0,
        target: target ?? '30 days',
        current: '0 days',
        userId: (req as any).user?.id ?? 'system',
      };
      goalsStore.push(goal);
      res.status(201).json({ success: true, data: goal });
    } catch (error) { next(error); }
  },

  // PATCH /wellness/goals/:id
  async updateGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const goal = goalsStore.find((g) => g.id === req.params.id);
      if (!goal) { throw new NotFoundError('Goal not found'); }
      if (req.body.progress !== undefined) goal.progress = req.body.progress;
      if (req.body.current !== undefined) goal.current = req.body.current;
      if (req.body.title !== undefined) goal.title = req.body.title;
      res.json({ success: true, data: goal });
    } catch (error) { next(error); }
  },

  // GET /wellness/mind-body
  async getMindBodyMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        data: [
          { title: 'Stress Level', value: 'Low', pct: 25, color: 'from-emerald-500 to-emerald-600' },
          { title: 'Sleep Quality', value: 'Good', pct: 72, color: 'from-blue-500 to-blue-600' },
          { title: 'Activity Level', value: 'Moderate', pct: 55, color: 'from-amber-500 to-amber-600' },
          { title: 'Social Connection', value: 'High', pct: 80, color: 'from-purple-500 to-purple-600' },
          { title: 'Focus Score', value: 'Above Avg', pct: 68, color: 'from-cyan-500 to-cyan-600' },
          { title: 'Happiness Index', value: '8/10', pct: 80, color: 'from-rose-500 to-rose-600' },
        ],
      });
    } catch (error) { next(error); }
  },

  // GET /wellness/resources
  async listResources(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        data: [
          { id: 'r1', title: 'Guided Meditation Library', category: 'Mindfulness', count: 24 },
          { id: 'r2', title: 'Exercise Routines', category: 'Physical', count: 18 },
          { id: 'r3', title: 'Emotional Wellness Guide', category: 'Mental Health', count: 12 },
          { id: 'r4', title: 'Sleep Improvement Tips', category: 'Rest', count: 8 },
          { id: 'r5', title: 'Nutrition & Hydration', category: 'Physical', count: 15 },
          { id: 'r6', title: 'Stress Management', category: 'Mental Health', count: 10 },
        ],
      });
    } catch (error) { next(error); }
  },
};
