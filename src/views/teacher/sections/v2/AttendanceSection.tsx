/* ─── Attendance Module — Fast attendance system ─────────────────── 
 * Speed-optimized: large tap targets, keyboard shortcuts, swipe gestures.
 * Take attendance per class, view history, generate reports.
 * ──────────────────────────────────────────────────────────────────── */
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  CheckCircle2, AlertTriangle, ChevronRight,
  Search, Keyboard,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useCourses, useCourseAttendance } from '@/hooks/api';
import { useSubmitAttendance, useTeacherAttendanceHistory, useTeacherAttendance } from '@/hooks/api/use-teacher';
import { notifySuccess } from '@/lib/notify';
import { useNavigationStore } from '@/store/navigation.store';
import type { Course, AttendanceRecord } from '@root/types';
import { TeacherSectionShell, GlassCard, MetricCard, StatusBadge } from './shared';
import type { TeacherSectionProps } from './shared';
import { teacherClassesDemo as FALLBACK_teacherClassesDemo, attendanceStudentsDemo as FALLBACK_attendanceStudentsDemo } from './teacher-demo-data';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export function AttendanceSection({ schoolId, teacherId }: TeacherSectionProps) {
  const { activeHeader } = useNavigationStore();

  switch (activeHeader) {
    case 'take_attendance':
      return <TakeAttendanceView schoolId={schoolId} teacherId={teacherId} />;
    case 'attendance_history':
      return <AttendanceHistoryView schoolId={schoolId} teacherId={teacherId} />;
    case 'attendance_reports':
      return <AttendanceReportsView schoolId={schoolId} teacherId={teacherId} />;
    default:
      return <TakeAttendanceView schoolId={schoolId} teacherId={teacherId} />;
  }
}

