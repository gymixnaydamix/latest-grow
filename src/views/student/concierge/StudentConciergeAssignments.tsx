/* Student Concierge › Assignments — Pending, Submitted, Graded, Projects, Group Work, Upload */
import { useNavigationStore } from '@/store/navigation.store';
import { ConciergeSplitPreviewPanel, ConciergePermissionBadge } from '@/components/concierge/shared';
import { cn } from '@/lib/utils';
import { Upload, CheckCircle, Users, FileText, AlertTriangle } from 'lucide-react';

/* ── Pending assignments ── */
interface PendingAssignment {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  dueDate: string;
  type: 'essay' | 'worksheet' | 'project' | 'lab';
  description: string;
  maxMarks: number;
}

const pendingAssignments: PendingAssignment[] = [
  { id: 'pa1', name: 'The French Revolution — Essay', subject: 'Social Studies', teacher: 'Mr. Vikram Singh', dueDate: 'Mar 8', type: 'essay', description: 'Write a 500-word essay on the causes and effects of the French Revolution.', maxMarks: 25 },
  { id: 'pa2', name: 'Polynomials Worksheet — Set B', subject: 'Mathematics', teacher: 'Mr. Raghav Iyer', dueDate: 'Mar 9', type: 'worksheet', description: 'Exercise 2.4 — Problems 1–20, all working steps required.', maxMarks: 20 },
  { id: 'pa3', name: 'Reflection of Light — Lab Report', subject: 'Science', teacher: 'Dr. Anand Kumar', dueDate: 'Mar 10', type: 'lab', description: 'Complete lab observation with ray diagrams, readings table, and conclusion.', maxMarks: 15 },
  { id: 'pa4', name: 'Solar System Model', subject: 'Science', teacher: 'Dr. Anand Kumar', dueDate: 'Mar 20', type: 'project', description: 'Working model showing relative distances and sizes of planets.', maxMarks: 50 },
  { id: 'pa5', name: 'Python Programs — Loops', subject: 'Computer Science', teacher: 'Ms. Deepa Nair', dueDate: 'Mar 11', type: 'worksheet', description: 'Write 5 programs using for/while loops with proper comments.', maxMarks: 20 },
];

/* ── Submitted assignments ── */
const submittedAssignments = [
  { id: 'sa1', name: 'My Vision for India — Essay', subject: 'English', teacher: 'Mrs. Priya Sharma', submittedAt: 'Mar 5, 3:45 PM', status: 'Under Review', fileType: 'PDF', fileSize: '245 KB' },
  { id: 'sa2', name: 'Triangles Worksheet — Set A', subject: 'Mathematics', teacher: 'Mr. Raghav Iyer', submittedAt: 'Mar 4, 2:15 PM', status: 'Under Review', fileType: 'PDF', fileSize: '180 KB' },
  { id: 'sa3', name: 'Idgah — Character Analysis', subject: 'Hindi', teacher: 'Mrs. Sunita Verma', submittedAt: 'Mar 3, 5:30 PM', status: 'Reviewed', fileType: 'DOC', fileSize: '120 KB' },
  { id: 'sa4', name: 'Map Work — India Rivers', subject: 'Social Studies', teacher: 'Mr. Vikram Singh', submittedAt: 'Mar 2, 4:00 PM', status: 'Reviewed', fileType: 'PDF', fileSize: '315 KB' },
];

/* ── Graded assignments ── */
const gradedAssignments = [
  { id: 'ga1', name: 'Idgah — Character Analysis', subject: 'Hindi', teacher: 'Mrs. Sunita Verma', score: 22, maxMarks: 25, grade: 'A', feedback: 'Excellent understanding of Hamid\'s character. Your Hindi expression has improved significantly. Minor grammar errors in paragraph 3.', rubric: [{ criterion: 'Content', marks: 9, total: 10 }, { criterion: 'Language', marks: 7, total: 8 }, { criterion: 'Presentation', marks: 6, total: 7 }] },
  { id: 'ga2', name: 'Map Work — India Rivers', subject: 'Social Studies', teacher: 'Mr. Vikram Singh', score: 18, maxMarks: 20, grade: 'A', feedback: 'All rivers accurately marked. Neat labelling. Bonus marks for adding tributaries.', rubric: [{ criterion: 'Accuracy', marks: 10, total: 10 }, { criterion: 'Neatness', marks: 4, total: 5 }, { criterion: 'Completeness', marks: 4, total: 5 }] },
  { id: 'ga3', name: 'Linear Equations Practice', subject: 'Mathematics', teacher: 'Mr. Raghav Iyer', score: 16, maxMarks: 20, grade: 'B+', feedback: 'Good problem-solving steps. Made a sign error in Q.8 and Q.12. Revise transposition method.', rubric: [{ criterion: 'Method', marks: 8, total: 10 }, { criterion: 'Accuracy', marks: 5, total: 6 }, { criterion: 'Presentation', marks: 3, total: 4 }] },
  { id: 'ga4', name: 'Cell Structure Diagram', subject: 'Science', teacher: 'Dr. Anand Kumar', score: 13, maxMarks: 15, grade: 'A', feedback: 'Well-labelled diagram with clean lines. Missed Golgi apparatus label. Add colour for better distinction next time.', rubric: [{ criterion: 'Diagram Accuracy', marks: 6, total: 7 }, { criterion: 'Labelling', marks: 4, total: 5 }, { criterion: 'Neatness', marks: 3, total: 3 }] },
];

