/* ─── My Classes — Full class management: list, detail, roster, timetable ── */
import { useState } from 'react';
import {
  BookOpen, Users, Clock, TrendingUp, ChevronRight, ArrowLeft,
  ClipboardCheck, FileText, BarChart3, GraduationCap, AlertTriangle,
  Star, Search, Mail, Calendar, Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCourses } from '@/hooks/api';
import { useTeacherClasses, useTeacherClassDetail, useTeacherSchedule } from '@/hooks/api/use-teacher';
import { notifySuccess } from '@/lib/notify';
import { useNavigationStore } from '@/store/navigation.store';
import { cn } from '@/lib/utils';
import type { Course, TeacherClassStudent } from '@root/types';
import { TeacherSectionShell, MetricCard, GlassCard, StatusBadge } from './shared';
import type { TeacherSectionProps } from './shared';
import { teacherClassesDemo as FALLBACK } from './teacher-demo-data';

/* ═══════════════════════════════════════════════════════════════════
   SECTION ROUTER
   ═══════════════════════════════════════════════════════════════════ */

export function MyClassesSection({ schoolId, teacherId }: TeacherSectionProps) {
  const { activeHeader, navigate } = useNavigationStore();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  if (activeHeader === 'class_timetable') {
    return <TimetableView schoolId={schoolId} teacherId={teacherId} />;
  }

  if (activeHeader === 'class_detail' || selectedClassId) {
    return (
      <ClassDetailView
        classId={selectedClassId}
        schoolId={schoolId}
        teacherId={teacherId}
        onBack={() => { setSelectedClassId(null); navigate('my_classes', 'class_list'); }}
        onNavigate={navigate}
      />
    );
  }

  return (
    <ClassListView
      schoolId={schoolId}
      teacherId={teacherId}
      onSelectClass={(id) => { setSelectedClassId(id); navigate('my_classes', 'class_detail'); }}
      onNavigate={navigate}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CLASS LIST VIEW
   ═══════════════════════════════════════════════════════════════════ */

function ClassListView({
  schoolId,
  teacherId,
  onSelectClass,
  onNavigate,
}: TeacherSectionProps & {
  onSelectClass: (id: string) => void;
  onNavigate: (section: string, header?: string) => void;
}) {
  const { data: coursesRes, isLoading } = useCourses(schoolId);
  const { data: apiTeacherClasses } = useTeacherClasses();
  const courses: Course[] = coursesRes ?? [];
  const teacherCourses = teacherId ? courses.filter(c => c.teacherId === teacherId) : courses;
  const apiClasses = (apiTeacherClasses as any)?.data as any[] | undefined;

  const hasApiClasses = (apiClasses?.length ?? 0) > 0;
  const hasCourses = teacherCourses.length > 0;
  const sourceClasses = hasCourses ? teacherCourses : hasApiClasses ? apiClasses! : [];
  const useFallback = sourceClasses.length === 0;
  const displayClasses = useFallback ? FALLBACK : sourceClasses;

  const classColors = ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa', '#fb923c'];

  const totalStudents = useFallback
    ? FALLBACK.reduce((s, c) => s + c.studentCount, 0)
    : hasCourses
      ? teacherCourses.reduce((s, c) => s + (c._count?.enrollments ?? 0), 0)
      : apiClasses!.reduce((s: number, c: any) => s + (c.studentCount ?? 0), 0);
  const avgGrade = useFallback
    ? Math.round(FALLBACK.reduce((s, c) => s + c.avgGrade, 0) / FALLBACK.length * 10) / 10
    : 0;

  return (
    <TeacherSectionShell
      title="My Classes"
      description={`${displayClasses.length} active classes this semester`}
      actions={
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onNavigate('my_classes', 'class_timetable')}>
          <Calendar className="size-3.5" />
          View Timetable
        </Button>
      }
    >
      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-animate>
        <MetricCard label="Total Classes" value={displayClasses.length} accent="#818cf8" />
        <MetricCard label="Total Students" value={totalStudents} accent="#34d399" />
        <MetricCard label="Avg Grade" value={avgGrade > 0 ? avgGrade : 82.3} suffix="%" accent="#fbbf24" />
        <MetricCard label="This Week" value="23" suffix=" hrs" accent="#f472b6" />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl border border-border/50 bg-card/80 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-animate>
          {useFallback
            ? FALLBACK.map(cls => (
                <ClassCard
                  key={cls.id}
                  id={cls.id}
                  name={cls.name}
                  subject={cls.subject}
                  gradeLevel={cls.gradeLevel}
                  period={cls.period}
                  room={cls.room}
                  studentCount={cls.studentCount}
                  avgGrade={cls.avgGrade}
                  nextSession={cls.nextSession}
                  color={cls.color}
                  onView={() => onSelectClass(cls.id)}
                  onAttendance={() => { onNavigate('attendance', 'take_attendance'); notifySuccess(cls.name, 'Taking attendance'); }}
                  onGradebook={() => { onNavigate('gradebook'); notifySuccess(cls.name, 'Opening gradebook'); }}
                  onAssignments={() => { onNavigate('assignments'); notifySuccess(cls.name, 'Viewing assignments'); }}
                />
              ))
            : hasCourses
              ? teacherCourses.map((c, i) => (
                  <ClassCard
                    key={c.id}
                    id={c.id}
                    name={c.name}
                    subject={c.semester ?? 'Course'}
                    gradeLevel={c.gradeLevel}
                    period={i + 1}
                    room={c.gradeLevel}
                    studentCount={c._count?.enrollments ?? 0}
                    avgGrade={0}
                    nextSession=""
                    color={classColors[i % classColors.length]}
                    onView={() => onSelectClass(c.id)}
                    onAttendance={() => { onNavigate('attendance', 'take_attendance'); notifySuccess(c.name, 'Taking attendance'); }}
                    onGradebook={() => { onNavigate('gradebook'); notifySuccess(c.name, 'Opening gradebook'); }}
                    onAssignments={() => { onNavigate('assignments'); notifySuccess(c.name, 'Viewing assignments'); }}
                  />
                ))
              : (apiClasses ?? []).map((c: any, i: number) => (
                  <ClassCard
                    key={c.id}
                    id={c.id}
                    name={c.name}
                    subject={c.subject ?? ''}
                    gradeLevel={c.gradeLevel ?? ''}
                    period={c.period ?? i + 1}
                    room={c.room ?? ''}
                    studentCount={c.studentCount ?? 0}
                    avgGrade={c.avgGrade ?? 0}
                    nextSession={c.nextSession ?? ''}
                    color={c.color ?? classColors[i % classColors.length]}
                    onView={() => onSelectClass(c.id)}
                    onAttendance={() => { onNavigate('attendance', 'take_attendance'); notifySuccess(c.name, 'Taking attendance'); }}
                    onGradebook={() => { onNavigate('gradebook'); notifySuccess(c.name, 'Opening gradebook'); }}
                    onAssignments={() => { onNavigate('assignments'); notifySuccess(c.name, 'Viewing assignments'); }}
                  />
                ))
          }
        </div>
      )}
    </TeacherSectionShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CLASS CARD
   ═══════════════════════════════════════════════════════════════════ */

function ClassCard({
  name, subject, gradeLevel, period, room, studentCount, avgGrade, nextSession, color,
  onView, onAttendance, onGradebook, onAssignments,
}: {
  id: string; name: string; subject: string; gradeLevel: string;
  period: number; room: string; studentCount: number; avgGrade: number;
  nextSession: string; color: string;
  onView: () => void; onAttendance: () => void; onGradebook: () => void; onAssignments: () => void;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-card/90 backdrop-blur-xl transition-all duration-200 hover:shadow-md"
      style={{ borderColor: `${color}25` }}
    >
      <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${color}00, ${color}, ${color}00)` }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className="size-10 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: `${color}18`, color }}
          >
            P{period}
          </div>
          <Badge variant="outline" className="text-[9px] border-border/70 text-muted-foreground">
            {gradeLevel}
          </Badge>
        </div>

        <h3 className="text-base font-semibold text-foreground mb-0.5">{name}</h3>
        <p className="text-xs text-muted-foreground mb-3">{subject}{room ? ` · ${room}` : ''}</p>

        <div className="flex items-center gap-4 text-[11px] text-muted-foreground/80 mb-4">
          <span className="flex items-center gap-1"><Users className="size-3" />{studentCount} students</span>
          {avgGrade > 0 && <span className="flex items-center gap-1"><TrendingUp className="size-3" />{avgGrade}% avg</span>}
          {nextSession && <span className="flex items-center gap-1"><Clock className="size-3" />{nextSession}</span>}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="default" className="h-8 text-xs gap-1.5" onClick={onView}>
            <Eye className="size-3" />
            View Class
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={onAttendance}>
            <ClipboardCheck className="size-3" />
            Attendance
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={onGradebook}>
            <BarChart3 className="size-3" />
            Gradebook
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={onAssignments}>
            <FileText className="size-3" />
            Assignments
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CLASS DETAIL VIEW
   ═══════════════════════════════════════════════════════════════════ */

function ClassDetailView({
  classId,
  onBack,
  onNavigate,
}: {
  classId: string | null;
  schoolId: string | null;
  teacherId: string | null;
  onBack: () => void;
  onNavigate: (section: string, header?: string) => void;
}) {
  const { data: detailRes, isLoading } = useTeacherClassDetail(classId);
  const detail = (detailRes as any)?.data ?? (detailRes as any);
  const [tab, setTab] = useState<'overview' | 'roster'>('overview');
  const [search, setSearch] = useState('');

  const fallbackClass = FALLBACK.find(c => c.id === classId) ?? FALLBACK[0];
  const cls = detail ?? {
    ...fallbackClass,
    attendanceRate: 94.2,
    assignmentCompletion: 87,
    upcomingAssignments: 3,
    recentAssignments: [
      { id: 'a1', title: 'Homework Set 7', type: 'homework', dueDate: '2026-03-06', avgScore: 85, status: 'active' },
      { id: 'a2', title: 'Quiz #4', type: 'quiz', dueDate: '2026-03-05', avgScore: null, status: 'closed' },
    ],
    students: [
      { id: 's1', name: 'Sarah Ahmad', initials: 'SA', email: 'sarah.ahmad@lincoln.edu', average: 90.4, letterGrade: 'A-', attendanceRate: 98, streak: 14, missingAssignments: 0, status: 'excelling' as const },
      { id: 's2', name: 'James Baker', initials: 'JB', email: 'james.baker@lincoln.edu', average: 80.0, letterGrade: 'B-', attendanceRate: 94, streak: 7, missingAssignments: 0, status: 'on-track' as const },
      { id: 's3', name: 'Chen Wei', initials: 'CW', email: 'chen.wei@lincoln.edu', average: 92.1, letterGrade: 'A', attendanceRate: 82, streak: 0, missingAssignments: 0, status: 'on-track' as const },
      { id: 's4', name: 'Maria Garcia', initials: 'MG', email: 'maria.garcia@lincoln.edu', average: 74.0, letterGrade: 'C', attendanceRate: 91, streak: 3, missingAssignments: 1, status: 'at-risk' as const },
      { id: 's5', name: 'Jordan Kim', initials: 'JK', email: 'jordan.kim@lincoln.edu', average: 61.7, letterGrade: 'D', attendanceRate: 85, streak: 1, missingAssignments: 3, status: 'at-risk' as const },
      { id: 's6', name: 'Emma Larsson', initials: 'EL', email: 'emma.larsson@lincoln.edu', average: 88.5, letterGrade: 'B+', attendanceRate: 96, streak: 10, missingAssignments: 0, status: 'on-track' as const },
      { id: 's7', name: 'Alex Rivera', initials: 'AR', email: 'alex.rivera@lincoln.edu', average: 78.3, letterGrade: 'C+', attendanceRate: 93, streak: 5, missingAssignments: 0, status: 'on-track' as const },
      { id: 's8', name: 'Sam Lee', initials: 'SL', email: 'sam.lee@lincoln.edu', average: 96.2, letterGrade: 'A+', attendanceRate: 100, streak: 28, missingAssignments: 0, status: 'excelling' as const },
    ],
  };

  const students: TeacherClassStudent[] = cls.students ?? [];
  const color = cls.color ?? '#818cf8';

  const filtered = search
    ? students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
    : students;

  const excelling = students.filter(s => s.status === 'excelling').length;
  const atRisk = students.filter(s => s.status === 'at-risk').length;

  if (isLoading && classId) {
    return (
      <TeacherSectionShell title="Loading..." description="Fetching class details">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl border border-border/50 bg-card/80 animate-pulse" />
          ))}
        </div>
      </TeacherSectionShell>
    );
  }

  return (
    <TeacherSectionShell
      title={cls.name}
      description={`${cls.subject} · ${cls.gradeLevel} · Period ${cls.period} · ${cls.room}`}
      actions={
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={onBack} className="gap-1.5">
            <ArrowLeft className="size-3.5" /> All Classes
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { onNavigate('attendance', 'take_attendance'); notifySuccess(cls.name, 'Taking attendance'); }}>
            <ClipboardCheck className="size-3.5" /> Take Attendance
          </Button>
          <Button size="sm" variant="default" className="gap-1.5" onClick={() => { onNavigate('assignments'); notifySuccess(cls.name, 'Creating assignment'); }}>
            <FileText className="size-3.5" /> New Assignment
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3" data-animate>
        <MetricCard label="Students" value={cls.studentCount ?? students.length} accent={color} />
        <MetricCard label="Avg Grade" value={cls.avgGrade ?? 0} suffix="%" accent="#34d399" />
        <MetricCard label="Attendance" value={cls.attendanceRate ?? 0} suffix="%" accent="#818cf8" />
        <MetricCard label="Assignment Completion" value={cls.assignmentCompletion ?? 0} suffix="%" accent="#fbbf24" />
        <MetricCard label="Upcoming Work" value={cls.upcomingAssignments ?? 0} accent="#f472b6" />
      </div>

      <div className="flex gap-1 border-b border-border/50 pb-0" data-animate>
        {(['overview', 'roster'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors relative',
              tab === t ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70',
            )}
          >
            {t === 'overview' ? 'Overview' : `Student Roster (${students.length})`}
            {tab === t && (
              <div className="absolute inset-x-0 -bottom-px h-[2px] rounded-full" style={{ backgroundColor: color }} />
            )}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <OverviewTab cls={cls} color={color} excelling={excelling} atRisk={atRisk} students={students} onNavigate={onNavigate} />
      ) : (
        <RosterTab students={filtered} color={color} search={search} onSearch={setSearch} className={cls.name} onNavigate={onNavigate} />
      )}
    </TeacherSectionShell>
  );
}

/* ─── Overview tab ──────────────────────────────────────────────── */
function OverviewTab({
  cls, color, excelling, atRisk, students, onNavigate,
}: {
  cls: any; color: string; excelling: number; atRisk: number;
  students: TeacherClassStudent[]; onNavigate: (section: string, header?: string) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2" data-animate>
      <GlassCard>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Users className="size-4" style={{ color }} /> Student Status
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm"><div className="size-2.5 rounded-full bg-emerald-400" /><span className="text-foreground/80">Excelling</span></div>
            <span className="text-sm font-semibold text-emerald-400">{excelling}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm"><div className="size-2.5 rounded-full bg-sky-400" /><span className="text-foreground/80">On Track</span></div>
            <span className="text-sm font-semibold text-sky-400">{students.length - excelling - atRisk}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm"><div className="size-2.5 rounded-full bg-rose-400" /><span className="text-foreground/80">At Risk</span></div>
            <span className="text-sm font-semibold text-rose-400">{atRisk}</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-muted/60 mt-1">
            {excelling > 0 && <div className="bg-emerald-400 transition-all" style={{ width: `${(excelling / students.length) * 100}%` }} />}
            {students.length - excelling - atRisk > 0 && <div className="bg-sky-400 transition-all" style={{ width: `${((students.length - excelling - atRisk) / students.length) * 100}%` }} />}
            {atRisk > 0 && <div className="bg-rose-400 transition-all" style={{ width: `${(atRisk / students.length) * 100}%` }} />}
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileText className="size-4" style={{ color }} /> Recent Assignments
          </h4>
          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => onNavigate('assignments')}>
            View All <ChevronRight className="size-3" />
          </Button>
        </div>
        <div className="space-y-2">
          {(cls.recentAssignments ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No assignments yet</p>
          ) : (
            (cls.recentAssignments as any[]).map((a: any) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/40 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground">{a.type} · Due {a.dueDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  {a.avgScore != null && <span className="text-sm font-semibold" style={{ color }}>{a.avgScore}%</span>}
                  <StatusBadge status={a.status} tone={a.status === 'active' ? 'good' : a.status === 'draft' ? 'neutral' : 'warn'} />
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      <GlassCard className="lg:col-span-2">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="size-4" style={{ color }} /> Quick Actions
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: ClipboardCheck, label: 'Take Attendance', section: 'attendance', header: 'take_attendance', accent: '#818cf8' },
            { icon: FileText, label: 'New Assignment', section: 'assignments', header: undefined, accent: '#34d399' },
            { icon: BarChart3, label: 'View Gradebook', section: 'gradebook', header: undefined, accent: '#fbbf24' },
            { icon: GraduationCap, label: 'Lesson Plans', section: 'lessons', header: undefined, accent: '#f472b6' },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => { onNavigate(action.section, action.header); notifySuccess(cls.name, action.label); }}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-muted/30 p-4 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div
                className="size-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${action.accent}15`, color: action.accent }}
              >
                <action.icon className="size-4.5" />
              </div>
              <span className="text-xs font-medium text-foreground/80">{action.label}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      {atRisk > 0 && (
        <GlassCard className="lg:col-span-2 border-rose-500/20">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="size-4 text-rose-400" /> Students Needing Attention
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {students.filter(s => s.status === 'at-risk').map(s => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-rose-500/15 bg-rose-500/5 px-4 py-3">
                <div className="size-9 rounded-full bg-rose-500/15 flex items-center justify-center text-xs font-bold text-rose-400">
                  {s.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {s.average}% avg · {s.attendanceRate}% attendance
                    {s.missingAssignments > 0 && ` · ${s.missingAssignments} missing`}
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="h-7 text-xs shrink-0 gap-1 text-rose-400 hover:text-rose-300" onClick={() => onNavigate('behavior')}>
                  <Mail className="size-3" /> Action
                </Button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

/* ─── Roster tab ────────────────────────────────────────────────── */
function RosterTab({
  students, color, search, onSearch, className: clsName, onNavigate,
}: {
  students: TeacherClassStudent[]; color: string; search: string;
  onSearch: (v: string) => void; className: string;
  onNavigate: (section: string, header?: string) => void;
}) {
  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    excelling: { bg: 'bg-emerald-500/10 border-emerald-500/25', text: 'text-emerald-400', label: 'Excelling' },
    'on-track': { bg: 'bg-sky-500/10 border-sky-500/25', text: 'text-sky-400', label: 'On Track' },
    'at-risk': { bg: 'bg-rose-500/10 border-rose-500/25', text: 'text-rose-400', label: 'At Risk' },
  };

  return (
    <div className="space-y-4" data-animate>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input placeholder="Search students..." value={search} onChange={e => onSearch(e.target.value)} className="pl-9 h-9 bg-card/80 border-border/50" />
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/90 backdrop-blur-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-border/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-3">Student</div>
          <div className="col-span-2 text-center">Grade</div>
          <div className="col-span-2 text-center">Attendance</div>
          <div className="col-span-1 text-center">Streak</div>
          <div className="col-span-1 text-center">Missing</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {students.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No students found</div>
        ) : (
          students.map((s, i) => {
            const sc = statusColors[s.status] ?? statusColors['on-track'];
            return (
              <div
                key={s.id}
                className={cn(
                  'grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors hover:bg-muted/30',
                  i % 2 === 1 && 'bg-muted/10',
                )}
              >
                <div className="col-span-3 flex items-center gap-3 min-w-0">
                  <div className="size-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: `${color}18`, color }}>
                    {s.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{s.email}</p>
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-semibold" style={{ color: s.average >= 85 ? '#34d399' : s.average >= 70 ? '#fbbf24' : '#f87171' }}>{s.average}%</span>
                  <span className="text-[10px] text-muted-foreground ml-1">({s.letterGrade})</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className={cn('text-sm font-medium', s.attendanceRate >= 90 ? 'text-foreground' : 'text-rose-400')}>{s.attendanceRate}%</span>
                </div>
                <div className="col-span-1 text-center text-sm text-muted-foreground">
                  {s.streak > 0 ? <span className="inline-flex items-center gap-0.5"><span className="text-emerald-400">{s.streak}</span><span className="text-[10px]">🔥</span></span> : '—'}
                </div>
                <div className="col-span-1 text-center">
                  {s.missingAssignments > 0 ? <span className="text-sm font-semibold text-rose-400">{s.missingAssignments}</span> : <span className="text-sm text-muted-foreground">0</span>}
                </div>
                <div className="col-span-1 flex justify-center">
                  <Badge className={cn('text-[9px] font-medium border', sc.bg, sc.text)}>{sc.label}</Badge>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1" onClick={() => { onNavigate('gradebook'); notifySuccess(s.name, `Viewing grades in ${clsName}`); }}>
                    <BarChart3 className="size-3" /> Grades
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1" onClick={() => { onNavigate('behavior'); notifySuccess(s.name, 'Adding behavior note'); }}>
                    <Star className="size-3" /> Note
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TIMETABLE VIEW
   ═══════════════════════════════════════════════════════════════════ */

function TimetableView(_props: TeacherSectionProps) {
  const { data: scheduleRes } = useTeacherSchedule();
  const { navigate } = useNavigationStore();
  const apiSchedule = (scheduleRes as any)?.data as { id: string; time: string; endTime: string; title: string; type: string; room: string }[] | undefined;

  const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const demoTimetable = [
    { day: 'Monday', slots: [{ time: '8:00–8:50', name: 'Algebra II', room: 'Rm 204' }, { time: '9:00–9:50', name: 'AP Calculus AB', room: 'Rm 204' }, { time: '10:15–11:05', name: 'Geometry', room: 'Rm 106' }, { time: '13:00–13:50', name: 'Physics Honors', room: 'Lab 301' }, { time: '14:00–14:50', name: 'Pre-Algebra', room: 'Rm 204' }] },
    { day: 'Tuesday', slots: [{ time: '8:00–8:50', name: 'Algebra II', room: 'Rm 204' }, { time: '9:00–9:50', name: 'AP Calculus AB', room: 'Rm 204' }, { time: '10:15–11:05', name: 'Geometry', room: 'Rm 106' }, { time: '13:00–13:50', name: 'Physics Honors', room: 'Lab 301' }, { time: '14:00–14:50', name: 'Pre-Algebra', room: 'Rm 204' }] },
    { day: 'Wednesday', slots: [{ time: '8:00–8:50', name: 'Algebra II', room: 'Rm 204' }, { time: '9:00–9:50', name: 'AP Calculus AB', room: 'Rm 204' }, { time: '11:00–12:00', name: 'Dept Meeting', room: 'Rm 108' }, { time: '13:00–13:50', name: 'Physics Honors', room: 'Lab 301' }] },
    { day: 'Thursday', slots: [{ time: '8:00–8:50', name: 'Algebra II', room: 'Rm 204' }, { time: '9:00–9:50', name: 'AP Calculus AB', room: 'Rm 204' }, { time: '10:15–11:05', name: 'Geometry', room: 'Rm 106' }, { time: '13:00–13:50', name: 'Physics Honors', room: 'Lab 301' }, { time: '14:00–14:50', name: 'Pre-Algebra', room: 'Rm 204' }] },
    { day: 'Friday', slots: [{ time: '8:00–8:50', name: 'Algebra II', room: 'Rm 204' }, { time: '9:00–9:50', name: 'AP Calculus AB', room: 'Rm 204' }, { time: '10:15–11:05', name: 'Geometry', room: 'Rm 106' }, { time: '14:00–14:50', name: 'Pre-Algebra', room: 'Rm 204' }] },
  ];

  const timetable = apiSchedule?.length
    ? WEEKDAYS.map(day => ({
        day,
        slots: apiSchedule
          .filter(s => s.type === 'class' || s.type === 'meeting')
          .map(s => ({ time: `${s.time}–${s.endTime}`, name: s.title.replace(/ — .*/, ''), room: s.room })),
      }))
    : demoTimetable;

  const classColors = ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];
  const colorMap = new Map<string, string>();
  timetable.forEach(d => d.slots.forEach(s => {
    if (!colorMap.has(s.name)) colorMap.set(s.name, classColors[colorMap.size % classColors.length]);
  }));

  return (
    <TeacherSectionShell
      title="My Timetable"
      description="Weekly schedule overview"
      actions={
        <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => navigate('my_classes', 'class_list')}>
          <ArrowLeft className="size-3.5" /> All Classes
        </Button>
      }
    >
      <div className="overflow-x-auto" data-animate>
        <div className="grid grid-cols-5 gap-3 min-w-[750px]">
          {timetable.map(day => (
            <div key={day.day}>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 text-center">{day.day}</h4>
              <div className="space-y-2">
                {day.slots.map((slot, i) => {
                  const clr = colorMap.get(slot.name) ?? '#818cf8';
                  return (
                    <div key={i} className="rounded-xl border p-3 transition-all hover:scale-[1.02]" style={{ borderColor: `${clr}30`, backgroundColor: `${clr}08` }}>
                      <p className="text-[10px] font-mono text-muted-foreground/70">{slot.time}</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: clr }}>{slot.name}</p>
                      <p className="text-[10px] text-muted-foreground/60">{slot.room}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TeacherSectionShell>
  );
}
