/* Teacher Concierge › Grading — Enter Grades, Pending Reviews, Report Cards, Grade Book, Analytics, Templates */
import { useNavigationStore } from '@/store/navigation.store';
import { useState } from 'react';
import { ConciergeSplitPreviewPanel, ConciergeTemplatePicker, ConciergePermissionBadge } from '@/components/concierge/shared';
import { cn } from '@/lib/utils';
import { useTeacherGradebook, useTeacherGradingQueue, useTeacherClasses, useSaveGrades, useTeacherClassPerformance } from '@/hooks/api/use-teacher';
import { notifySuccess } from '@/lib/notify';

/* ── Grade entry data ── */
interface StudentGrade {
  id: string;
  name: string;
  quiz1: number | null;
  quiz2: number | null;
  midterm: number | null;
  assignment: number | null;
  total: number | null;
}

const FALLBACK_GRADES: StudentGrade[] = [
  { id: 'g1', name: 'Ahmed Hassan', quiz1: 85, quiz2: 90, midterm: 78, assignment: 92, total: 86 },
  { id: 'g2', name: 'Sara Mohammed', quiz1: 92, quiz2: 88, midterm: 95, assignment: 90, total: 91 },
  { id: 'g3', name: 'Omar Al-Farsi', quiz1: 65, quiz2: 70, midterm: 58, assignment: 72, total: 66 },
  { id: 'g4', name: 'Noor Ahmed', quiz1: 78, quiz2: 82, midterm: 80, assignment: 85, total: 81 },
  { id: 'g5', name: 'Fatima Khalid', quiz1: 95, quiz2: 93, midterm: 91, assignment: 97, total: 94 },
  { id: 'g6', name: 'Yasmin Said', quiz1: 88, quiz2: 85, midterm: 82, assignment: 88, total: 86 },
  { id: 'g7', name: 'Tariq Ali', quiz1: 72, quiz2: null, midterm: 68, assignment: 75, total: null },
  { id: 'g8', name: 'Layla Ibrahim', quiz1: 90, quiz2: 87, midterm: 88, assignment: 91, total: 89 },
  { id: 'g9', name: 'Hassan Noor', quiz1: 68, quiz2: 72, midterm: 65, assignment: 70, total: 69 },
  { id: 'g10', name: 'Rania Mustafa', quiz1: 81, quiz2: 79, midterm: 83, assignment: 80, total: 81 },
];

/* ── Pending reviews ── */
const FALLBACK_PENDING_REVIEWS = [
  { id: 'pr1', title: 'Unit 5 Quiz — Grade 5A', subject: 'Mathematics', submitted: 28, reviewed: 20, dueDate: 'Today' },
  { id: 'pr2', title: 'Lab Report #3 — Grade 4C', subject: 'Science', submitted: 26, reviewed: 0, dueDate: 'Tomorrow' },
  { id: 'pr3', title: 'Fractions Practice Set 2 — Grade 5B', subject: 'Mathematics', submitted: 30, reviewed: 30, dueDate: 'Jun 10' },
  { id: 'pr4', title: 'Midterm Exam — Grade 6A', subject: 'Mathematics', submitted: 29, reviewed: 15, dueDate: 'Jun 14' },
];

/* ── Report cards ── */
const FALLBACK_REPORT_CARDS = [
  { id: 'rc1', className: 'Grade 5A', subject: 'Mathematics', students: 30, generated: 28, status: 'In Progress' },
  { id: 'rc2', className: 'Grade 5B', subject: 'Mathematics', students: 30, generated: 30, status: 'Complete' },
  { id: 'rc3', className: 'Grade 4C', subject: 'Science', students: 28, generated: 0, status: 'Not Started' },
  { id: 'rc4', className: 'Grade 6A', subject: 'Mathematics', students: 29, generated: 10, status: 'In Progress' },
];

/* ── Grade book cumulative ── */
const FALLBACK_GRADEBOOK_SUMMARY = [
  { className: 'Grade 5A — Mathematics', avg: 82, highest: 97, lowest: 58, passRate: '93%' },
  { className: 'Grade 5B — Mathematics', avg: 85, highest: 98, lowest: 62, passRate: '97%' },
  { className: 'Grade 4C — Science', avg: 78, highest: 95, lowest: 52, passRate: '86%' },
  { className: 'Grade 6A — Mathematics', avg: 80, highest: 96, lowest: 55, passRate: '90%' },
];