/* ── Projects with milestones ── */
const projectData = [
  {
    id: 'p1', name: 'Solar System Working Model', subject: 'Science', teacher: 'Dr. Anand Kumar',
    dueDate: 'Mar 20', maxMarks: 50, teamSize: 1,
    milestones: [
      { label: 'Research & planning', done: true, date: 'Feb 25' },
      { label: 'Material collection', done: true, date: 'Mar 1' },
      { label: 'Base structure built', done: false, date: 'Mar 10' },
      { label: 'Painting & labelling', done: false, date: 'Mar 15' },
      { label: 'Final assembly & testing', done: false, date: 'Mar 18' },
      { label: 'Presentation ready', done: false, date: 'Mar 20' },
    ],
  },
  {
    id: 'p2', name: 'Python Mini-Project: Quiz App', subject: 'Computer Science', teacher: 'Ms. Deepa Nair',
    dueDate: 'Mar 25', maxMarks: 40, teamSize: 2,
    milestones: [
      { label: 'Design question bank', done: true, date: 'Mar 1' },
      { label: 'Code main loop', done: true, date: 'Mar 5' },
      { label: 'Add scoring system', done: false, date: 'Mar 12' },
      { label: 'User interface polish', done: false, date: 'Mar 18' },
      { label: 'Testing & documentation', done: false, date: 'Mar 23' },
    ],
  },
];

/* ── Group work ── */
const groupWorkData = [
  {
    id: 'gw1', name: 'Street Play Script — Social Awareness', subject: 'English', teacher: 'Mrs. Priya Sharma',
    dueDate: 'Mar 22', members: [
      { name: 'Aarav Mehta (Me)', role: 'Lead Writer' },
      { name: 'Ishita Patel', role: 'Director' },
      { name: 'Rohan Gupta', role: 'Script Editor' },
      { name: 'Sneha Reddy', role: 'Props Manager' },
    ],
    progress: 45,
  },
  {
    id: 'gw2', name: 'Python Quiz App', subject: 'Computer Science', teacher: 'Ms. Deepa Nair',
    dueDate: 'Mar 25', members: [
      { name: 'Aarav Mehta (Me)', role: 'Backend Logic' },
      { name: 'Kavya Joshi', role: 'Question Bank' },
    ],
    progress: 40,
  },
  {
    id: 'gw3', name: 'History Timeline Poster — Mughal Empire', subject: 'Social Studies', teacher: 'Mr. Vikram Singh',
    dueDate: 'Mar 18', members: [
      { name: 'Aarav Mehta (Me)', role: 'Research & Dates' },
      { name: 'Arjun Nair', role: 'Illustration' },
      { name: 'Diya Sharma', role: 'Layout & Design' },
      { name: 'Tanvi Kapoor', role: 'Fact Checking' },
    ],
    progress: 70,
  },
];

/* ── Allowed upload types ── */
const allowedTypes = ['PDF', 'DOC', 'DOCX', 'JPG', 'PNG', 'PPTX', 'PY', 'TXT'];

