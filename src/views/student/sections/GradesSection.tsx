/* ─── GradesSection ─── Grades & feedback workspace ──────────────────
 * Subject-wise grades, rubric breakdowns, teacher feedback, report card
 * ─────────────────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react';
import {
  ArrowLeft, ChevronRight, MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useStudentStore, type FeedbackNote } from '@/store/student-data.store';
import { EmptyState } from '@/components/features/EmptyState';

type GradeView = 'overview' | 'subject' | 'feedback' | 'report_card';

export function GradesSection() {
  const store = useStudentStore();
  const [view, setView] = useState<GradeView>('overview');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Subject-level grade summaries
  const subjectGrades = useMemo(() => {
    return store.subjects.map(s => {
      const grades = store.grades.filter(g => g.subjectId === s.id);
      const scores = grades.filter(g => g.score !== undefined).map(g => (g.score! / g.maxScore) * 100);
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const totalFeedback = store.feedback.filter((f: FeedbackNote) => f.subjectId === s.id).length;
      return {
        ...s,
        grades,
        count: grades.length,
        avg: Math.round(avg * 10) / 10,
        feedbackCount: totalFeedback,
        letterGrade: getLetterGrade(avg),
      };
    }).filter(s => s.count > 0);
  }, [store]);

  // Overall GPA
  const overallAvg = useMemo(() => {
    const all = subjectGrades.filter(s => s.avg > 0);
    if (all.length === 0) return 0;
    return Math.round((all.reduce((a, b) => a + b.avg, 0) / all.length) * 10) / 10;
  }, [subjectGrades]);

  const tabs: { id: GradeView; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'subject', label: 'By Subject' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'report_card', label: 'Report Card' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white/90">Grades & Feedback</h2>
          <p className="text-sm text-white/40">Overall average {overallAvg}% · {getLetterGrade(overallAvg)} · {store.grades.length} graded items</p>
        </div>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-white/6 pb-1">
        {tabs.map(t => (
          <Button key={t.id} size="sm" variant="ghost"
            onClick={() => { setView(t.id); setSelectedSubject(null); }}
            className={cn('text-xs', view === t.id ? 'text-white bg-white/8' : 'text-white/40')}>
            {t.label}
          </Button>
        ))}
      </div>

      {/* Views */}
      {view === 'overview' && <OverviewView subjectGrades={subjectGrades} overallAvg={overallAvg} onSelectSubject={(id: string) => { setSelectedSubject(id); setView('subject'); }} />}
      {view === 'subject' && <SubjectView subjectGrades={subjectGrades} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} />}
      {view === 'feedback' && <FeedbackView />}
      {view === 'report_card' && <ReportCardView subjectGrades={subjectGrades} overallAvg={overallAvg} />}
    </div>
  );
}

