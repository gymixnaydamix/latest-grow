import { type HTMLAttributes, type ReactNode, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Coffee,
  Edit3,
  FileText,
  MessageSquare,
  Sparkles,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import type { Course } from '@root/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCourses } from '@/hooks/api';
import {
  useTeacherActionItems,
  useTeacherGradingQueue,
  useTeacherSchedule,
  useTeacherStudentAlerts,
} from '@/hooks/api/use-teacher';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useNavigationStore } from '@/store/navigation.store';
import { TeacherSectionShell } from './shared';
import type { TeacherSectionProps } from './shared';
import {
  type ActionItemDemo,
  type GradingQueueItemDemo,
  type ScheduleItemDemo,
  type StudentAlertDemo,
} from './teacher-demo-data';

const panelTones = {
  indigo: {
    border: 'border-indigo-500/20',
    glowA: 'bg-indigo-500/18',
    glowB: 'bg-sky-400/12',
  },
  emerald: {
    border: 'border-emerald-500/20',
    glowA: 'bg-emerald-500/18',
    glowB: 'bg-cyan-400/12',
  },
  amber: {
    border: 'border-amber-500/20',
    glowA: 'bg-amber-500/18',
    glowB: 'bg-orange-400/12',
  },
  rose: {
    border: 'border-rose-500/20',
    glowA: 'bg-rose-500/18',
    glowB: 'bg-fuchsia-400/12',
  },
  slate: {
    border: 'border-border/60',
    glowA: 'bg-slate-400/12',
    glowB: 'bg-white/8',
  },
} as const;

const scheduleVisuals: Record<
  ScheduleItemDemo['type'],
  { icon: ReactNode; label: string; tint: string; text: string; badge: string }
> = {
  class: {
    icon: <BookOpen className="size-4" />,
    label: 'Class',
    tint: 'bg-indigo-500/10',
    text: 'text-indigo-500',
    badge: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-500',
  },
  meeting: {
    icon: <Users className="size-4" />,
    label: 'Meeting',
    tint: 'bg-amber-500/10',
    text: 'text-amber-500',
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
  },
  prep: {
    icon: <Edit3 className="size-4" />,
    label: 'Prep',
    tint: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
  },
  duty: {
    icon: <Star className="size-4" />,
    label: 'Duty',
    tint: 'bg-orange-500/10',
    text: 'text-orange-500',
    badge: 'border-orange-500/30 bg-orange-500/10 text-orange-500',
  },
  break: {
    icon: <Coffee className="size-4" />,
    label: 'Break',
    tint: 'bg-muted',
    text: 'text-muted-foreground',
    badge: 'border-border/70 bg-muted/70 text-muted-foreground',
  },
};

const actionVisuals: Record<
  ActionItemDemo['category'],
  { icon: ReactNode; pill: string; accent: string }
> = {
  grading: {
    icon: <ClipboardList className="size-4" />,
    pill: 'border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-500',
    accent: 'from-fuchsia-500/20 via-pink-500/10 to-transparent',
  },
  attendance: {
    icon: <CheckCircle2 className="size-4" />,
    pill: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-500',
    accent: 'from-emerald-500/20 via-teal-500/10 to-transparent',
  },
  meeting: {
    icon: <Users className="size-4" />,
    pill: 'border-amber-500/25 bg-amber-500/10 text-amber-500',
    accent: 'from-amber-500/20 via-orange-500/10 to-transparent',
  },
  admin: {
    icon: <Sparkles className="size-4" />,
    pill: 'border-sky-500/25 bg-sky-500/10 text-sky-500',
    accent: 'from-sky-500/20 via-cyan-500/10 to-transparent',
  },
  student: {
    icon: <AlertTriangle className="size-4" />,
    pill: 'border-rose-500/25 bg-rose-500/10 text-rose-500',
    accent: 'from-rose-500/20 via-pink-500/10 to-transparent',
  },
};

function EdgePanel({
  className,
  tone = 'slate',
  style,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: keyof typeof panelTones }) {
  const theme = panelTones[tone];

  return (
    <section
      className={cn(
        'relative min-w-0 overflow-hidden rounded-[28px] border bg-card/92 p-4 shadow-[0_22px_70px_-38px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:p-5',
        theme.border,
        className,
      )}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
        ...style,
      }}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className={cn('absolute -right-10 -top-12 h-36 w-36 rounded-full blur-3xl', theme.glowA)} />
        <div className={cn('absolute -left-12 bottom-0 h-28 w-28 rounded-full blur-3xl', theme.glowB)} />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
      </div>
      <div className="relative z-10 min-w-0">{children}</div>
    </section>
  );
}

