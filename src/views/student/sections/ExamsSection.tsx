/* ---- ExamsSection ---- Exam schedule, venue info, results -----------
 * Upcoming exam timetable, venue/seat info, countdown, completed results
 * --------------------------------------------------------------------- */
import { useState, useMemo } from 'react';
import {
  GraduationCap, Calendar, Clock, MapPin, FileText, ChevronRight,
  AlertTriangle, CheckCircle2, ArrowLeft, Timer,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useStudentStore, type Exam } from '@/store/student-data.store';
import { EmptyState } from '@/components/features/EmptyState';

type ExamView = 'upcoming' | 'completed' | 'timetable';

export function ExamsSection() {
  const store = useStudentStore();
  const [view, setView] = useState<ExamView>('upcoming');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const upcoming = useMemo(() => store.exams.filter(e => e.status === 'upcoming' || e.status === 'in_progress')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [store.exams]);
  const completed = useMemo(() => store.exams.filter(e => e.status === 'completed' || e.status === 'result_published')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [store.exams]);

  const selected = selectedId ? store.exams.find(e => e.id === selectedId) : null;

  if (selected) {
    return <ExamDetail exam={selected} onBack={() => setSelectedId(null)} />;
  }

  const stats = {
    upcoming: upcoming.length,
    completed: completed.length,
    nextExam: upcoming[0] ? daysUntil(upcoming[0].date) : null,
  };

  const tabs: { id: ExamView; label: string; count: number }[] = [
    { id: 'upcoming', label: 'Upcoming', count: stats.upcoming },
    { id: 'completed', label: 'Results', count: stats.completed },
    { id: 'timetable', label: 'Exam Timetable', count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white/90">Exams</h2>
        <p className="text-sm text-white/40">
          {stats.upcoming} upcoming · {stats.completed} completed
          {stats.nextExam !== null && ` · Next exam in ${stats.nextExam} day${stats.nextExam !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat icon={Calendar} label="Upcoming" value={stats.upcoming} color="#f97316" />
        <MiniStat icon={CheckCircle2} label="Completed" value={stats.completed} color="#34d399" />
        <MiniStat icon={Timer} label="Next In" value={stats.nextExam !== null ? `${stats.nextExam}d` : '-'} color="#818cf8" />
        <MiniStat icon={GraduationCap} label="Total" value={store.exams.length} color="#38bdf8" />
      </div>

      {/* View tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map(t => (
          <Button key={t.id} size="sm" variant="ghost"
            onClick={() => setView(t.id)}
            className={cn('text-xs', view === t.id ? 'text-white bg-white/8' : 'text-white/40')}>
            {t.label} {t.count > 0 && <span className="ml-1 text-[10px] opacity-60">({t.count})</span>}
          </Button>
        ))}
      </div>

      {/* Content */}
      {view === 'upcoming' && (
        upcoming.length === 0
          ? <EmptyState title="No upcoming exams" description="You're all caught up! Check back later." />
          : <div className="space-y-3">{upcoming.map(e => <ExamCard key={e.id} exam={e} onClick={() => setSelectedId(e.id)} />)}</div>
      )}

      {view === 'completed' && (
        completed.length === 0
          ? <EmptyState title="No exam results yet" description="Results will appear after exams are graded." />
          : <div className="space-y-3">{completed.map(e => <ExamCard key={e.id} exam={e} onClick={() => setSelectedId(e.id)} />)}</div>
      )}

      {view === 'timetable' && <ExamTimetable exams={[...upcoming, ...completed]} onSelect={setSelectedId} />}
    </div>
  );
}

/* -- Exam Card -- */
function ExamCard({ exam, onClick }: { exam: Exam; onClick: () => void }) {
  const store = useStudentStore();
  const subj = store.getSubject(exam.subjectId);
  const days = daysUntil(exam.date);
  const pct = exam.score !== undefined && exam.maxScore ? Math.round((exam.score / exam.maxScore) * 100) : null;

  return (
    <Card className="border-white/8 bg-white/[0.02] cursor-pointer hover:border-white/12 transition-all group" onClick={onClick}>
      <CardContent className="flex items-center gap-4 py-3 px-4">
        <div className="flex size-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03]" style={{ borderColor: `${subj?.color}30` }}>
          <GraduationCap className="size-4" style={{ color: subj?.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white/80 truncate">{exam.title}</p>
            <ExamTypeBadge type={exam.type} />
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[11px] text-white/35">
            <span className="flex items-center gap-1">
              <div className="size-2 rounded-full" style={{ backgroundColor: subj?.color }} />
              {subj?.name}
            </span>
            <span className="flex items-center gap-1"><Calendar className="size-3" />{new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <span className="flex items-center gap-1"><Clock className="size-3" />{exam.startTime} - {exam.endTime}</span>
            {exam.venue && <span className="flex items-center gap-1"><MapPin className="size-3" />{exam.venue}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {exam.status === 'upcoming' && days >= 0 && (
            <span className={cn('text-xs font-semibold', days <= 3 ? 'text-red-400' : days <= 7 ? 'text-amber-400' : 'text-white/40')}>
              {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
            </span>
          )}
          {pct !== null && (
            <span className={cn('text-sm font-bold', pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400')}>
              {exam.score}/{exam.maxScore}
            </span>
          )}
          <ExamStatusBadge status={exam.status} />
          <ChevronRight className="size-4 text-white/15 group-hover:text-white/30 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}

/* -- Exam Detail -- */
function ExamDetail({ exam, onBack }: { exam: Exam; onBack: () => void }) {
  const store = useStudentStore();
  const subj = store.getSubject(exam.subjectId);
  const teacher = subj ? store.getTeacher(subj.teacherId) : null;
  const days = daysUntil(exam.date);
  const pct = exam.score !== undefined && exam.maxScore ? Math.round((exam.score / exam.maxScore) * 100) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={onBack} className="text-white/40"><ArrowLeft className="size-5" /></Button>
        <div>
          <h2 className="text-lg font-bold text-white/90">{exam.title}</h2>
          <p className="text-[11px] text-white/40">{subj?.name} · {teacher?.name}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Schedule & Location */}
          <Card className="border-white/8 bg-white/[0.02]">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-white/70">Schedule & Location</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <InfoRow icon={Calendar} label="Date" value={new Date(exam.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} />
              <InfoRow icon={Clock} label="Time" value={`${exam.startTime} - ${exam.endTime}`} />
              {exam.venue && <InfoRow icon={MapPin} label="Venue" value={exam.venue} />}
              {exam.seat && <InfoRow icon={FileText} label="Seat" value={exam.seat} />}
            </CardContent>
          </Card>

          {/* Instructions */}
          {exam.instructions && exam.instructions.length > 0 && (
            <Card className="border-amber-500/10 bg-amber-500/[0.02]">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">Instructions</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {exam.instructions.map((inst, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                      <AlertTriangle className="size-3.5 text-amber-400/60 mt-0.5 shrink-0" />
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Result */}
          {pct !== null && (
            <Card className={cn('border-white/8 bg-white/[0.02]', pct >= 80 ? 'border-emerald-500/10' : pct >= 60 ? 'border-amber-500/10' : 'border-red-500/10')}>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-white/70">Result</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <span className={cn('text-3xl font-bold', pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400')}>
                    {exam.score}/{exam.maxScore}
                  </span>
                  <div>
                    <span className={cn('text-xl font-bold', pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400')}>{pct}%</span>
                    {exam.grade && <p className="text-[10px] text-white/35">Grade: {exam.grade}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-white/8 bg-white/[0.02]">
            <CardContent className="pt-5 space-y-3">
              <SideRow label="Status"><ExamStatusBadge status={exam.status} /></SideRow>
              <SideRow label="Type"><ExamTypeBadge type={exam.type} /></SideRow>
              <SideRow label="Max Score"><span className="text-sm font-semibold text-white/70">{exam.maxScore} pts</span></SideRow>
              {exam.status === 'upcoming' && days >= 0 && (
                <SideRow label="Countdown">
                  <span className={cn('text-sm font-bold', days <= 3 ? 'text-red-400' : days <= 7 ? 'text-amber-400' : 'text-emerald-400')}>
                    {days === 0 ? 'Today!' : `${days} day${days !== 1 ? 's' : ''}`}
                  </span>
                </SideRow>
              )}
            </CardContent>
          </Card>

          {/* Countdown card for upcoming */}
          {exam.status === 'upcoming' && days > 0 && (
            <Card className="border-indigo-500/10 bg-indigo-500/[0.03] text-center">
              <CardContent className="py-5">
                <Timer className="size-8 mx-auto text-indigo-400 mb-2" />
                <span className="text-3xl font-bold text-indigo-400">{days}</span>
                <p className="text-xs text-white/40 mt-1">days remaining</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* -- Exam Timetable -- */
function ExamTimetable({ exams, onSelect }: { exams: Exam[]; onSelect: (id: string) => void }) {
  const store = useStudentStore();
  const sorted = useMemo(() => [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [exams]);

  if (sorted.length === 0) return <EmptyState title="No exams scheduled" description="Exam timetable will appear here." />;

  return (
    <Card className="border-white/8 bg-white/[0.02]">
      <CardContent className="p-0">
        <div className="grid grid-cols-6 gap-0 text-[11px] font-semibold text-white/40 py-2 px-4 border-b border-white/5 bg-white/[0.02]">
          <span className="col-span-2">Subject</span>
          <span>Date</span>
          <span>Time</span>
          <span>Venue</span>
          <span>Status</span>
        </div>
        <ScrollArea className="max-h-[400px]">
          {sorted.map(e => {
            const subj = store.getSubject(e.subjectId);
            return (
              <div key={e.id} className="grid grid-cols-6 gap-0 py-2.5 px-4 border-b border-white/5 items-center cursor-pointer hover:bg-white/[0.02]"
                onClick={() => onSelect(e.id)}>
                <div className="col-span-2 flex items-center gap-2">
                  <div className="size-2 rounded-full" style={{ backgroundColor: subj?.color }} />
                  <span className="text-sm text-white/70 truncate">{e.title}</span>
                </div>
                <span className="text-xs text-white/50">{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span className="text-xs text-white/50">{e.startTime}</span>
                <span className="text-xs text-white/40">{e.venue || '-'}</span>
                <ExamStatusBadge status={e.status} />
              </div>
            );
          })}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/* -- Helpers -- */
function MiniStat({ icon: Icon, label, value, color }: { icon: typeof Calendar; label: string; value: number | string; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <div className="flex items-center justify-center size-8 rounded-lg bg-white/[0.03]">
        <Icon className="size-4" style={{ color }} />
      </div>
      <div>
        <p className="text-lg font-bold text-white/85">{value}</p>
        <p className="text-[10px] text-white/35">{label}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="size-4 text-white/30 mt-0.5" />
      <div>
        <p className="text-[10px] text-white/35">{label}</p>
        <p className="text-sm text-white/70">{value}</p>
      </div>
    </div>
  );
}

function SideRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-white/35">{label}</span>
      {children}
    </div>
  );
}

function ExamStatusBadge({ status }: { status: string }) {
  const m: Record<string, string> = {
    upcoming: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    in_progress: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    result_published: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  };
  return <Badge variant="outline" className={cn('text-[9px] capitalize', m[status] ?? m.upcoming)}>{status.replace(/_/g, ' ')}</Badge>;
}

function ExamTypeBadge({ type }: { type: string }) {
  return <Badge variant="outline" className="text-[8px] capitalize border-white/10 text-white/40">{type.replace(/_/g, ' ')}</Badge>;
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