/* ── Overview View ── */
function OverviewView({ subjectGrades, overallAvg, onSelectSubject }: {
  subjectGrades: any[];
  overallAvg: number;
  onSelectSubject: (id: string) => void;
}) {
  const store = useStudentStore();

  // Recently graded
  const recent = useMemo(() => {
    return [...store.grades].filter(g => g.score !== undefined).sort((a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime()).slice(0, 6);
  }, [store.grades]);

  return (
    <div className="space-y-5">
      {/* Overall */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Overall Average" value={`${overallAvg}%`} sub={getLetterGrade(overallAvg)} color="#818cf8" />
        <StatCard label="Total Graded" value={store.grades.filter(g => g.score !== undefined).length.toString()} sub="items" color="#34d399" />
        <StatCard label="Highest Subject" value={subjectGrades.length > 0 ? `${Math.max(...subjectGrades.map(s => s.avg))}%` : '-'} sub={subjectGrades.sort((a, b) => b.avg - a.avg)[0]?.name || ''} color="#38bdf8" />
        <StatCard label="Unread Feedback" value={store.feedback.filter((f: FeedbackNote) => !f.read).length.toString()} sub="notes" color="#f97316" />
      </div>

      {/* Subject grid */}
      <div>
        <h3 className="text-sm font-semibold text-white/60 mb-3">By Subject</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {subjectGrades.map(s => (
            <Card key={s.id} className="border-white/8 bg-white/[0.02] cursor-pointer hover:border-white/12 transition-all group"
              onClick={() => onSelectSubject(s.id)}>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-sm font-medium text-white/80 flex-1">{s.name}</span>
                  <span className="text-lg font-bold" style={{ color: s.color }}>{s.avg}%</span>
                </div>
                <Progress value={s.avg} className="h-1.5 mb-2 bg-white/5" />
                <div className="flex items-center justify-between text-[10px] text-white/35">
                  <span>{s.count} graded · {s.feedbackCount} feedback</span>
                  <Badge variant="outline" className={cn('text-[9px]', gradeColor(s.avg))}>{s.letterGrade}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent grades */}
      {recent.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/60 mb-3">Recently Graded</h3>
          <div className="space-y-2">
            {recent.map(g => {
              const subj = store.getSubject(g.subjectId);
              const pct = g.score !== undefined ? Math.round((g.score / g.maxScore) * 100) : 0;
              return (
                <Card key={g.id} className="border-white/8 bg-white/[0.02]">
                  <CardContent className="flex items-center gap-4 py-3 px-4">
                    <div className="size-3 rounded-full flex-shrink-0" style={{ backgroundColor: subj?.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/80 truncate">{g.title}</p>
                      <p className="text-[10px] text-white/35">{subj?.name} · {g.type.replace(/_/g, ' ')} · {new Date(g.gradedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-white/70">{g.score}/{g.maxScore}</span>
                      <p className={cn('text-[10px]', pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400')}>{pct}%</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Subject View ── */
function SubjectView({ subjectGrades, selectedSubject, setSelectedSubject }: {
  subjectGrades: any[];
  selectedSubject: string | null;
  setSelectedSubject: (s: string | null) => void;
}) {
  const store = useStudentStore();
  const subject = selectedSubject ? subjectGrades.find((s: any) => s.id === selectedSubject) : null;

  if (!subject) {
    return (
      <div className="grid gap-2 md:grid-cols-2">
        {subjectGrades.map(s => (
          <Card key={s.id} className="border-white/8 bg-white/[0.02] cursor-pointer hover:border-white/12 transition-all"
            onClick={() => setSelectedSubject(s.id)}>
            <CardContent className="flex items-center gap-4 py-3 px-4">
              <div className="size-3 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="flex-1 text-sm font-medium text-white/80">{s.name}</span>
              <span className="text-sm font-bold" style={{ color: s.color }}>{s.avg}%</span>
              <Badge variant="outline" className={cn('text-[9px]', gradeColor(s.avg))}>{s.letterGrade}</Badge>
              <ChevronRight className="size-4 text-white/15" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const subjectGradesFiltered = store.grades.filter(g => g.subjectId === subject.id)
    .sort((a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime());
  const feedbackList = store.feedback.filter((f: FeedbackNote) => f.subjectId === subject.id);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={() => setSelectedSubject(null)} className="text-white/40"><ArrowLeft className="size-5" /></Button>
        <div className="size-4 rounded-full" style={{ backgroundColor: subject.color }} />
        <div>
          <h3 className="text-base font-bold text-white/90">{subject.name}</h3>
          <p className="text-[11px] text-white/40">Average: {subject.avg}% · {subject.letterGrade} · {subject.count} grades</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {subjectGradesFiltered.map(g => {
          const pct = g.score !== undefined ? Math.round((g.score / g.maxScore) * 100) : null;
          return (
            <Card key={g.id} className="border-white/8 bg-white/[0.02]">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white/80">{g.title}</p>
                    <Badge variant="outline" className="text-[8px] capitalize border-white/10 text-white/40">{g.type.replace(/_/g, ' ')}</Badge>
                  </div>
                  {pct !== null && <span className="text-sm font-bold" style={{ color: pct >= 80 ? '#34d399' : pct >= 60 ? '#fbbf24' : '#f43f5e' }}>{pct}%</span>}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-white/35">
                  <span>{new Date(g.gradedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span>{g.score !== undefined ? `${g.score}/${g.maxScore}` : 'Pending'}</span>
                  {g.weight && <span>Weight: {g.weight}%</span>}
                </div>
                {pct !== null && <Progress value={pct} className="h-1 mt-2 bg-white/5" />}
                {g.rubric && g.rubric.length > 0 && (
                  <div className="mt-3 space-y-1 border-t border-white/5 pt-2">
                    {g.rubric.map((r, i) => (
                      <div key={i} className="flex justify-between text-[10px] text-white/40">
                        <span>{r.criterion}</span>
                        <span className="font-medium text-white/50">{r.earned !== undefined ? `${r.earned}/${r.max}` : `—/${r.max}`}</span>
                      </div>
                    ))}
                  </div>
                )}
                {g.feedback && <p className="text-[10px] text-white/35 italic mt-2">"{g.feedback}"</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Subject feedback */}
      {feedbackList.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white/50 mb-2">Teacher Feedback</h4>
          <div className="space-y-2">
            {feedbackList.map((f: FeedbackNote) => (
              <Card key={f.id} className={cn('border-white/8 bg-white/[0.02]', !f.read && 'border-l-2 border-l-indigo-500/50')}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="size-3 text-indigo-400" />
                    <span className="text-xs font-medium text-white/70">{f.from}</span>
                    <Badge variant="outline" className="text-[8px] capitalize border-white/10 text-white/40">{f.type}</Badge>
                    <span className="text-[10px] text-white/30 ml-auto">{new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <p className="text-sm text-white/50">{f.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Feedback View ── */
function FeedbackView() {
  const store = useStudentStore();
  const notes = useMemo(() => {
    return [...store.feedback].sort((a: FeedbackNote, b: FeedbackNote) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [store.feedback]);

  if (notes.length === 0) {
    return <EmptyState title="No feedback yet" description="Teacher feedback will appear here." />;
  }

  return (
    <div className="space-y-2">
      {notes.map((f: FeedbackNote) => {
        const subj = f.subjectId ? store.getSubject(f.subjectId) : undefined;
        return (
          <Card key={f.id} className={cn(
            'border-white/8 bg-white/[0.02]',
            !f.read && 'border-l-2 border-l-indigo-500/50',
          )}
            onClick={() => { if (!f.read) store.markFeedbackRead(f.id); }}
          >
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="size-2 rounded-full" style={{ backgroundColor: subj?.color }} />
                <span className="text-xs font-medium text-white/70">{f.from}</span>
                <span className="text-[10px] text-white/30">· {subj?.name ?? 'General'}</span>
                <Badge variant="outline" className="text-[8px] capitalize border-white/10 text-white/40">{f.type}</Badge>
                {!f.read && <Badge className="text-[8px] bg-indigo-500/20 text-indigo-400 border-0">New</Badge>}
                <span className="text-[10px] text-white/30 ml-auto">{new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <p className="text-sm text-white/55 leading-relaxed">{f.message}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ── Report Card View ── */
function ReportCardView({ subjectGrades, overallAvg }: { subjectGrades: any[]; overallAvg: number }) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-white/8 bg-white/[0.02]">
        <CardHeader className="text-center pb-3">
          <CardTitle className="text-lg text-white/90">Academic Report Card</CardTitle>
          <p className="text-[11px] text-white/40">2024-2025 Academic Year · Term 2</p>
        </CardHeader>
        <CardContent>
          <div className="border border-white/8 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-5 gap-0 bg-white/5 text-[11px] font-semibold text-white/50 py-2 px-4">
              <span className="col-span-2">Subject</span>
              <span className="text-center">Average</span>
              <span className="text-center">Grade</span>
              <span className="text-center">Items</span>
            </div>
            {/* Rows */}
            {subjectGrades.map(s => (
              <div key={s.id} className="grid grid-cols-5 gap-0 border-t border-white/5 py-2.5 px-4 items-center">
                <div className="col-span-2 flex items-center gap-2">
                  <div className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-sm text-white/70">{s.name}</span>
                </div>
                <span className={cn('text-center text-sm font-semibold', s.avg >= 80 ? 'text-emerald-400' : s.avg >= 60 ? 'text-amber-400' : 'text-red-400')}>{s.avg}%</span>
                <div className="text-center">
                  <Badge variant="outline" className={cn('text-[9px]', gradeColor(s.avg))}>{s.letterGrade}</Badge>
                </div>
                <span className="text-center text-xs text-white/40">{s.count}</span>
              </div>
            ))}
            {/* Footer */}
            <div className="grid grid-cols-5 gap-0 border-t-2 border-white/10 py-3 px-4 items-center bg-white/[0.03]">
              <span className="col-span-2 text-sm font-semibold text-white/70">Overall</span>
              <span className={cn('text-center text-base font-bold', overallAvg >= 80 ? 'text-emerald-400' : overallAvg >= 60 ? 'text-amber-400' : 'text-red-400')}>{overallAvg}%</span>
              <div className="text-center">
                <Badge variant="outline" className={cn('text-[10px]', gradeColor(overallAvg))}>{getLetterGrade(overallAvg)}</Badge>
              </div>
              <span className="text-center text-xs text-white/40">{subjectGrades.reduce((a: number, s: any) => a + s.count, 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Shared helpers ── */
function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <p className="text-[10px] text-white/35 mb-1">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold" style={{ color }}>{value}</span>
        <span className="text-[10px] text-white/30">{sub}</span>
      </div>
    </div>
  );
}

function getLetterGrade(pct: number) {
  if (pct >= 93) return 'A';
  if (pct >= 90) return 'A-';
  if (pct >= 87) return 'B+';
  if (pct >= 83) return 'B';
  if (pct >= 80) return 'B-';
  if (pct >= 77) return 'C+';
  if (pct >= 73) return 'C';
  if (pct >= 70) return 'C-';
  if (pct >= 67) return 'D+';
  if (pct >= 60) return 'D';
  return 'F';
}

function gradeColor(pct: number) {
  if (pct >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (pct >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-red-400 bg-red-500/10 border-red-500/20';
}