/* ─── Take Attendance — the main interaction ─────────────────── */
function TakeAttendanceView({ schoolId, teacherId }: TeacherSectionProps) {
  const { data: coursesRes } = useCourses(schoolId);
  const courses: Course[] = coursesRes ?? [];
  const teacherCourses = teacherId ? courses.filter(c => c.teacherId === teacherId) : courses;

  const [selectedClassIdx, setSelectedClassIdx] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const submitAttendanceMut = useSubmitAttendance();

  // Use real courses if available, otherwise demo
  const classes = teacherCourses.length > 0
    ? teacherCourses.map((c) => ({ id: c.id, name: c.name, studentCount: c._count?.enrollments ?? 25 }))
    : FALLBACK_teacherClassesDemo.map(c => ({ id: c.id, name: c.name, studentCount: c.studentCount }));
  
  const selectedClass = classes[selectedClassIdx] ?? classes[0];

  // Students from API with demo fallback
  const { data: apiAttendanceData } = useTeacherAttendance(selectedClass?.id ?? null);
  const apiStudents = (apiAttendanceData as any)?.data as typeof FALLBACK_attendanceStudentsDemo | undefined;

  const students = useMemo(() => {
    const list = apiStudents?.length ? apiStudents : FALLBACK_attendanceStudentsDemo;
    if (searchTerm) {
      return list.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return list;
  }, [searchTerm, apiStudents]);

  const setStatus = useCallback((studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  }, []);

  const markAll = useCallback((status: AttendanceStatus) => {
    const map: Record<string, AttendanceStatus> = {};
    students.forEach(s => { map[s.id] = status; });
    setAttendanceMap(map);
  }, [students]);

  // Keyboard shortcuts: P=present, A=absent, L=late, E=excused, ↑↓=navigate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const student = students[focusedIdx];
      if (!student) return;
      switch (e.key.toLowerCase()) {
        case 'p': setStatus(student.id, 'PRESENT'); setFocusedIdx(i => Math.min(i + 1, students.length - 1)); break;
        case 'a': setStatus(student.id, 'ABSENT'); setFocusedIdx(i => Math.min(i + 1, students.length - 1)); break;
        case 'l': setStatus(student.id, 'LATE'); setFocusedIdx(i => Math.min(i + 1, students.length - 1)); break;
        case 'e': setStatus(student.id, 'EXCUSED'); setFocusedIdx(i => Math.min(i + 1, students.length - 1)); break;
        case 'arrowdown': e.preventDefault(); setFocusedIdx(i => Math.min(i + 1, students.length - 1)); break;
        case 'arrowup': e.preventDefault(); setFocusedIdx(i => Math.max(i - 1, 0)); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focusedIdx, students, setStatus]);

  const markedCount = Object.keys(attendanceMap).length;
  const presentCount = Object.values(attendanceMap).filter(s => s === 'PRESENT').length;
  const totalStudents = students.length;
  const completion = totalStudents > 0 ? Math.round((markedCount / totalStudents) * 100) : 0;

  const statusStyles: Record<AttendanceStatus, { bg: string; border: string; text: string }> = {
    PRESENT: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-400' },
    ABSENT: { bg: 'bg-rose-500/15', border: 'border-rose-500/40', text: 'text-rose-400' },
    LATE: { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-400' },
    EXCUSED: { bg: 'bg-sky-500/15', border: 'border-sky-500/40', text: 'text-sky-400' },
  };

  if (submitted) {
    return (
      <TeacherSectionShell title="Attendance Submitted" description={`${selectedClass?.name} · ${new Date().toLocaleDateString()}`}>
        <GlassCard className="text-center py-12">
          <CheckCircle2 className="size-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground/80 mb-2">Attendance Saved Successfully</h3>
          <p className="text-sm text-muted-foreground mb-1">{presentCount}/{totalStudents} students present ({Math.round((presentCount / totalStudents) * 100)}%)</p>
          <p className="text-xs text-muted-foreground/60 mb-6">Submitted at {new Date().toLocaleTimeString()}</p>
          <Button
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
            onClick={() => { setSubmitted(false); setAttendanceMap({}); setSelectedClassIdx(i => Math.min(i + 1, classes.length - 1)); }}
          >
            Next Class <ChevronRight className="ml-1 size-4" />
          </Button>
        </GlassCard>
      </TeacherSectionShell>
    );
  }

  return (
    <TeacherSectionShell
      title="Take Attendance"
      description={`${selectedClass?.name ?? 'Select class'} · ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`}
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] border-border/70 text-muted-foreground/70">
            <Keyboard className="size-3 mr-1" /> P A L E ↑↓
          </Badge>
        </div>
      }
    >
      {/* Class selector tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1" data-animate>
        {classes.map((cls, i) => (
          <button
            key={cls.id}
            onClick={() => { setSelectedClassIdx(i); setAttendanceMap({}); setFocusedIdx(0); }}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-medium border transition-all ${
              i === selectedClassIdx
                ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-400'
                : 'border-border/50 bg-card/80 text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            {cls.name}
            <span className="ml-2 text-[9px] opacity-60">{cls.studentCount}</span>
          </button>
        ))}
      </div>

      {/* Progress bar + bulk actions */}
      <div className="flex items-center gap-4" data-animate>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{markedCount}/{totalStudents} marked</span>
            <span>{completion}%</span>
          </div>
          <Progress value={completion} className="h-2" />
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Button size="sm" variant="outline" className="text-[10px] h-7 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10" onClick={() => markAll('PRESENT')}>All Present</Button>
          <Button size="sm" variant="outline" className="text-[10px] h-7 border-border/70 text-muted-foreground" onClick={() => setAttendanceMap({})}>Clear</Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative" data-animate>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-border/60 bg-card/80 pl-10 pr-4 py-2.5 text-sm text-foreground/80 placeholder:text-muted-foreground/50 focus:border-indigo-500/30 focus:outline-none"
        />
      </div>

      {/* Student list — large tap targets for speed */}
      <div className="space-y-1" data-animate>
        {students.map((student, i) => {
          const status = attendanceMap[student.id] ?? null;
          const isFocused = i === focusedIdx;
          return (
            <div
              key={student.id}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                isFocused ? 'ring-1 ring-indigo-500/30 border-indigo-500/20 bg-indigo-500/5' : 'border-border/50 bg-card/60'
              }`}
              onClick={() => setFocusedIdx(i)}
            >
              <Avatar className="size-9 border border-border/70 shrink-0">
                <AvatarFallback className={`text-[10px] ${status ? statusStyles[status].bg + ' ' + statusStyles[status].text : 'bg-muted/70 text-muted-foreground'}`}>
                  {student.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground/80">{student.name}</p>
                <p className="text-[10px] text-muted-foreground/60">{student.streak > 0 ? `${student.streak}d streak` : 'No streak'} · {student.overallRate}% rate</p>
              </div>
              {/* Large tap buttons */}
              <div className="flex gap-1">
                {(['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'] as AttendanceStatus[]).map(s => {
                  const active = status === s;
                  const style = statusStyles[s];
                  const labels: Record<AttendanceStatus, string> = { PRESENT: 'P', LATE: 'L', ABSENT: 'A', EXCUSED: 'E' };
                  return (
                    <button
                      key={s}
                      onClick={(e) => { e.stopPropagation(); setStatus(student.id, s); }}
                      className={`size-9 rounded-lg border text-xs font-bold transition-all ${
                        active
                          ? `${style.bg} ${style.border} ${style.text} scale-110`
                          : 'border-border/60 bg-card/80 text-muted-foreground/60 hover:text-muted-foreground hover:border-border'
                      }`}
                    >
                      {labels[s]}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div className="flex justify-end" data-animate>
        <Button
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8"
          disabled={markedCount < totalStudents || submitAttendanceMut.isPending}
          onClick={() => {
            submitAttendanceMut.mutate(
              {
                classId: selectedClass.id,
                date: new Date().toISOString().slice(0, 10),
                records: Object.entries(attendanceMap).map(([studentId, status]) => ({ studentId, status })),
              },
              {
                onSuccess: () => {
                  notifySuccess('Attendance submitted', `${selectedClass.name} — ${presentCount}/${totalStudents} present`);
                  setSubmitted(true);
                },
              },
            );
          }}
        >
          {submitAttendanceMut.isPending ? 'Submitting…' : <>Submit Attendance {markedCount < totalStudents && `(${totalStudents - markedCount} remaining)`}</>}
        </Button>
      </div>
    </TeacherSectionShell>
  );
}

/* ─── Attendance History ──────────────────────────────────────────── */
function AttendanceHistoryView({ schoolId, teacherId }: TeacherSectionProps) {
  const { data: coursesRes } = useCourses(schoolId);
  const { data: apiAttHistory } = useTeacherAttendanceHistory();
  const courses: Course[] = coursesRes ?? [];
  const teacherCourses = teacherId ? courses.filter(c => c.teacherId === teacherId) : courses;
  const [selectedCourseIdx, setSelectedCourseIdx] = useState(0);

  const classes = teacherCourses.length > 0
    ? teacherCourses.map(c => ({ id: c.id, name: c.name }))
    : FALLBACK_teacherClassesDemo.map(c => ({ id: c.id, name: c.name }));

  const selectedClass = classes[selectedCourseIdx];
  const { data: attendanceData } = useCourseAttendance(selectedClass?.id ?? null);
  const records: AttendanceRecord[] = attendanceData ?? [];

  // Group by date
  const byDate = useMemo(() => {
    const map = new Map<string, { present: number; late: number; absent: number; excused: number; total: number }>();
    for (const r of records) {
      const d = new Date(r.date).toLocaleDateString();
      if (!map.has(d)) map.set(d, { present: 0, late: 0, absent: 0, excused: 0, total: 0 });
      const entry = map.get(d)!;
      entry.total++;
      if (r.status === 'PRESENT') entry.present++;
      else if (r.status === 'LATE') entry.late++;
      else if (r.status === 'ABSENT') entry.absent++;
      else if (r.status === 'EXCUSED') entry.excused++;
    }
    return Array.from(map.entries()).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [records]);

  // Attendance history from API or inline fallback
  const historyItems = (apiAttHistory as any)?.data as any[] | undefined;
  const demoHistory = historyItems?.length
    ? historyItems.map((h: any) => ({
        date: h.date ? new Date(h.date).toLocaleDateString() : 'Unknown',
        present: h.present ?? 0,
        late: h.late ?? 0,
        absent: h.absent ?? 0,
        total: h.total ?? 28,
        rate: h.rate ?? Math.round(((h.present ?? 0) / (h.total ?? 28)) * 100),
      }))
    : [
        { date: 'Mar 5, 2026', present: 26, late: 1, absent: 1, total: 28, rate: 96 },
        { date: 'Mar 4, 2026', present: 27, late: 0, absent: 1, total: 28, rate: 96 },
        { date: 'Mar 3, 2026', present: 28, late: 0, absent: 0, total: 28, rate: 100 },
        { date: 'Feb 28, 2026', present: 25, late: 2, absent: 1, total: 28, rate: 96 },
        { date: 'Feb 27, 2026', present: 24, late: 1, absent: 3, total: 28, rate: 89 },
      ];

  return (
    <TeacherSectionShell title="Attendance History" description="Review past attendance records">
      <div className="flex gap-2 overflow-x-auto pb-1" data-animate>
        {classes.map((cls, i) => (
          <button
            key={cls.id}
            onClick={() => setSelectedCourseIdx(i)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-medium border transition-all ${
              i === selectedCourseIdx
                ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-400'
                : 'border-border/50 bg-card/80 text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            {cls.name}
          </button>
        ))}
      </div>

      <GlassCard data-animate>
        <div className="space-y-2">
          {(byDate.length > 0 ? byDate : demoHistory.map(d => [d.date, d] as const)).map(([date, data]) => {
            const d = typeof data === 'object' && 'rate' in data
              ? data
              : { present: (data as { present: number }).present, late: (data as { late: number }).late, absent: (data as { absent: number }).absent, total: (data as { total: number }).total, rate: Math.round(((data as { present: number }).present / (data as { total: number }).total) * 100) };
            return (
              <div key={date as string} className="flex items-center justify-between rounded-xl border border-border/40 bg-card/60 px-4 py-3">
                <span className="text-sm font-medium text-foreground/70 w-32">{date as string}</span>
                <div className="flex gap-4 text-xs">
                  <span className="text-emerald-400">{d.present} present</span>
                  <span className="text-amber-400">{d.late} late</span>
                  <span className="text-rose-400">{d.absent} absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={d.rate} className="w-16 h-1.5" />
                  <span className={`text-xs font-semibold ${d.rate >= 95 ? 'text-emerald-400' : d.rate >= 85 ? 'text-amber-400' : 'text-rose-400'}`}>{d.rate}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </TeacherSectionShell>
  );
}

/* ─── Attendance Reports ──────────────────────────────────────────── */
function AttendanceReportsView(_props: TeacherSectionProps) {
  const { data: apiAttHistory } = useTeacherAttendanceHistory();
  const historyItems = (apiAttHistory as any)?.data as any[] | undefined;

  const reportMetrics = useMemo(() => {
    if (historyItems?.length) {
      const totalRecords = historyItems.reduce((s: number, h: any) => s + (h.total ?? 0), 0);
      const totalPresent = historyItems.reduce((s: number, h: any) => s + (h.present ?? 0), 0);
      const overallRate = totalRecords > 0 ? ((totalPresent / totalRecords) * 100).toFixed(1) : '0';
      const totalAbsent = historyItems.reduce((s: number, h: any) => s + (h.absent ?? 0), 0);
      const totalLate = historyItems.reduce((s: number, h: any) => s + (h.late ?? 0), 0);
      const avgLatePerWeek = historyItems.length > 0 ? (totalLate / Math.max(1, Math.ceil(historyItems.length / 5))).toFixed(1) : '0';
      return [
        { label: 'Overall Rate', value: `${overallRate}%`, accent: '#34d399', trend: 'up' as const },
        { label: 'Total Present', value: String(totalPresent), accent: '#818cf8' },
        { label: 'Total Absent', value: String(totalAbsent), accent: '#f43f5e', trend: 'down' as const },
        { label: 'Avg Late/week', value: avgLatePerWeek, accent: '#fbbf24' },
      ];
    }
    return [
      { label: 'Overall Rate', value: '95.2%', accent: '#34d399', trend: 'up' as const },
      { label: 'Perfect Attendance', value: '14', accent: '#818cf8' },
      { label: 'Chronic Absent', value: '3', accent: '#f43f5e', trend: 'down' as const },
      { label: 'Avg Late/week', value: '2.4', accent: '#fbbf24' },
    ];
  }, [historyItems]);

  const atRisk = [
    { name: 'Tyler Brooks', rate: '78%', absences: 8, className: 'Pre-Algebra' },
    { name: 'Chen Wei', rate: '82%', absences: 6, className: 'Physics Honors' },
    { name: 'Jordan Kim', rate: '85%', absences: 5, className: 'Pre-Algebra' },
  ];

  return (
    <TeacherSectionShell title="Attendance Reports" description="Aggregated attendance analytics">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-animate>
        {reportMetrics.map(m => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      <GlassCard data-animate>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="size-4 text-rose-400" />
          <h3 className="text-sm font-semibold text-foreground/80">At-Risk Students (below 90%)</h3>
        </div>
        <div className="space-y-2">
          {atRisk.map(s => (
            <div key={s.name} className="flex items-center justify-between rounded-xl border border-border/40 bg-card/60 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground/70">{s.name}</p>
                <p className="text-[10px] text-muted-foreground/70">{s.className} · {s.absences} absences</p>
              </div>
              <StatusBadge status={s.rate} tone="bad" />
            </div>
          ))}
        </div>
      </GlassCard>
    </TeacherSectionShell>
  );
}