export function StudentConciergeAssignments() {
  const { activeSubNav } = useNavigationStore();

  /* ── Pending (default) ── */
  if (!activeSubNav || activeSubNav === 'c_pending') {
    const list = (
      <div className="space-y-2">
        <span className="text-xs font-semibold text-foreground">Pending Assignments</span>
        {pendingAssignments.map((a) => (
          <div key={a.id} className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-1">
              <h5 className="text-xs font-medium text-foreground">{a.name}</h5>
              <span className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                a.type === 'essay' ? 'bg-purple-500/10 text-purple-600'
                  : a.type === 'worksheet' ? 'bg-blue-500/10 text-blue-600'
                  : a.type === 'project' ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-emerald-500/10 text-emerald-600',
              )}>{a.type}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-1">
              <span>{a.subject}</span>
              <span>{a.teacher}</span>
              <span>Due: {a.dueDate}</span>
            </div>
            <p className="text-[10px] text-foreground/70">{a.description}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Max Marks: {a.maxMarks}</span>
              <button className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/90">
                <Upload className="h-2.5 w-2.5" /> Submit
              </button>
            </div>
          </div>
        ))}
      </div>
    );

    const summary = (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Assignment Overview</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Pending', value: pendingAssignments.length, color: 'text-amber-600' },
            { label: 'Submitted', value: submittedAssignments.length, color: 'text-blue-600' },
            { label: 'Graded', value: gradedAssignments.length, color: 'text-emerald-600' },
            { label: 'This Week', value: 3, color: 'text-primary' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/20 bg-white/60 p-3 text-center shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
              <p className={cn('text-lg font-bold', item.color)}>{item.value}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
        <ConciergePermissionBadge granted label="Student submission active" />
      </div>
    );

    return <ConciergeSplitPreviewPanel left={list} right={summary} leftLabel="Pending" rightLabel="Overview" />;
  }

  /* ── Submitted ── */
  if (activeSubNav === 'c_submitted') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Submitted Assignments</h3>
        <div className="space-y-2">
          {submittedAssignments.map((a) => (
            <div key={a.id} className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{a.name}</h5>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium',
                  a.status === 'Reviewed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600',
                )}>{a.status}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-1">
                <span>{a.subject}</span>
                <span>{a.teacher}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><CheckCircle className="h-2.5 w-2.5 text-emerald-500" /> Submitted: {a.submittedAt}</span>
                <span className="inline-flex items-center gap-1"><FileText className="h-2.5 w-2.5" /> {a.fileType} · {a.fileSize}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Graded ── */
  if (activeSubNav === 'c_graded') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Graded Assignments</h3>
        <div className="space-y-2">
          {gradedAssignments.map((a) => (
            <div key={a.id} className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{a.name}</h5>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{a.score}/{a.maxMarks}</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">{a.grade}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                <span>{a.subject}</span>
                <span>{a.teacher}</span>
              </div>
              <div className="mb-2 rounded-lg border border-border/20 bg-muted/20 p-2">
                <p className="text-[10px] text-foreground/80">{a.feedback}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground">Rubric Breakdown</span>
                {a.rubric.map((r) => (
                  <div key={r.criterion} className="flex items-center justify-between text-[10px]">
                    <span className="text-foreground/70">{r.criterion}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-16 rounded-full bg-muted/50 overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(r.marks / r.total) * 100}%` }} />
                      </div>
                      <span className="font-medium text-foreground">{r.marks}/{r.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Projects ── */
  if (activeSubNav === 'c_projects') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Projects</h3>
        <div className="space-y-2">
          {projectData.map((p) => {
            const done = p.milestones.filter((m) => m.done).length;
            const total = p.milestones.length;
            return (
              <div key={p.id} className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-xs font-medium text-foreground">{p.name}</h5>
                  <span className="text-[10px] text-muted-foreground">Due: {p.dueDate}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                  <span>{p.subject}</span>
                  <span>{p.teacher}</span>
                  <span>Max: {p.maxMarks} marks</span>
                  {p.teamSize > 1 && <span className="inline-flex items-center gap-0.5"><Users className="h-2.5 w-2.5" /> Team of {p.teamSize}</span>}
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium text-foreground">Milestones</span>
                    <span className="text-[10px] font-semibold text-foreground">{done}/{total}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', done === total ? 'bg-emerald-500' : 'bg-primary')} style={{ width: `${(done / total) * 100}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  {p.milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px]">
                      <div className={cn('h-3 w-3 rounded-full border-2 flex items-center justify-center', m.done ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground/30')}>
                        {m.done && <CheckCircle className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <span className={cn('flex-1', m.done ? 'text-muted-foreground line-through' : 'text-foreground')}>{m.label}</span>
                      <span className="text-muted-foreground">{m.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Group Work ── */
  if (activeSubNav === 'c_group_work') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Group Work</h3>
        <div className="space-y-2">
          {groupWorkData.map((g) => (
            <div key={g.id} className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{g.name}</h5>
                <span className="text-[10px] text-muted-foreground">Due: {g.dueDate}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                <span>{g.subject}</span>
                <span>{g.teacher}</span>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-foreground">Progress</span>
                  <span className="text-[10px] font-semibold text-foreground">{g.progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${g.progress}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground">Team Members</span>
                {g.members.map((m, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border/20 bg-background/50 px-2 py-1 text-[10px] dark:border-white/5">
                    <span className={cn('font-medium', m.name.includes('(Me)') ? 'text-primary' : 'text-foreground')}>{m.name}</span>
                    <span className="rounded-full bg-muted/40 px-2 py-0.5 text-muted-foreground">{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Upload ── */
  if (activeSubNav === 'c_upload') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Upload Assignment</h3>
        <p className="text-xs text-muted-foreground">Select an assignment and upload your work</p>

        <div className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
          <label className="text-[10px] font-medium text-foreground">Select Assignment</label>
          <select className="mt-1 w-full rounded-lg border border-border/30 bg-background/70 px-3 py-2 text-xs text-foreground dark:border-white/10">
            {pendingAssignments.map((a) => (
              <option key={a.id} value={a.id}>{a.name} — {a.subject} (Due: {a.dueDate})</option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center backdrop-blur-xl">
          <Upload className="mx-auto h-8 w-8 text-primary/50 mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Drag & drop your file here</p>
          <p className="text-[10px] text-muted-foreground mb-3">or click to browse from your device</p>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Upload className="h-3.5 w-3.5" /> Choose File
          </button>
        </div>

        <div className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
          <span className="text-[10px] font-medium text-foreground">Accepted File Types</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {allowedTypes.map((t) => (
              <span key={t} className="rounded-lg border border-border/20 bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">.{t.toLowerCase()}</span>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            <span>Maximum file size: 10 MB</span>
          </div>
        </div>

        <button className="w-full rounded-xl bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
          Submit Assignment
        </button>
      </div>
    );
  }

  return null;
}
