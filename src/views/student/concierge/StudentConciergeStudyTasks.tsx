/* Student Concierge › Study Tasks — All Tasks, Due Today, By Subject, Study Plan, Revision, Completed */
import { useNavigationStore } from '@/store/navigation.store';
import { ConciergeTaskCard } from '@/components/concierge/shared';
import { cn } from '@/lib/utils';
import { BookOpen, Calendar, Clock, Target } from 'lucide-react';
import { useStudentAssignments, useStudentPlanner } from '@/hooks/api/use-student';

interface StudentTask {
  id: string;
  title: string;
  linkedEntity: string;
  dueDate: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  owner: string;
  checklistTotal: number;
  checklistDone: number;
  category: 'homework' | 'project' | 'reading' | 'revision' | 'lab' | 'creative';
  subject: string;
  teacher: string;
  isBlocked?: boolean;
  blockedReason?: string;
}

const FALLBACK_TASKS: StudentTask[] = [
  {
    id: 't1', title: 'Complete Exercise 7.3 — Triangles (Problems 1–15)', linkedEntity: 'Mathematics',
    dueDate: 'Today', priority: 'urgent', owner: 'Me', checklistTotal: 15, checklistDone: 8,
    category: 'homework', subject: 'Mathematics', teacher: 'Mr. Raghav Iyer',
  },
  {
    id: 't2', title: 'Write lab observation notes — Reflection of Light', linkedEntity: 'Science',
    dueDate: 'Today', priority: 'high', owner: 'Me', checklistTotal: 4, checklistDone: 1,
    category: 'lab', subject: 'Science', teacher: 'Dr. Anand Kumar',
  },
  {
    id: 't3', title: 'Essay draft — "My Vision for India" (500 words)', linkedEntity: 'English',
    dueDate: 'Today', priority: 'high', owner: 'Me', checklistTotal: 3, checklistDone: 3,
    category: 'creative', subject: 'English', teacher: 'Mrs. Priya Sharma',
  },
  {
    id: 't4', title: 'Read Chapter 5 — The French Revolution', linkedEntity: 'Social Studies',
    dueDate: 'Tomorrow', priority: 'medium', owner: 'Me', checklistTotal: 3, checklistDone: 0,
    category: 'reading', subject: 'Social Studies', teacher: 'Mr. Vikram Singh',
  },
  {
    id: 't5', title: 'Revise for Hindi Unit Test — Premchand stories', linkedEntity: 'Hindi',
    dueDate: 'Mar 10', priority: 'high', owner: 'Me', checklistTotal: 5, checklistDone: 2,
    category: 'revision', subject: 'Hindi', teacher: 'Mrs. Sunita Verma',
  },
  {
    id: 't6', title: 'Python loops practice — Write 5 programs', linkedEntity: 'Computer Science',
    dueDate: 'Mar 11', priority: 'medium', owner: 'Me', checklistTotal: 5, checklistDone: 3,
    category: 'homework', subject: 'Computer Science', teacher: 'Ms. Deepa Nair',
  },
  {
    id: 't7', title: 'Science project — Working model of solar system', linkedEntity: 'Science',
    dueDate: 'Mar 20', priority: 'medium', owner: 'Me', checklistTotal: 6, checklistDone: 2,
    category: 'project', subject: 'Science', teacher: 'Dr. Anand Kumar',
    isBlocked: true, blockedReason: 'Waiting for thermocol sheet from shop',
  },
  {
    id: 't8', title: 'Revise Algebra — Polynomials for weekly test', linkedEntity: 'Mathematics',
    dueDate: 'Mar 12', priority: 'high', owner: 'Me', checklistTotal: 4, checklistDone: 0,
    category: 'revision', subject: 'Mathematics', teacher: 'Mr. Raghav Iyer',
  },
];

