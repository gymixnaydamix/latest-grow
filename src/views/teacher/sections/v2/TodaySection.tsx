/* ─── Today Teaching Command Center ──────────────────────────────── 
 * The teacher's homepage. NOT a KPI card dashboard.
 * Action-first: schedule timeline, grading queue, student alerts,
 * urgent tasks. Everything a teacher needs at 7:30 AM.
 * ──────────────────────────────────────────────────────────────────── */
import { useMemo } from 'react';
import {
  AlertTriangle, ArrowRight, BookOpen, Calendar, CheckCircle2,
  ChevronRight, ClipboardList, Coffee, Edit3,
  FileText, MessageSquare, Star,
  Users, Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCourses } from '@/hooks/api';
import { useTeacherSchedule, useTeacherActionItems, useTeacherStudentAlerts, useTeacherGradingQueue } from '@/hooks/api/use-teacher';
import { useAuthStore } from '@/store/auth.store';
import { useNavigationStore } from '@/store/navigation.store';
import type { Course } from '@root/types';
import {
  TeacherSectionShell, MetricCard, GlassCard, UrgentInline,
} from './shared';
import type { TeacherSectionProps } from './shared';
import {
  todayScheduleDemo as FALLBACK_todayScheduleDemo,
  actionItemsDemo as FALLBACK_actionItemsDemo,
  studentAlertsDemo as FALLBACK_studentAlertsDemo,
  gradingQueueDemo as FALLBACK_gradingQueueDemo,
  teacherClassesDemo as FALLBACK_teacherClassesDemo,
  type ScheduleItemDemo,
} from './teacher-demo-data';

