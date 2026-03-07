/* ─── AttendanceSection ─── Full attendance workspace ─────────────────
 * Daily history, subject-level breakdown, visual timeline, summary
 * ─────────────────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react';
import {
  CalendarCheck, Clock, AlertTriangle, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { type AttendanceRecord } from '@/store/student-data.store';
import { useStudentData } from '@/hooks/use-student-data';
import { EmptyState } from '@/components/features/EmptyState';

type AttendanceView = 'timeline' | 'by_subject' | 'calendar' | 'summary';

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  present: { icon: CheckCircle2, color: '#34d399', bg: 'bg-emerald-500/10', label: 'Present' },
  absent: { icon: XCircle, color: '#f43f5e', bg: 'bg-red-500/10', label: 'Absent' },
  late: { icon: Clock, color: '#f97316', bg: 'bg-orange-500/10', label: 'Late' },
  excused: { icon: AlertTriangle, color: '#818cf8', bg: 'bg-indigo-500/10', label: 'Excused' },
};

export function AttendanceSection() {
  const store = useStudentData();
  const [view, setView] = useState<AttendanceView>('timeline');

  // Overall stats
  const stats = useMemo(() => {
    const total = store.attendance.length;
    const present = store.attendance.filter(a => a.status === 'present').length;
    const absent = store.attendance.filter(a => a.status === 'absent').length;
    const late = store.attendance.filter(a => a.status === 'late').length;
    const excused = store.attendance.filter(a => a.status === 'excused').length;
    const rate = total > 0 ? Math.round((present / total) * 1000) / 10 : 0;
    return { total, present, absent, late, excused, rate };
  }, [store.attendance]);

  const tabs: { id: AttendanceView; label: string }[] = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'by_subject', label: 'By Subject' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'summary', label: 'Summary' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white/90">Attendance</h2>
        <p className="text-sm text-white/40">Attendance rate {stats.rate}% · {stats.present}/{stats.total} days present</p>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MiniStat icon={CalendarCheck} label="Total Days" value={stats.total} color="#818cf8" />
        <MiniStat icon={CheckCircle2} label="Present" value={stats.present} color="#34d399" />
        <MiniStat icon={XCircle} label="Absent" value={stats.absent} color="#f43f5e" />
        <MiniStat icon={Clock} label="Late" value={stats.late} color="#f97316" />
        <MiniStat icon={AlertTriangle} label="Excused" value={stats.excused} color="#818cf8" />
      </div>

      {/* Overall rate */}
      <Card className="border-white/8 bg-white/[0.02]">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">Overall Attendance Rate</span>
            <span className={cn('text-lg font-bold', stats.rate >= 90 ? 'text-emerald-400' : stats.rate >= 75 ? 'text-amber-400' : 'text-red-400')}>
              {stats.rate}%
            </span>
          </div>
          <Progress value={stats.rate} className="h-2 bg-white/5" />
          {stats.rate < 85 && (
            <p className="text-[10px] text-amber-400/70 mt-2 flex items-center gap-1">
              <AlertTriangle className="size-3" /> Your attendance is below the recommended 85%. Please contact your class teacher.
            </p>
          )}
        </CardContent>
      </Card>

      {/* View tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map(t => (
          <Button key={t.id} size="sm" variant="ghost"
            onClick={() => setView(t.id)}
            className={cn('text-xs', view === t.id ? 'text-white bg-white/8' : 'text-white/40')}>
            {t.label}
          </Button>
        ))}
      </div>

      {view === 'timeline' && <TimelineView />}
      {view === 'by_subject' && <BySubjectView />}
      {view === 'calendar' && <CalendarView />}
      {view === 'summary' && <SummaryView stats={stats} />}
    </div>
  );
}

/* ── Timeline ── */
function TimelineView() {
  const store = useStudentData();
  const grouped = useMemo(() => {
    const sorted = [...store.attendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const groups: Record<string, AttendanceRecord[]> = {};
    sorted.forEach(r => {
      const key = new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      (groups[key] ??= []).push(r);
    });
    return Object.entries(groups);
  }, [store.attendance]);

  if (grouped.length === 0) return <EmptyState title="No attendance records" description="Attendance history will appear once classes begin." />;

  return (
    <ScrollArea className="h-[540px]">
      <div className="space-y-6 pr-2">
        {grouped.map(([month, records]) => (
          <div key={month}>
            <p className="text-xs font-semibold text-white/40 mb-3">{month}</p>
            <div className="space-y-1.5">
              {records.map(r => {
                const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.present;
                const Icon = cfg.icon;
                const subj = r.subjectId ? store.getSubject(r.subjectId) : undefined;
                return (
                  <div key={r.id} className="flex items-center gap-3 py-2 px-3 rounded-lg border border-white/5 bg-white/[0.01]">
                    <div className={cn('flex items-center justify-center size-7 rounded-lg', cfg.bg)}>
                      <Icon className="size-3.5" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/70">{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        {subj && (
                          <Badge variant="outline" className="text-[8px] border-white/10 text-white/35">
                            <span className="size-1.5 rounded-full mr-1 inline-block" style={{ backgroundColor: subj.color }} />
                            {subj.name}
                          </Badge>
                        )}
                      </div>
                      {r.remark && <p className="text-[10px] text-white/30 truncate">{r.remark}</p>}
                    </div>
                    <Badge variant="outline" className={cn('text-[8px]', `text-[${cfg.color}]`)}
                      style={{ color: cfg.color, borderColor: `${cfg.color}30`, backgroundColor: `${cfg.color}08` }}>
                      {cfg.label}
                    </Badge>
                    {r.period && <span className="text-[10px] text-white/25">P{r.period}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

/* ── By Subject ── */
function BySubjectView() {
  const store = useStudentData();

  const subjectAttendance = useMemo(() => {
    return store.subjects.map(s => {
      const records = store.attendance.filter(a => a.subjectId === s.id);
      const present = records.filter(r => r.status === 'present').length;
      const total = records.length;
      const rate = total > 0 ? Math.round((present / total) * 1000) / 10 : 0;
      return { ...s, records, present, total, rate };
    }).filter(s => s.total > 0).sort((a, b) => b.rate - a.rate);
  }, [store]);

  if (subjectAttendance.length === 0) return <EmptyState title="No subject attendance data" description="Attendance per subject will appear here." />;

  return (
    <div className="space-y-3">
      {subjectAttendance.map(s => (
        <Card key={s.id} className="border-white/8 bg-white/[0.02]">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-3 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-sm font-medium text-white/80 flex-1">{s.name}</span>
              <span className={cn('text-sm font-bold', s.rate >= 90 ? 'text-emerald-400' : s.rate >= 75 ? 'text-amber-400' : 'text-red-400')}>{s.rate}%</span>
            </div>
            <Progress value={s.rate} className="h-1.5 mb-2 bg-white/5" />
            <div className="flex gap-4 text-[10px] text-white/35">
              <span>{s.present} present</span>
              <span>{s.records.filter(r => r.status === 'absent').length} absent</span>
              <span>{s.records.filter(r => r.status === 'late').length} late</span>
              <span>{s.records.filter(r => r.status === 'excused').length} excused</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ── Calendar View ── */
function CalendarView() {
  const store = useStudentData();
  const [month, setMonth] = useState(() => new Date());

  const daysInMonth = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const days: { date: Date; records: AttendanceRecord[] }[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const records = store.attendance.filter(a => a.date === dateStr);
      days.push({ date: new Date(d), records });
    }
    return days;
  }, [month, store.attendance]);

  const startDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const nextMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button size="icon" variant="ghost" onClick={prevMonth} className="text-white/40"><ChevronLeft className="size-4" /></Button>
        <span className="text-sm font-semibold text-white/70">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        <Button size="icon" variant="ghost" onClick={nextMonth} className="text-white/40"><ChevronRight className="size-4" /></Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(d => <div key={d} className="text-center text-[10px] text-white/30 py-1">{d}</div>)}
        {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {daysInMonth.map(({ date, records }) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const dominant = records.length > 0 ? getDominantStatus(records) : null;
          const cfg = dominant ? STATUS_CONFIG[dominant] : null;

          return (
            <div key={date.toISOString()} className={cn(
              'flex flex-col items-center justify-center rounded-lg p-1.5 text-xs min-h-[44px]',
              isToday && 'ring-1 ring-indigo-500/30',
              isWeekend && 'opacity-40',
              cfg ? cfg.bg : 'bg-white/[0.01]',
            )}>
              <span className={cn('font-medium', cfg ? `text-white/80` : 'text-white/30')}>{date.getDate()}</span>
              {records.length > 0 && cfg && (
                <div className="size-1.5 rounded-full mt-0.5" style={{ backgroundColor: cfg.color }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 justify-center">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 text-[10px] text-white/40">
            <div className="size-2 rounded-full" style={{ backgroundColor: cfg.color }} />
            {cfg.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Summary View ── */
function SummaryView({ stats }: { stats: { total: number; present: number; absent: number; late: number; excused: number; rate: number } }) {
  const items = [
    { label: 'Present', count: stats.present, pct: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0, color: '#34d399' },
    { label: 'Absent', count: stats.absent, pct: stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0, color: '#f43f5e' },
    { label: 'Late', count: stats.late, pct: stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0, color: '#f97316' },
    { label: 'Excused', count: stats.excused, pct: stats.total > 0 ? Math.round((stats.excused / stats.total) * 100) : 0, color: '#818cf8' },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card className="border-white/8 bg-white/[0.02]">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-base text-white/85">Attendance Summary</CardTitle>
          <p className="text-[11px] text-white/40">{stats.total} school days recorded</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map(it => (
            <div key={it.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full" style={{ backgroundColor: it.color }} />
                  <span className="text-sm text-white/60">{it.label}</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: it.color }}>{it.count} <span className="text-[10px] text-white/30">({it.pct}%)</span></span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${it.pct}%`, backgroundColor: it.color }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {stats.rate >= 90 && (
        <Card className="border-emerald-500/10 bg-emerald-500/[0.03] text-center">
          <CardContent className="py-4">
            <p className="text-sm text-emerald-400 mb-1">Excellent Attendance!</p>
            <p className="text-[10px] text-white/40">Maintain your streak to keep your record strong.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ── Helpers ── */
function MiniStat({ icon: Icon, label, value, color }: { icon: typeof CheckCircle2; label: string; value: number; color: string }) {
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

function getDominantStatus(records: AttendanceRecord[]) {
  if (records.some(r => r.status === 'absent')) return 'absent';
  if (records.some(r => r.status === 'late')) return 'late';
  if (records.some(r => r.status === 'excused')) return 'excused';
  return 'present';
}