/* ── Study plan weekly schedule ── */
const FALLBACK_WEEKLY_PLAN = [
  { day: 'Monday', slots: [
    { time: '4:00 PM', subject: 'Mathematics', task: 'Complete Ch. 7 exercises', duration: '1 hr' },
    { time: '5:00 PM', subject: 'Science', task: 'Lab notes & diagram', duration: '45 min' },
    { time: '6:00 PM', subject: 'English', task: 'Essay writing practice', duration: '45 min' },
  ]},
  { day: 'Tuesday', slots: [
    { time: '4:00 PM', subject: 'Hindi', task: 'Premchand story revision', duration: '1 hr' },
    { time: '5:00 PM', subject: 'Social Studies', task: 'French Revolution notes', duration: '45 min' },
    { time: '6:00 PM', subject: 'Computer Science', task: 'Python practice', duration: '1 hr' },
  ]},
  { day: 'Wednesday', slots: [
    { time: '4:00 PM', subject: 'Mathematics', task: 'Polynomial revision', duration: '1.5 hr' },
    { time: '5:30 PM', subject: 'Science', task: 'Project model work', duration: '1 hr' },
    { time: '7:00 PM', subject: 'English', task: 'Grammar exercises', duration: '30 min' },
  ]},
  { day: 'Thursday', slots: [
    { time: '4:00 PM', subject: 'Hindi', task: 'Unit test preparation', duration: '1.5 hr' },
    { time: '5:30 PM', subject: 'Mathematics', task: 'Practice test papers', duration: '1 hr' },
    { time: '7:00 PM', subject: 'Social Studies', task: 'Map work practice', duration: '30 min' },
  ]},
  { day: 'Friday', slots: [
    { time: '4:00 PM', subject: 'Science', task: 'Chapter revision + formulas', duration: '1 hr' },
    { time: '5:00 PM', subject: 'Computer Science', task: 'Program debugging', duration: '45 min' },
    { time: '6:00 PM', subject: 'English', task: 'Literature Q&A practice', duration: '45 min' },
  ]},
  { day: 'Saturday', slots: [
    { time: '10:00 AM', subject: 'Mathematics', task: 'Weekly test revision', duration: '2 hr' },
    { time: '12:00 PM', subject: 'Science', task: 'Project work', duration: '1.5 hr' },
    { time: '4:00 PM', subject: 'Hindi', task: 'Creative writing', duration: '1 hr' },
  ]},
];

/* ── Revision items for upcoming tests ── */
const FALLBACK_REVISION_ITEMS = [
  { id: 'r1', subject: 'Hindi', test: 'Unit Test — Premchand Stories', date: 'Mar 10', syllabus: 'Idgah, Namak ka Daroga, Panch Parmeshwar', progress: 40, topics: ['Character analysis', 'Themes & morals', 'Hindi grammar from chapters'] },
  { id: 'r2', subject: 'Mathematics', test: 'Weekly Test — Polynomials', date: 'Mar 12', syllabus: 'Ch 2: Polynomials — all exercises', progress: 25, topics: ['Factor theorem', 'Remainder theorem', 'Zeroes of polynomial'] },
  { id: 'r3', subject: 'Science', test: 'Lab Viva — Reflection of Light', date: 'Mar 14', syllabus: 'Laws of reflection, mirror types, ray diagrams', progress: 60, topics: ['Plane mirror laws', 'Concave vs convex', 'Image formation'] },
  { id: 'r4', subject: 'English', test: 'Term Exam — Literature', date: 'Mar 25', syllabus: 'Beehive Ch 1–6, Moments Ch 1–4', progress: 15, topics: ['Character sketches', 'Summary writing', 'Reference to context'] },
];

const subjectColors: Record<string, string> = {
  'Mathematics': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Science': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'English': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Hindi': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'Social Studies': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'Computer Science': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
};