export function TodaySection({ schoolId, teacherId }: TeacherSectionProps) {
  const { user } = useAuthStore();
  const { setSection, setHeader } = useNavigationStore();
  const { data: coursesRes } = useCourses(schoolId);
  const { data: apiSchedule } = useTeacherSchedule();
  const { data: apiActionItems } = useTeacherActionItems();
  const { data: apiStudentAlerts } = useTeacherStudentAlerts();
  const { data: apiGradingQueue } = useTeacherGradingQueue();
  const courses: Course[] = coursesRes ?? [];
  const teacherCourses = teacherId ? courses.filter(c => c.teacherId === teacherId) : courses;

  const firstName = user?.firstName ?? 'Teacher';
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Derive schedule from real courses, API schedule, or demo
  const schedule = useMemo(() => {
    if (teacherCourses.length > 0) {
      return teacherCourses.map((c, i) => {
        const hour = 8 + i;
        return {
          id: c.id,
          time: `${String(hour).padStart(2, '0')}:00`,
          endTime: `${String(hour + 1).padStart(2, '0')}:00`,
          title: `${c.name} — ${c.gradeLevel}`,
          type: 'class' as const,
          room: 'Room TBD',
          classId: c.id,
          studentCount: c._count?.enrollments ?? 25,
        } satisfies ScheduleItemDemo;
      });
    }
    const apiItems = (apiSchedule as any)?.data as any[] | undefined;
    if (apiItems?.length) {
      return apiItems.map((s: any) => ({
        id: s.id ?? s.classId ?? '',
        time: s.startTime ?? s.time ?? '08:00',
        endTime: s.endTime ?? '09:00',
        title: s.title ?? s.name ?? 'Class',
        type: (s.type ?? 'class') as ScheduleItemDemo['type'],
        room: s.room ?? 'TBD',
        classId: s.classId,
        studentCount: s.studentCount ?? 25,
      } satisfies ScheduleItemDemo));
    }
    return FALLBACK_todayScheduleDemo;
  }, [teacherCourses, apiSchedule]);

  const classCount = schedule.filter(s => s.type === 'class').length;
  const totalStudents = teacherCourses.length > 0
    ? teacherCourses.reduce((sum, c) => sum + (c._count?.enrollments ?? 25), 0)
    : FALLBACK_teacherClassesDemo.reduce((sum, c) => sum + c.studentCount, 0);

  const apiActions = (apiActionItems as any)?.data as any[] | undefined;
  const actionItems = apiActions?.length ? apiActions : FALLBACK_actionItemsDemo;
  const urgentActions = actionItems.filter((a: any) => a.priority === 'HIGH');

  const apiAlertsData = (apiStudentAlerts as any)?.data as typeof FALLBACK_studentAlertsDemo | undefined;
  const studentAlerts = apiAlertsData?.length ? apiAlertsData : FALLBACK_studentAlertsDemo;

  const apiGradingData = (apiGradingQueue as any)?.data as typeof FALLBACK_gradingQueueDemo | undefined;
  const gradingQueue = apiGradingData?.length ? apiGradingData : FALLBACK_gradingQueueDemo;
  const ungradedCount = gradingQueue.reduce((sum, g) => sum + g.submitted, 0);

  // Current/next period detection
  const currentPeriodIdx = schedule.findIndex(s => {
    const [h, m] = s.time.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    const start = h * 60 + m;
    const end = eh * 60 + em;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return nowMin >= start && nowMin < end;
  });

  const typeStyles: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
    class: { bg: 'bg-indigo-500/8', border: 'border-indigo-500/20', text: 'text-indigo-400', icon: <BookOpen className="size-4" /> },
    meeting: { bg: 'bg-amber-500/8', border: 'border-amber-500/20', text: 'text-amber-400', icon: <Users className="size-4" /> },
    prep: { bg: 'bg-emerald-500/8', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: <Edit3 className="size-4" /> },
    duty: { bg: 'bg-orange-500/8', border: 'border-orange-500/20', text: 'text-orange-400', icon: <Star className="size-4" /> },
    break: { bg: 'bg-card/80', border: 'border-border/50', text: 'text-muted-foreground/70', icon: <Coffee className="size-4" /> },
  };

  const navigateTo = (section: string, header?: string) => {
    setSection(section);
    if (header) setHeader(header);
  };

  return (
    <TeacherSectionShell
      title={`${greeting}, ${firstName}`}
      description={`${dateStr} · ${classCount} classes · ${totalStudents} students`}
    >
      {/* ── Urgent Alerts ── */}
      {urgentActions.length > 0 && (
        <div className="space-y-2" data-animate>
          {urgentActions.map(a => (
            <UrgentInline key={a.id} message={`${a.title} — ${a.dueBy}`} />
          ))}
        </div>
      )}

      {/* ── Quick Stats Bar ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-animate>
        <MetricCard label="Classes Today" value={classCount} accent="#818cf8" />
        <MetricCard label="Students" value={totalStudents} accent="#34d399" />
        <MetricCard label="To Grade" value={ungradedCount} accent="#f472b6" trend="down" />
        <MetricCard label="Alerts" value={studentAlerts.filter(a => a.severity === 'high').length} accent="#fbbf24" />
      </div>

      {/* ── Main Content: Schedule + Actions ── */}
      <div className="grid gap-4 lg:grid-cols-5" data-animate>

        {/* ── Schedule Timeline (3/5) ── */}
        <div className="lg:col-span-3">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-foreground/80">Today&apos;s Timeline</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-muted-foreground"
                onClick={() => navigateTo('my_classes', 'class_timetable')}
              >
                Full timetable <ChevronRight className="ml-1 size-3" />
              </Button>
            </div>
            <div className="space-y-1.5">
              {schedule.map((item, i) => {
                const style = typeStyles[item.type] ?? typeStyles.class;
                const isCurrent = i === currentPeriodIdx;
                return (
                  <div
                    key={item.id}
                    className={`group relative flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                      isCurrent
                        ? 'border-indigo-500/40 bg-indigo-500/10 ring-1 ring-indigo-500/20'
                        : `${style.border} ${style.bg} hover:bg-muted/60`
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-indigo-400" />
                    )}
                    <span className="w-[110px] shrink-0 text-xs font-mono text-muted-foreground/80">
                      {item.time} – {item.endTime}
                    </span>
                    <div className={`shrink-0 ${style.text}`}>{style.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground/80 truncate">{item.title}</p>
                      {item.room && <p className="text-[11px] text-muted-foreground/70">{item.room}{item.studentCount ? ` · ${item.studentCount} students` : ''}</p>}
                    </div>
                    {item.type === 'class' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] text-muted-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => navigateTo('attendance', 'take_attendance')}
                      >
                        Attendance <ArrowRight className="ml-1 size-3" />
                      </Button>
                    )}
                    {isCurrent && (
                      <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[9px]">NOW</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* ── Right Column: Actions + Alerts (2/5) ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Action Items */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="size-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground/80">Action Required</h3>
              <Badge variant="outline" className="ml-auto text-[9px] border-amber-500/30 text-amber-400">{actionItems.length}</Badge>
            </div>
            <div className="space-y-2">
              {actionItems.slice(0, 5).map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border/40 bg-card/60 p-3">
                  <div className={`mt-0.5 size-2 rounded-full shrink-0 ${a.priority === 'HIGH' ? 'bg-rose-400' : a.priority === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground/70 truncate">{a.title}</p>
                    <p className="text-[10px] text-muted-foreground/70">{a.dueBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Student Alerts */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="size-4 text-rose-400" />
              <h3 className="text-sm font-semibold text-foreground/80">Student Alerts</h3>
            </div>
            <div className="space-y-2">
              {studentAlerts.slice(0, 4).map(al => (
                <div key={al.id} className="flex items-start gap-3 rounded-lg border border-border/40 bg-card/60 p-3">
                  <Avatar className="size-7 border border-border/70 shrink-0">
                    <AvatarFallback className={`text-[9px] ${al.severity === 'high' ? 'bg-rose-500/10 text-rose-400' : al.severity === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-sky-500/10 text-sky-400'}`}>
                      {al.studentInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground/70">{al.studentName}</p>
                    <p className="text-[10px] text-muted-foreground/70 line-clamp-1">{al.alert}</p>
                  </div>
                  <span className="text-[9px] text-muted-foreground/50 shrink-0">{al.timestamp}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ── Grading Queue ── */}
      <GlassCard className="mt-1" data-animate>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-4 text-pink-400" />
            <h3 className="text-sm font-semibold text-foreground/80">Grading Queue</h3>
            <Badge variant="outline" className="text-[9px] border-pink-500/30 text-pink-400">{gradingQueue.length} items</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-muted-foreground"
            onClick={() => navigateTo('gradebook', 'grade_entry')}
          >
            Open Gradebook <ChevronRight className="ml-1 size-3" />
          </Button>
        </div>
        <div className="space-y-2">
          {gradingQueue.map(g => (
            <div key={g.id} className="flex items-center gap-4 rounded-xl border border-border/40 bg-card/60 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground/70 truncate">{g.assignment}</p>
                <p className="text-[11px] text-muted-foreground/70">{g.className} · {g.dueDate}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-semibold text-foreground/70">{g.submitted}/{g.total}</span>
                <p className="text-[10px] text-muted-foreground/60">submitted</p>
              </div>
              <Progress value={(g.submitted / g.total) * 100} className="w-20 h-1.5" />
              <Badge variant="outline" className="text-[9px] border-border/70 text-muted-foreground">{g.type}</Badge>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── Quick Links ── */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" data-animate>
        {[
          { label: 'Take Attendance', icon: <CheckCircle2 className="size-4" />, section: 'attendance', header: 'take_attendance', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Grade Papers', icon: <ClipboardList className="size-4" />, section: 'gradebook', header: 'grade_entry', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
          { label: 'New Assignment', icon: <FileText className="size-4" />, section: 'assignments', header: 'create_assignment', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
          { label: 'Messages', icon: <MessageSquare className="size-4" />, section: 'messages', header: 'inbox', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        ].map(link => (
          <button
            key={link.label}
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-all hover:scale-[1.02] ${link.color}`}
            onClick={() => navigateTo(link.section, link.header)}
          >
            {link.icon}
            {link.label}
          </button>
        ))}
      </div>
    </TeacherSectionShell>
  );
}