/* ── Rubric templates ── */
const FALLBACK_RUBRIC_TEMPLATES = [
  { id: 'rt1', name: 'Mathematics Quiz Rubric', type: 'Quiz', lastUsed: 'Yesterday', fieldCount: 5 },
  { id: 'rt2', name: 'Lab Report Rubric', type: 'Lab', lastUsed: '3 days ago', fieldCount: 6 },
  { id: 'rt3', name: 'Presentation Rubric', type: 'Presentation', lastUsed: '1 week ago', fieldCount: 4 },
  { id: 'rt4', name: 'Essay Rubric', type: 'Written', lastUsed: '2 weeks ago', fieldCount: 5 },
];

export function TeacherConciergeGrading() {
  const { activeSubNav } = useNavigationStore();
  const { data: apiClasses } = useTeacherClasses();
  const defaultClassId = (apiClasses as any)?.[0]?.id ?? null;
  const { data: apiGradebook } = useTeacherGradebook(defaultClassId);
  const { data: apiGradingQueue } = useTeacherGradingQueue();
  const { data: apiPerformance } = useTeacherClassPerformance();
  const saveGrades = useSaveGrades();

  const gradeData = (apiGradebook as unknown as StudentGrade[]) ?? FALLBACK_GRADES;
  const pendingReviews = (apiGradingQueue as any[]) ?? FALLBACK_PENDING_REVIEWS;
  const reportCards = (apiGradebook as any)?.reportCards ?? FALLBACK_REPORT_CARDS;
  const gradeBookSummary = (apiPerformance as any[]) ?? FALLBACK_GRADEBOOK_SUMMARY;
  const rubricTemplates = (apiGradebook as any)?.rubricTemplates ?? FALLBACK_RUBRIC_TEMPLATES;

  const [grades] = useState(gradeData);

  /* ── Enter Grades (default) ── */
  if (!activeSubNav || activeSubNav === 'c_enter_grades') {
    const gradeGrid = (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-foreground">Grade 5A — Mathematics · Unit 5 Quiz</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-border/30 text-left text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">Student</th>
                <th className="pb-2 px-2 font-medium text-center">Q1</th>
                <th className="pb-2 px-2 font-medium text-center">Q2</th>
                <th className="pb-2 px-2 font-medium text-center">Mid</th>
                <th className="pb-2 px-2 font-medium text-center">Assign</th>
                <th className="pb-2 pl-2 font-medium text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((s) => (
                <tr key={s.id} className="border-b border-border/10">
                  <td className="py-1.5 pr-3 font-medium text-foreground text-xs">{s.name}</td>
                  {(['quiz1', 'quiz2', 'midterm', 'assignment'] as const).map((col) => (
                    <td key={col} className="py-1.5 px-2 text-center">
                      <span className={cn(
                        'inline-block min-w-[28px] rounded-md px-1.5 py-0.5',
                        s[col] === null ? 'bg-amber-500/10 text-amber-600'
                          : (s[col] ?? 0) >= 80 ? 'text-emerald-600'
                          : (s[col] ?? 0) >= 60 ? 'text-foreground'
                          : 'text-red-600 font-semibold',
                      )}>
                        {s[col] ?? '—'}
                      </span>
                    </td>
                  ))}
                  <td className="py-1.5 pl-2 text-center">
                    <span className={cn(
                      'inline-block min-w-[28px] rounded-md px-1.5 py-0.5 font-semibold',
                      s.total === null ? 'bg-amber-500/10 text-amber-600'
                        : s.total >= 80 ? 'text-emerald-600'
                        : s.total >= 60 ? 'text-foreground'
                        : 'text-red-600',
                    )}>
                      {s.total ?? '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );

    const summary = (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Grade Summary</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Class Average', value: `${Math.round(grades.filter((g) => g.total !== null).reduce((a, b) => a + (b.total ?? 0), 0) / grades.filter((g) => g.total !== null).length)}%`, color: 'text-primary' },
            { label: 'Highest', value: `${Math.max(...grades.filter((g) => g.total !== null).map((g) => g.total ?? 0))}%`, color: 'text-emerald-600' },
            { label: 'Lowest', value: `${Math.min(...grades.filter((g) => g.total !== null).map((g) => g.total ?? 0))}%`, color: 'text-red-600' },
            { label: 'Pending', value: `${grades.filter((g) => g.total === null).length} students`, color: 'text-amber-600' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border/30 bg-background/70 p-3 text-center dark:border-white/5">
              <p className={cn('text-lg font-bold', item.color)}>{item.value}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
        <ConciergePermissionBadge granted label="Grade entry active" />
        <button
          className="w-full rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          disabled={saveGrades.isPending}
          onClick={() => {
            if (!defaultClassId) return;
            saveGrades.mutate(
              {
                classId: defaultClassId,
                grades: grades
                  .filter((g) => g.total !== null)
                  .map((g) => ({ studentId: g.id, assignmentId: 'unit5', score: g.total! })),
              },
              { onSuccess: () => notifySuccess('Grades submitted successfully') },
            );
          }}
        >
          {saveGrades.isPending ? 'Submitting…' : 'Submit Grades'}
        </button>
      </div>
    );

    return <ConciergeSplitPreviewPanel left={gradeGrid} right={summary} leftLabel="Grade Entry" rightLabel="Summary" />;
  }

  /* ── Pending Reviews ── */
  if (activeSubNav === 'c_pending_reviews') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Pending Reviews</h3>
        <div className="space-y-2">
          {pendingReviews.map((p) => (
            <div key={p.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{p.title}</h5>
                <span className="text-[10px] text-muted-foreground">Due: {p.dueDate}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                <span>{p.subject}</span>
                <span>{p.reviewed}/{p.submitted} reviewed</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', p.reviewed === p.submitted ? 'bg-emerald-500' : 'bg-primary')}
                  style={{ width: `${(p.reviewed / p.submitted) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Report Cards ── */
  if (activeSubNav === 'c_report_cards') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Report Card Generation</h3>
        <div className="space-y-2">
          {reportCards.map((r: any) => (
            <div key={r.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{r.className} — {r.subject}</h5>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium',
                  r.status === 'Complete' ? 'bg-emerald-500/10 text-emerald-600'
                    : r.status === 'In Progress' ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-zinc-500/10 text-zinc-500',
                )}>
                  {r.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
                <span>{r.generated}/{r.students} generated</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                <div
                  className={cn('h-full rounded-full', r.status === 'Complete' ? 'bg-emerald-500' : 'bg-primary')}
                  style={{ width: `${(r.generated / r.students) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Grade Book ── */
  if (activeSubNav === 'c_grade_book') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Grade Book — Cumulative View</h3>
        <div className="space-y-2">
          {gradeBookSummary.map((g) => (
            <div key={g.className} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <h5 className="text-xs font-medium text-foreground mb-2">{g.className}</h5>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="text-muted-foreground">Average: <b className="text-foreground">{g.avg}%</b></span>
                <span className="text-emerald-600">Highest: <b>{g.highest}%</b></span>
                <span className="text-red-500">Lowest: <b>{g.lowest}%</b></span>
                <span className="text-blue-500">Pass Rate: <b>{g.passRate}</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Analytics ── */
  if (activeSubNav === 'c_analytics') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Grade Analytics</h3>
        <div className="grid grid-cols-2 gap-3">
          {gradeBookSummary.map((g) => (
            <div key={g.className} className="rounded-xl border border-border/30 bg-background/70 p-4 dark:border-white/5">
              <h5 className="text-xs font-semibold text-foreground mb-3">{g.className}</h5>
              <div className="flex items-end gap-1 h-16">
                {[
                  { range: '90-100', pct: 25, color: 'bg-emerald-500' },
                  { range: '80-89', pct: 35, color: 'bg-blue-500' },
                  { range: '70-79', pct: 20, color: 'bg-amber-500' },
                  { range: '60-69', pct: 12, color: 'bg-orange-500' },
                  { range: '<60', pct: 8, color: 'bg-red-500' },
                ].map((bar) => (
                  <div key={bar.range} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className={cn('w-full rounded-t-sm', bar.color)} style={{ height: `${bar.pct * 0.6}px` }} />
                    <span className="text-[8px] text-muted-foreground">{bar.range}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Avg: {g.avg}%</span>
                <span>Pass: {g.passRate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Templates ── */
  if (activeSubNav === 'c_grading_templates') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Rubric Templates</h3>
        <ConciergeTemplatePicker templates={rubricTemplates} />
      </div>
    );
  }

  return null;
}