export function StudentConciergeStudyTasks() {
  const { activeSubNav } = useNavigationStore();

  const { data: apiTasks } = useStudentAssignments();
  const { data: apiPlanner } = useStudentPlanner();

  const taskData = (apiTasks as any[]) ?? FALLBACK_TASKS;
  const weeklyPlan = (apiPlanner as any[]) ?? FALLBACK_WEEKLY_PLAN;
  const revisionItems = FALLBACK_REVISION_ITEMS;

  /* ── By Subject ── */
  if (activeSubNav === 'c_by_subject') {
    const grouped = taskData.reduce<Record<string, StudentTask[]>>((acc, t) => {
      (acc[t.subject] ??= []).push(t);
      return acc;
    }, {});

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Tasks by Subject</h3>
        {Object.entries(grouped).map(([subject, tasks]) => (
          <div key={subject} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn('rounded-full border px-2.5 py-0.5 text-[10px] font-semibold', subjectColors[subject] ?? 'bg-zinc-500/10 text-zinc-500')}>
                {subject}
              </span>
              <span className="text-[10px] text-muted-foreground">{tasks.length} task{tasks.length > 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-2">
              {tasks.map((t) => (
                <ConciergeTaskCard key={t.id} {...t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── Study Plan ── */
  if (activeSubNav === 'c_study_plan') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Weekly Study Plan</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3" /> Mar 6 – Mar 12, 2026
          </div>
        </div>
        <div className="space-y-3">
          {weeklyPlan.map((day) => (
            <div key={day.day} className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5">
              <h4 className="mb-2 text-xs font-semibold text-foreground">{day.day}</h4>
              <div className="space-y-1.5">
                {day.slots.map((slot: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border/20 bg-background/50 px-3 py-2 dark:border-white/5">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground min-w-[60px]">
                      <Clock className="h-2.5 w-2.5" /> {slot.time}
                    </div>
                    <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium min-w-[80px] text-center', subjectColors[slot.subject] ?? 'bg-zinc-500/10 text-zinc-500')}>
                      {slot.subject}
                    </span>
                    <span className="flex-1 text-xs text-foreground/80">{slot.task}</span>
                    <span className="text-[10px] text-muted-foreground">{slot.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Revision ── */
  if (activeSubNav === 'c_revision') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Revision & Test Prep</h3>
        <p className="text-xs text-muted-foreground">Upcoming tests and your preparation progress</p>
        <div className="space-y-2">
          {revisionItems.map((r) => (
            <div key={r.id} className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', subjectColors[r.subject] ?? 'bg-zinc-500/10 text-zinc-500')}>
                    {r.subject}
                  </span>
                  <h5 className="text-xs font-medium text-foreground">{r.test}</h5>
                </div>
                <span className="text-[10px] text-muted-foreground">{r.date}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">Syllabus: {r.syllabus}</p>
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-foreground">Preparation Progress</span>
                  <span className="text-[10px] font-semibold text-foreground">{r.progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', r.progress >= 60 ? 'bg-emerald-500' : r.progress >= 30 ? 'bg-amber-500' : 'bg-red-500')}
                    style={{ width: `${r.progress}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {r.topics.map((topic) => (
                  <span key={topic} className="rounded-lg border border-border/20 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground">
                    {topic}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/90">
                  <Target className="h-2.5 w-2.5" /> Start Revision
                </button>
                <button className="rounded-lg border border-border/50 px-3 py-1 text-[10px] font-medium text-foreground hover:bg-muted/60">
                  View Resources
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Completed ── */
  if (activeSubNav === 'c_completed') {
    const completed = taskData.filter((t) => t.checklistTotal > 0 && t.checklistDone === t.checklistTotal);
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Completed Tasks</h3>
        <div className="space-y-2">
          {completed.map((t) => (
            <ConciergeTaskCard key={t.id} {...t} />
          ))}
          {completed.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No completed tasks yet — keep going!</p>
          )}
        </div>
      </div>
    );
  }

  /* ── Due Today ── */
  if (activeSubNav === 'c_due_today') {
    const dueToday = taskData.filter((t) => t.dueDate === 'Today');
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Due Today</h3>
        <div className="space-y-2">
          {dueToday.map((t) => (
            <ConciergeTaskCard key={t.id} {...t} />
          ))}
          {dueToday.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Nothing due today — you're all caught up!</p>
          )}
        </div>
      </div>
    );
  }

  /* ── All Tasks (default) ── */
  const heading = (() => {
    switch (activeSubNav) {
      case 'c_due_today': return 'Due Today';
      case 'c_by_subject': return 'By Subject';
      case 'c_study_plan': return 'Study Plan';
      case 'c_revision': return 'Revision';
      case 'c_completed': return 'Completed';
      default: return 'All Tasks';
    }
  })();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <BookOpen className="h-3 w-3" /> {taskData.length} tasks
        </div>
      </div>
      <div className="space-y-2">
        {taskData.map((t) => (
          <ConciergeTaskCard key={t.id} {...t} />
        ))}
      </div>
    </div>
  );
}
