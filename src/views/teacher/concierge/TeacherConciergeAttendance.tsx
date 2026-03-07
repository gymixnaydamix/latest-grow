/* Teacher Concierge › Attendance — Mark Today, Corrections, Absent Follow-up, Reports, Patterns, Settings */
import { useNavigationStore } from '@/store/navigation.store';
import { useState } from 'react';
import { ConciergeSplitPreviewPanel, ConciergePermissionBadge } from '@/components/concierge/shared';
import { Clock, AlertTriangle, TrendingDown, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTeacherAttendance, useTeacherAttendanceHistory, useTeacherClasses, useSubmitAttendance } from '@/hooks/api/use-teacher';
import { useAuthStore } from '@/store/auth.store';
import { notifySuccess } from '@/lib/notify';

/* ── Student roster for attendance ── */
interface StudentRow {
  id: string;
  name: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  note?: string;
}

const FALLBACK_STUDENTS: StudentRow[] = [
  { id: 'stu1', name: 'Ahmed Hassan', status: 'present' },
  { id: 'stu2', name: 'Sara Mohammed', status: 'present' },
  { id: 'stu3', name: 'Omar Al-Farsi', status: 'absent', note: 'No notification from parent' },
  { id: 'stu4', name: 'Noor Ahmed', status: 'present' },
  { id: 'stu5', name: 'Fatima Khalid', status: 'late', note: 'Arrived 8:15' },
  { id: 'stu6', name: 'Yasmin Said', status: 'present' },
  { id: 'stu7', name: 'Tariq Ali', status: 'excused', note: 'Medical appointment' },
  { id: 'stu8', name: 'Layla Ibrahim', status: 'present' },
  { id: 'stu9', name: 'Hassan Noor', status: 'present' },
  { id: 'stu10', name: 'Rania Mustafa', status: 'present' },
  { id: 'stu11', name: 'Khalid Yousef', status: 'absent', note: 'Parent called — sick' },
  { id: 'stu12', name: 'Amina Saleh', status: 'present' },
];

/* ── Pending corrections ── */
const FALLBACK_CORRECTIONS = [
  { id: 'cor1', student: 'Noor Ahmed', date: 'Jun 10', from: 'Absent', to: 'Present', reason: 'Teacher marking error', status: 'Pending admin approval' },
  { id: 'cor2', student: 'Fatima Khalid', date: 'Jun 9', from: 'Absent', to: 'Late', reason: 'Was late, not absent', status: 'Pending admin approval' },
];

/* ── Absent follow-up notifications ── */
const FALLBACK_ABSENT_FOLLOWUPS = [
  { id: 'af1', student: 'Omar Al-Farsi', parent: 'Mrs. Sara Al-Farsi', days: 3, lastContact: 'Jun 10', autoSent: true, response: 'No response' },
  { id: 'af2', student: 'Khalid Yousef', parent: 'Mr. Hasan Yousef', days: 1, lastContact: 'Today', autoSent: true, response: 'Called — son is sick, returning Monday' },
  { id: 'af3', student: 'Amira Bakr', parent: 'Mrs. Layla Bakr', days: 5, lastContact: 'Jun 7', autoSent: true, response: 'No response — escalated to admin' },
];

/* ── Attendance reports ── */
const FALLBACK_REPORTS = [
  { id: 'rpt1', className: 'Grade 5A — Mathematics', present: 26, absent: 2, late: 1, excused: 1, rate: '87%' },
  { id: 'rpt2', className: 'Grade 5B — Mathematics', present: 28, absent: 1, late: 0, excused: 0, rate: '97%' },
  { id: 'rpt3', className: 'Grade 4C — Science', present: 24, absent: 3, late: 2, excused: 1, rate: '80%' },
  { id: 'rpt4', className: 'Grade 6A — Mathematics', present: 29, absent: 0, late: 1, excused: 0, rate: '97%' },
];