function SectionKicker({
  icon,
  eyebrow,
  title,
  meta,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  meta?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-foreground/80">
            {icon}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            {eyebrow}
          </span>
        </div>
        <h3 className="text-base font-semibold tracking-tight text-foreground lg:text-lg">{title}</h3>
      </div>
      {meta && <p className="shrink-0 text-[11px] text-muted-foreground">{meta}</p>}
    </div>
  );
}

function BentoStat({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  tone: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/7 p-3.5 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className={cn('mt-2 text-2xl font-semibold tracking-tight', tone)}>{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>
    </div>
  );
}

function resolveActionTarget(action: Partial<ActionItemDemo> & { type?: string }) {
  const kind = action.category ?? action.type;
  switch (kind) {
    case 'grading':
      return { section: 'gradebook', header: 'grade_entry' };
    case 'attendance':
      return { section: 'attendance', header: 'take_attendance' };
    case 'meeting':
      return { section: 'meetings', header: 'upcoming_meetings' };
    case 'student':
      return { section: 'behavior', header: 'add_note' };
    case 'admin':
      return { section: 'lessons', header: 'my_lessons' };
    default:
      return null;
  }
}

export function TodaySection({ schoolId, teacherId }: TeacherSectionProps) {
  const { user } = useAuthStore();
  const { setHeader, setSection } = useNavigationStore();
  const { data: coursesRes } = useCourses(schoolId);
  const { data: apiSchedule } = useTeacherSchedule();
  const { data: apiActionItems } = useTeacherActionItems();
  const { data: apiStudentAlerts } = useTeacherStudentAlerts();
  const { data: apiGradingQueue } = useTeacherGradingQueue();

  const courses: Course[] = coursesRes ?? [];
  const teacherCourses = teacherId ? courses.filter(course => course.teacherId === teacherId) : courses;
  const firstName = user?.firstName ?? 'Teacher';
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const schedule = useMemo<ScheduleItemDemo[]>(() => {
    if (teacherCourses.length > 0) {
      return teacherCourses.map((course, index) => {
        const hour = 8 + index;
        return {
          id: course.id,
          time: `${String(hour).padStart(2, '0')}:00`,
          endTime: `${String(hour + 1).padStart(2, '0')}:00`,
          title: `${course.name} - ${course.gradeLevel}`,
          type: 'class' as const,
          room: 'Room TBD',
          classId: course.id,
          studentCount: course._count?.enrollments ?? 25,
          notes: undefined,
        } satisfies ScheduleItemDemo;
      });
    }

    const items = (apiSchedule as any)?.data as any[] | undefined;
    if (items?.length) {
      return items.map(item => ({
        id: item.id ?? item.classId ?? '',
        time: item.startTime ?? item.time ?? '08:00',
        endTime: item.endTime ?? '09:00',
        title: item.title ?? item.name ?? 'Class',
        type: (item.type ?? 'class') as ScheduleItemDemo['type'],
        room: item.room ?? 'TBD',
        classId: item.classId,
        studentCount: item.studentCount ?? 25,
        notes: item.notes,
      } satisfies ScheduleItemDemo));
    }

    return [];
  }, [apiSchedule, teacherCourses]);

  const actionItems = ((apiActionItems as any)?.data as ActionItemDemo[] | undefined)?.length
    ? ((apiActionItems as any).data as ActionItemDemo[])
    : [];
  const studentAlerts = ((apiStudentAlerts as any)?.data as StudentAlertDemo[] | undefined)?.length
    ? ((apiStudentAlerts as any).data as StudentAlertDemo[])
    : [];
  const gradingQueue = ((apiGradingQueue as any)?.data as GradingQueueItemDemo[] | undefined)?.length
    ? ((apiGradingQueue as any).data as GradingQueueItemDemo[])
    : [];

  const classCount = schedule.filter(item => item.type === 'class').length;
  const totalStudents = teacherCourses.length > 0
    ? teacherCourses.reduce((sum, course) => sum + (course._count?.enrollments ?? 25), 0)
    : 0;
  const highAlertCount = studentAlerts.filter(alert => alert.severity === 'high').length;
  const toGradeCount = gradingQueue.reduce((sum, item) => sum + item.submitted, 0);
  const gradingCoverage = gradingQueue.length
    ? Math.round(gradingQueue.reduce((sum, item) => sum + (item.submitted / item.total) * 100, 0) / gradingQueue.length)
    : 0;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const currentPeriodIdx = schedule.findIndex(item => {
    const [startHour, startMinute] = item.time.split(':').map(Number);
    const [endHour, endMinute] = item.endTime.split(':').map(Number);
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
    return nowMinutes >= start && nowMinutes < end;
  });

  const currentFocus = currentPeriodIdx >= 0 ? schedule[currentPeriodIdx] : null;
  const nextFocus = schedule.find((item, index) => index > currentPeriodIdx && item.type !== 'break') ?? schedule[0] ?? null;
  const heroActions = actionItems.filter(item => item.priority === 'HIGH').slice(0, 3);
  const timelineItems = currentPeriodIdx >= 0
    ? schedule.slice(Math.max(0, currentPeriodIdx - 1), Math.min(schedule.length, currentPeriodIdx + 3))
    : schedule.slice(0, 4);
  const visibleActions = actionItems.slice(0, 4);
  const visibleAlerts = studentAlerts.slice(0, 3);
  const visibleQueue = gradingQueue.slice(0, 4);
  const dayMomentum = Math.max(68, 100 - highAlertCount * 7);

  const navigateTo = (section: string, header?: string) => {
    setSection(section);
    if (header) setHeader(header);
  };

  return (
    <TeacherSectionShell
      title={`${greeting}, ${firstName}`}
      description={`${dateLabel} - ${classCount} classes - ${totalStudents} students`}
      actions={(
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-indigo-500/30 bg-indigo-500/10 text-indigo-500">Live dashboard</Badge>
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigateTo('attendance', 'take_attendance')}>
            Start attendance
          </Button>
        </div>
      )}
    >
      <div
        className="grid gap-3 xl:h-[calc(100vh-16.5rem)] xl:grid-cols-12 xl:grid-rows-[minmax(0,1.02fr)_minmax(0,0.86fr)_minmax(0,0.96fr)]"
        data-animate
      >
        <EdgePanel tone="indigo" className="h-full xl:col-span-7">
          <div className="grid h-full gap-3 xl:grid-cols-[minmax(0,1fr)_260px]">
            <div className="flex min-w-0 flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  <span>Teaching cockpit</span>
                  <span className="h-1 w-1 rounded-full bg-indigo-500/70" />
                  <span>Command view</span>
                </div>
                <div className="space-y-2">
                  <h3 className="max-w-2xl text-2xl font-semibold tracking-tight text-foreground lg:text-[2rem]">
                    A tighter bento dashboard for the full school day.
                  </h3>
                  <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                    Priority work, the next teaching block, and the critical student signals now sit in one compact desktop canvas.
                  </p>
                </div>
              </div>

              <div className="grid gap-2 lg:grid-cols-3">
                {(heroActions.length ? heroActions : actionItems.slice(0, 3)).map(action => {
                  const visual = actionVisuals[action.category];
                  const target = resolveActionTarget(action);
                  return (
                    <button
                      key={action.id}
                      type="button"
                      className={cn(
                        'group rounded-[22px] border border-white/10 bg-gradient-to-br p-3 text-left transition hover:-translate-y-0.5',
                        visual.accent,
                      )}
                      onClick={() => target && navigateTo(target.section, target.header)}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className={cn('flex size-9 items-center justify-center rounded-2xl border border-white/10', visual.pill)}>
                          {visual.icon}
                        </span>
                        <Badge className={cn('text-[10px]', visual.pill)}>{action.priority}</Badge>
                      </div>
                      <p className="text-sm font-semibold leading-5 text-foreground">{action.title}</p>
                      <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                        <span>{action.dueBy}</span>
                        <ArrowUpRight className="size-3.5 text-foreground/80" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-2.5">
              <div className="rounded-[22px] border border-white/10 bg-white/9 p-3.5">
                <SectionKicker
                  icon={<Sparkles className="size-4" />}
                  eyebrow={currentFocus ? 'In progress' : 'Up next'}
                  title={currentFocus?.title ?? nextFocus?.title ?? 'Nothing scheduled'}
                  meta={currentFocus ? `${currentFocus.time} - ${currentFocus.endTime}` : nextFocus ? `${nextFocus.time} - ${nextFocus.endTime}` : undefined}
                />
                <div className="mt-3 rounded-[18px] border border-white/10 bg-background/45 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    {currentFocus ? 'Current block' : 'Next block'}
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {(currentFocus ?? nextFocus)?.room || 'Room TBD'}
                    {(currentFocus ?? nextFocus)?.studentCount ? ` - ${(currentFocus ?? nextFocus)?.studentCount} students` : ''}
                  </p>
                  {(currentFocus ?? nextFocus)?.notes && (
                    <p className="mt-1 text-[11px] text-muted-foreground">{(currentFocus ?? nextFocus)?.notes}</p>
                  )}
                </div>
                <Button
                  className="mt-3 w-full rounded-2xl"
                  onClick={() => navigateTo(currentFocus?.type === 'class' ? 'attendance' : 'my_classes', currentFocus?.type === 'class' ? 'take_attendance' : 'class_timetable')}
                >
                  {currentFocus?.type === 'class' ? 'Open attendance' : 'Open timetable'}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <BentoStat label="Classes" value={classCount} detail="scheduled today" tone="text-indigo-500" />
                <BentoStat label="To grade" value={toGradeCount} detail={`${gradingCoverage}% queue coverage`} tone="text-fuchsia-500" />
              </div>
            </div>
          </div>
        </EdgePanel>

        <EdgePanel tone="emerald" className="h-full xl:col-span-5">
          <SectionKicker icon={<Zap className="size-4" />} eyebrow="Performance pulse" title="Status at a glance" />
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <BentoStat label="Students" value={totalStudents} detail="active today" tone="text-emerald-500" />
            <BentoStat label="Alerts" value={highAlertCount} detail="high-priority signals" tone="text-amber-500" />
            <BentoStat label="Queue" value={gradingQueue.length} detail="ready for review" tone="text-sky-500" />
            <BentoStat label="Momentum" value={`${dayMomentum}%`} detail="day health estimate" tone="text-rose-500" />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-[20px] border border-white/10 bg-white/7 px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Focus</p>
              <p className="mt-2 text-sm font-medium text-foreground">{currentFocus ? 'Class live' : 'Prep window'}</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/7 px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Action</p>
              <p className="mt-2 text-sm font-medium text-foreground">{visibleActions.length} queued</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/7 px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Signals</p>
              <p className="mt-2 text-sm font-medium text-foreground">{visibleAlerts.length} to review</p>
            </div>
          </div>
        </EdgePanel>

        <EdgePanel tone="slate" className="h-full xl:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionKicker icon={<Calendar className="size-4" />} eyebrow="Timeline" title="Near-term schedule" />
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigateTo('my_classes', 'class_timetable')}>
              Full timetable
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {timelineItems.map(item => {
              const visual = scheduleVisuals[item.type] ?? scheduleVisuals.class;
              const isCurrent = currentFocus?.id === item.id;
              return (
                <div
                  key={item.id}
                  className={cn(
                    'grid gap-3 rounded-[20px] border px-3.5 py-3 md:grid-cols-[88px_40px_minmax(0,1fr)_auto]',
                    isCurrent ? 'border-indigo-500/35 bg-indigo-500/8' : 'border-border/60 bg-background/50',
                  )}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {item.time} - {item.endTime}
                  </div>
                  <div className={cn('flex size-10 items-center justify-center rounded-2xl border border-white/10', visual.tint, visual.text)}>
                    {visual.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <Badge className={cn('text-[10px]', visual.badge)}>{isCurrent ? 'Now' : visual.label}</Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {item.room || 'No room'}
                      {item.studentCount ? ` - ${item.studentCount} students` : ''}
                    </p>
                  </div>
                  {item.type === 'class' ? (
                    <Button variant="outline" size="sm" className="justify-self-start rounded-full md:justify-self-end" onClick={() => navigateTo('attendance', 'take_attendance')}>
                      Attendance
                    </Button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </EdgePanel>

        <EdgePanel tone="rose" className="h-full xl:col-span-3">
          <SectionKicker icon={<Zap className="size-4" />} eyebrow="Action required" title="Next tasks" meta={`${visibleActions.length} items`} />
          <div className="mt-3 space-y-2">
            {visibleActions.map(action => {
              const visual = actionVisuals[action.category];
              const target = resolveActionTarget(action);
              return (
                <button
                  key={action.id}
                  type="button"
                  className="w-full rounded-[20px] border border-white/10 bg-white/8 p-3 text-left transition hover:bg-white/12"
                  onClick={() => target && navigateTo(target.section, target.header)}
                >
                  <div className="flex items-start gap-3">
                    <span className={cn('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl border border-white/10', visual.pill)}>
                      {visual.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{action.title}</p>
                        <Badge className={cn('text-[10px]', visual.pill)}>{action.priority}</Badge>
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">{action.dueBy}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </EdgePanel>

        <EdgePanel tone="amber" className="h-full xl:col-span-4">
          <SectionKicker icon={<ArrowUpRight className="size-4" />} eyebrow="Quick launch" title="Jump into the work" />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              { label: 'Attendance', icon: <CheckCircle2 className="size-4" />, section: 'attendance', header: 'take_attendance' },
              { label: 'Gradebook', icon: <ClipboardList className="size-4" />, section: 'gradebook', header: 'grade_entry' },
              { label: 'Assignment', icon: <FileText className="size-4" />, section: 'assignments', header: 'create_assignment' },
              { label: 'Messages', icon: <MessageSquare className="size-4" />, section: 'messages', header: 'inbox' },
            ].map(action => (
              <button
                key={action.label}
                type="button"
                className="flex items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-white/8 px-4 py-3 text-left transition hover:bg-white/12"
                onClick={() => navigateTo(action.section, action.header)}
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-2xl border border-white/10 bg-background/55">
                    {action.icon}
                  </span>
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-[20px] border border-white/10 bg-white/7 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Design note</p>
            <p className="mt-2 text-sm text-foreground">Cards are denser, shorter, and balanced for the desktop viewport so the dashboard reads like a single control surface.</p>
          </div>
        </EdgePanel>

        <EdgePanel tone="amber" className="h-full xl:col-span-5">
          <SectionKicker icon={<AlertTriangle className="size-4" />} eyebrow="Student signals" title="Learners needing follow-up" />
          <div className="mt-3 space-y-2">
            {visibleAlerts.map(alert => (
              <div key={alert.id} className="rounded-[20px] border border-white/10 bg-white/8 p-3">
                <div className="flex items-start gap-3">
                  <Avatar className="size-10 border border-white/10">
                    <AvatarFallback
                      className={cn(
                        'text-[11px] font-semibold',
                        alert.severity === 'high' && 'bg-rose-500/10 text-rose-500',
                        alert.severity === 'medium' && 'bg-amber-500/10 text-amber-500',
                        alert.severity === 'info' && 'bg-sky-500/10 text-sky-500',
                      )}
                    >
                      {alert.studentInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{alert.studentName}</p>
                      <Badge className="border-border/70 bg-background/70 text-[10px] text-muted-foreground">{alert.className}</Badge>
                    </div>
                    <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{alert.alert}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigateTo('behavior', 'add_note')}>
                        Log note
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigateTo('messages', 'compose')}>
                        Message
                      </Button>
                      <span className="ml-auto text-[11px] text-muted-foreground">{alert.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </EdgePanel>

        <EdgePanel tone="indigo" className="h-full xl:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionKicker icon={<ClipboardList className="size-4" />} eyebrow="Grading queue" title="Ready to be assessed" meta={`${visibleQueue.length} items`} />
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigateTo('gradebook', 'grade_entry')}>
              Open gradebook
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {visibleQueue.map(item => (
              <div key={item.id} className="rounded-[20px] border border-white/10 bg-white/8 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.assignment}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{item.className} - {item.dueDate}</p>
                  </div>
                  <Badge className="border-border/70 bg-background/70 text-[10px] text-muted-foreground">{item.type}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{item.submitted}/{item.total}</p>
                    <p className="text-[11px] text-muted-foreground">submitted</p>
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <Progress value={(item.submitted / item.total) * 100} className="h-2" />
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigateTo('assignments', 'submissions')}>
                    Grade
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </EdgePanel>
      </div>
    </TeacherSectionShell>
  );
}