/* ── Pattern flags ── */
const FALLBACK_PATTERNS = [
  { id: 'pat1', student: 'Omar Al-Farsi', class: 'Grade 5A', absences: 8, rate: '73%', trend: 'declining', flag: 'Below 75% threshold' },
  { id: 'pat2', student: 'Amira Bakr', class: 'Grade 5A', absences: 12, rate: '60%', trend: 'declining', flag: 'Chronic absenteeism — admin notified' },
  { id: 'pat3', student: 'Tariq Ali', class: 'Grade 5A', absences: 6, rate: '80%', trend: 'stable', flag: 'Medical exemptions — under review' },
];

const statusColors: Record<string, string> = {
  present: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  absent: 'bg-red-500/10 text-red-600 border-red-500/20',
  late: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  excused: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

export function TeacherConciergeAttendance() {
  const { activeSubNav } = useNavigationStore();
  useAuthStore((s) => s.schoolId);
  const { data: apiClasses } = useTeacherClasses();
  const defaultClassId = (apiClasses as any)?.[0]?.id ?? null;
  const { data: apiAttendance } = useTeacherAttendance(defaultClassId);
  const { data: apiHistory } = useTeacherAttendanceHistory();
  const submitAttendance = useSubmitAttendance();

  const classStudents = (apiAttendance as unknown as StudentRow[]) ?? FALLBACK_STUDENTS;
  const corrections = (apiHistory as any)?.corrections ?? FALLBACK_CORRECTIONS;
  const absentFollowUps = (apiHistory as any)?.absentFollowUps ?? FALLBACK_ABSENT_FOLLOWUPS;
  const classReports = (apiHistory as any)?.reports ?? FALLBACK_REPORTS;
  const patterns = (apiHistory as any)?.patterns ?? FALLBACK_PATTERNS;

  const [roster, setRoster] = useState(classStudents);

  const toggleStatus = (id: string, newStatus: StudentRow['status']) => {
    setRoster((prev) => prev.map((s) => s.id === id ? { ...s, status: newStatus } : s));
  };

  /* ── Mark Today (default) ── */
  if (!activeSubNav || activeSubNav === 'c_mark_today') {
    const classList = (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-foreground">Grade 5A — Mathematics</span>
          <span className="text-[10px] text-muted-foreground">
            {roster.filter((s) => s.status === 'present').length}/{roster.length} present
          </span>
        </div>
        {roster.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 px-3 py-2 dark:border-white/5">
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-foreground">{s.name}</span>
              {s.note && <p className="text-[10px] text-muted-foreground truncate">{s.note}</p>}
            </div>
            <div className="flex items-center gap-1">
              {(['present', 'absent', 'late', 'excused'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => toggleStatus(s.id, st)}
                  className={cn(
                    'rounded-lg border px-2 py-0.5 text-[10px] font-medium capitalize transition',
                    s.status === st ? statusColors[st] : 'border-border/20 text-muted-foreground hover:bg-muted/40',
                  )}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );

    const summary = (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Attendance Summary</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Present', count: roster.filter((s) => s.status === 'present').length, color: 'text-emerald-600' },
            { label: 'Absent', count: roster.filter((s) => s.status === 'absent').length, color: 'text-red-600' },
            { label: 'Late', count: roster.filter((s) => s.status === 'late').length, color: 'text-amber-600' },
            { label: 'Excused', count: roster.filter((s) => s.status === 'excused').length, color: 'text-blue-600' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border/30 bg-background/70 p-3 text-center dark:border-white/5">
              <p className={cn('text-lg font-bold', item.color)}>{item.count}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
        <ConciergePermissionBadge granted label="Attendance marking active" />
        <button
          className="w-full rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          disabled={submitAttendance.isPending}
          onClick={() => {
            if (!defaultClassId) return;
            submitAttendance.mutate(
              {
                classId: defaultClassId,
                date: new Date().toISOString().slice(0, 10),
                records: roster.map((s) => ({ studentId: s.id, status: s.status })),
              },
              { onSuccess: () => notifySuccess('Attendance submitted') },
            );
          }}
        >
          {submitAttendance.isPending ? 'Submitting…' : 'Submit Attendance'}
        </button>
      </div>
    );

    return <ConciergeSplitPreviewPanel left={classList} right={summary} leftLabel="Class Roster" rightLabel="Summary" />;
  }

  /* ── Corrections ── */
  if (activeSubNav === 'c_corrections') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Pending Corrections</h3>
        <div className="space-y-2">
          {corrections.map((c: any) => (
            <div key={c.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{c.student}</h5>
                <span className="text-[10px] text-muted-foreground">{c.date}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-1">
                {c.from} → {c.to} · {c.reason}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                <Clock className="h-2.5 w-2.5" />{c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Absent Follow-up ── */
  if (activeSubNav === 'c_absent_followup') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Absent Follow-up</h3>
        <p className="text-xs text-muted-foreground">Auto-generated parent notifications for absences</p>
        <div className="space-y-2">
          {absentFollowUps.map((f: any) => (
            <div key={f.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{f.student}</h5>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium',
                  f.response === 'No response' ? 'bg-red-500/10 text-red-600'
                    : f.response.startsWith('No response') ? 'bg-red-500/10 text-red-600'
                    : 'bg-emerald-500/10 text-emerald-600',
                )}>
                  {f.days} day{f.days > 1 ? 's' : ''} absent
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
                <span>Parent: {f.parent}</span>
                <span>Last contact: {f.lastContact}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground italic">{f.response}</p>
                <div className="flex items-center gap-1">
                  {f.autoSent && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-500">
                      <Send className="h-2.5 w-2.5" />Auto-sent
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Reports ── */
  if (activeSubNav === 'c_reports') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Attendance Reports by Class</h3>
        <div className="space-y-2">
          {classReports.map((r: any) => (
            <div key={r.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-medium text-foreground">{r.className}</h5>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold',
                  parseInt(r.rate) >= 90 ? 'bg-emerald-500/10 text-emerald-600'
                    : parseInt(r.rate) >= 80 ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-red-500/10 text-red-600',
                )}>
                  {r.rate}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="text-emerald-600">Present: <b>{r.present}</b></span>
                <span className="text-red-500">Absent: <b>{r.absent}</b></span>
                <span className="text-amber-500">Late: <b>{r.late}</b></span>
                <span className="text-blue-500">Excused: <b>{r.excused}</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Patterns ── */
  if (activeSubNav === 'c_patterns') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Attendance Patterns — Flagged Students</h3>
        <div className="space-y-2">
          {patterns.map((p: any) => (
            <div key={p.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{p.student}</h5>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold',
                  parseInt(p.rate) < 75 ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600',
                )}>
                  {p.rate} attendance
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
                <span>{p.class}</span>
                <span>{p.absences} absences this term</span>
                <span className="inline-flex items-center gap-0.5">
                  <TrendingDown className="h-2.5 w-2.5" />{p.trend}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] text-amber-600 font-medium">{p.flag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Settings ── */
  if (activeSubNav === 'c_attendance_settings') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Attendance Settings</h3>
        <div className="space-y-2">
          {[
            { label: 'Auto-notify parent on absence', enabled: true },
            { label: 'Allow late marking up to 15 min', enabled: true },
            { label: 'Require note for excused absence', enabled: false },
            { label: 'Flag students below 75% attendance', enabled: true },
            { label: 'Send weekly attendance digest to parents', enabled: false },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <span className="text-xs font-medium text-foreground">{s.label}</span>
              <div className={cn('h-5 w-9 rounded-full relative transition', s.enabled ? 'bg-primary/80' : 'bg-muted')}>
                <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition', s.enabled ? 'right-0.5' : 'left-0.5')} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
