/* ─── MyDaySection ─── Student "Today" workspace ───────────────────────
 * Default landing page showing: today's schedule, tasks due, announcements,
 * missing submissions, exam countdown, attendance, quick actions, recent feedback
 * ─────────────────────────────────────────────────────────────────────── */
import { useMemo, useState } from 'react';
import {
  Clock, BookOpen, FileText, AlertTriangle, CalendarCheck, Bell,
  ChevronRight, CheckCircle2, Timer, MessageCircle, Download,
  Calendar, ClipboardList, ArrowRight, CircleDot,
  Flame, Star, Megaphone,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useStudentStore } from '@/store/student-data.store';
import { useAuthStore } from '@/store/auth.store';
import { useNavigationStore } from '@/store/navigation.store';
import { notifySuccess } from '@/lib/notify';
import { EmptyState } from '@/components/features/EmptyState';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function MyDaySection() {
  const user = useAuthStore(s => s.user);
  const store = useStudentStore();
  const { navigate: nav } = useNavigationStore();
  const [expandedQuickActions, setExpandedQuickActions] = useState(false);

  const firstName = user?.firstName ?? 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const dayOfWeek = (new Date().getDay() + 6) % 7; // Mon=0

  // Today's classes
  const todayClasses = useMemo(() =>
    store.timetable
      .filter(t => t.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map(t => ({
        ...t,
        subject: store.getSubject(t.subjectId),
        teacher: store.getTeacher(t.teacherId),
      })),
    [store, dayOfWeek],
  );

  // Next class
  const nextClass = useMemo(() => {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return todayClasses.find(c => {
      const [h, m] = c.startTime.split(':').map(Number);
      return h * 60 + m > nowMin && !c.cancelled;
    });
  }, [todayClasses]);

  // Tasks due soon (next 3 days)
  const tasksDueSoon = useMemo(() => {
    const limit = new Date();
    limit.setDate(limit.getDate() + 3);
    return store.assignments
      .filter(a => ['not_started', 'in_progress'].includes(a.status) && new Date(a.dueDate) <= limit)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [store.assignments]);

  // Missing submissions
  const missing = useMemo(() =>
    store.assignments.filter(a => a.status === 'missing'),
    [store.assignments],
  );

  // Upcoming exams (next 14 days)
  const upcomingExams = useMemo(() => {
    const limit = new Date();
    limit.setDate(limit.getDate() + 14);
    return store.exams
      .filter(e => e.status === 'upcoming' && new Date(e.date) <= limit)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [store.exams]);

  // Unread announcements
  const unreadAnn = useMemo(() =>
    store.announcements.filter(a => !a.read),
    [store.announcements],
  );

  // Unread notifications
  const unreadNotifs = useMemo(() =>
    store.notifications.filter(n => !n.read).length,
    [store.notifications],
  );

  // Unread feedback
  const unreadFeedback = useMemo(() =>
    store.feedback.filter(f => !f.read),
    [store.feedback],
  );

  // Attendance stats
  const attendanceStats = useMemo(() => {
    const total = store.attendance.length;
    const present = store.attendance.filter(a => a.status === 'present').length;
    const late = store.attendance.filter(a => a.status === 'late').length;
    const absent = store.attendance.filter(a => a.status === 'absent').length;
    return { total, present, late, absent, rate: total ? Math.round(((present + late) / total) * 100) : 100 };
  }, [store.attendance]);

  // Quick action items
  const quickActions = [
    { label: 'View Timetable', icon: Calendar, color: '#818cf8', action: () => nav('school', 'courses', 'courses_overview') },
    { label: 'Submit Homework', icon: FileText, color: '#34d399', action: () => nav('school', 'grades_assignments', 'upcoming') },
    { label: 'Check Grades', icon: ClipboardList, color: '#f472b6', action: () => nav('school', 'grades_assignments', 'gradebook') },
    { label: 'Read Announcements', icon: Megaphone, color: '#fbbf24', action: () => nav('communication', 'community', 'community_announcements') },
    { label: 'Message Teacher', icon: MessageCircle, color: '#38bdf8', action: () => nav('communication', 'email', 'inbox') },
    { label: 'Exam Schedule', icon: Timer, color: '#f97316', action: () => nav('school', 'grades_assignments', 'upcoming') },
    { label: 'Download Document', icon: Download, color: '#a78bfa', action: () => nav('setting', 'account', 'billing_settings') },
    { label: 'Check Attendance', icon: CalendarCheck, color: '#84cc16', action: () => nav('school', 'courses', 'courses_overview') },
  ];

  const daysUntil = (date: string) => {
    const d = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    if (d === 0) return 'Today';
    if (d === 1) return 'Tomorrow';
    return `In ${d} days`;
  };

  const priorityColor = (p: string) => p === 'high' ? 'text-red-400 bg-red-500/10 border-red-500/20' : p === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white/90">{greeting}, {firstName}</h1>
          <p className="text-sm text-white/40">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadNotifs > 0 && (
            <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 gap-1">
              <Bell className="size-3" /> {unreadNotifs} new
            </Badge>
          )}
          {missing.length > 0 && (
            <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10 gap-1">
              <AlertTriangle className="size-3" /> {missing.length} missing
            </Badge>
          )}
        </div>
      </div>

      {/* ── Top stat strip ── */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <MiniStat icon={<BookOpen className="size-4" />} label="Today's Classes" value={todayClasses.filter(c => !c.cancelled).length.toString()} color="#818cf8" />
        <MiniStat icon={<FileText className="size-4" />} label="Tasks Due Soon" value={tasksDueSoon.length.toString()} color="#f97316" />
        <MiniStat icon={<CalendarCheck className="size-4" />} label="Attendance Rate" value={`${attendanceStats.rate}%`} color="#34d399" />
        <MiniStat icon={<Flame className="size-4" />} label="Upcoming Exams" value={upcomingExams.length.toString()} color="#f472b6" />
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* ── Today's Schedule ── */}
        <Card className="lg:col-span-2 border-white/8 bg-white/[0.02]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-indigo-400" />
                <CardTitle className="text-base text-white/85">Today's Schedule — {DAYS[dayOfWeek] ?? 'Weekend'}</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] border-white/10 text-white/50">
                {todayClasses.filter(c => !c.cancelled).length} classes
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {dayOfWeek > 4 ? (
              <EmptyState title="It's the weekend!" description="No classes today. Rest up and prepare for next week." />
            ) : todayClasses.length === 0 ? (
              <EmptyState icon={<Calendar className="size-7 text-white/20" />} title="No classes today" description="Your schedule is clear for today." />
            ) : (
              <ScrollArea className="h-[340px] pr-3">
                <div className="space-y-2">
                  {todayClasses.map((cls) => {
                    const isNext = nextClass?.id === cls.id;
                    return (
                      <div key={cls.id} className={cn(
                        'group flex items-center gap-3 rounded-xl border p-3 transition-all',
                        cls.cancelled ? 'border-red-500/10 bg-red-500/[0.03] opacity-60' :
                        isNext ? 'border-indigo-500/20 bg-indigo-500/[0.06] shadow-lg shadow-indigo-500/5' :
                        'border-white/6 hover:border-white/10 hover:bg-white/[0.02]',
                      )}>
                        <div className="w-[70px] flex-shrink-0 text-center">
                          <span className="text-xs font-medium text-white/50">{cls.startTime}</span>
                          <span className="block text-[10px] text-white/30">{cls.endTime}</span>
                        </div>
                        <div className="h-10 w-1 rounded-full" style={{ backgroundColor: cls.subject?.color ?? '#666' }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn('text-sm font-medium', cls.cancelled ? 'line-through text-white/40' : 'text-white/80')}>
                              {cls.subject?.name ?? 'Free Period'}
                            </span>
                            {isNext && <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-[9px]">NEXT</Badge>}
                            {cls.cancelled && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[9px]">CANCELLED</Badge>}
                            {cls.type === 'lab' && <Badge variant="outline" className="text-[9px] border-white/10 text-white/40">Lab</Badge>}
                            {cls.type === 'tutorial' && <Badge variant="outline" className="text-[9px] border-white/10 text-white/40">Tutorial</Badge>}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[11px] text-white/40">{cls.room}</span>
                            <span className="text-[11px] text-white/40">{cls.teacher?.name}</span>
                          </div>
                          {cls.note && <p className="text-[10px] text-amber-400/70 mt-1">{cls.note}</p>}
                        </div>
                        <ChevronRight className="size-4 text-white/15 group-hover:text-white/30 transition-colors" />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* ── Tasks Due Soon ── */}
        <Card className="border-white/8 bg-white/[0.02]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-4 text-orange-400" />
              <CardTitle className="text-base text-white/85">Tasks Due Soon</CardTitle>
            </div>
            <CardDescription className="text-white/35">Next 3 days</CardDescription>
          </CardHeader>
          <CardContent>
            {tasksDueSoon.length === 0 ? (
              <EmptyState icon={<CheckCircle2 className="size-7 text-emerald-400/30" />} title="All caught up!" description="No assignments due in the next 3 days." />
            ) : (
              <ScrollArea className="h-[300px] pr-2">
                <div className="space-y-2">
                  {tasksDueSoon.map(task => {
                    const subj = store.getSubject(task.subjectId);
                    return (
                      <div key={task.id} className="rounded-xl border border-white/6 bg-white/[0.02] p-3 hover:border-white/10 transition-all cursor-pointer group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white/80 truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="size-2 rounded-full" style={{ backgroundColor: subj?.color }} />
                              <span className="text-[11px] text-white/40">{subj?.name}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className={cn('text-[9px] flex-shrink-0 border', priorityColor(task.priority))}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11px] text-white/40">{daysUntil(task.dueDate)}</span>
                          <Badge variant="outline" className="text-[9px] border-white/10 text-white/40 capitalize">
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Second row: Missing + Exams + Announcements ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Missing Submissions */}
        <Card className="border-white/8 bg-white/[0.02]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-red-400" />
              <CardTitle className="text-base text-white/85">Missing Submissions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {missing.length === 0 ? (
              <EmptyState icon={<CheckCircle2 className="size-7 text-emerald-400/30" />} title="Nothing missing" description="All your submissions are up to date." />
            ) : (
              <div className="space-y-2">
                {missing.map(a => {
                  const subj = store.getSubject(a.subjectId);
                  return (
                    <div key={a.id} className="flex items-center gap-3 rounded-xl border border-red-500/10 bg-red-500/[0.03] p-3">
                      <div className="size-2 rounded-full bg-red-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/70 truncate">{a.title}</p>
                        <p className="text-[11px] text-white/35">{subj?.name} — Due {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                      {a.allowResubmit && (
                        <Button size="sm" variant="outline" className="text-[10px] h-7 border-red-500/20 text-red-400 hover:bg-red-500/10"
                          onClick={() => { store.updateAssignmentStatus(a.id, 'submitted'); notifySuccess('Submitted', `${a.title} marked as submitted`); }}>
                          Submit
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exam Countdown */}
        <Card className="border-white/8 bg-white/[0.02]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Timer className="size-4 text-pink-400" />
              <CardTitle className="text-base text-white/85">Exam Countdown</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingExams.length === 0 ? (
              <EmptyState title="No upcoming exams" description="No exams scheduled in the next 14 days." />
            ) : (
              <div className="space-y-2">
                {upcomingExams.slice(0, 4).map(e => {
                  const subj = store.getSubject(e.subjectId);
                  const daysLeft = Math.ceil((new Date(e.date).getTime() - Date.now()) / 86400000);
                  return (
                    <div key={e.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] p-3 hover:border-white/10 transition-all">
                      <div className="flex flex-col items-center justify-center size-12 rounded-xl border border-white/8 bg-white/[0.03]">
                        <span className="text-lg font-bold text-white/80">{daysLeft}</span>
                        <span className="text-[9px] text-white/35 -mt-1">days</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/80 truncate">{e.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="size-2 rounded-full" style={{ backgroundColor: subj?.color }} />
                          <span className="text-[11px] text-white/40">{subj?.name}</span>
                          <span className="text-[11px] text-white/30">{e.startTime} — {e.venue}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card className="border-white/8 bg-white/[0.02]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-amber-400" />
                <CardTitle className="text-base text-white/85">Announcements</CardTitle>
              </div>
              {unreadAnn.length > 0 && (
                <Badge variant="outline" className="text-[10px] border-amber-500/20 text-amber-400 bg-amber-500/10">
                  {unreadAnn.length} new
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-2">
              <div className="space-y-2">
                {store.announcements.slice(0, 5).map(ann => (
                  <div key={ann.id} className={cn(
                    'rounded-xl border p-3 transition-all cursor-pointer hover:border-white/10',
                    ann.read ? 'border-white/6 bg-white/[0.01]' : 'border-amber-500/10 bg-amber-500/[0.03]',
                  )} onClick={() => store.markAnnouncementRead(ann.id)}>
                    <div className="flex items-start gap-2">
                      {ann.pinned && <Star className="size-3 text-amber-400 flex-shrink-0 mt-0.5" />}
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm font-medium truncate', ann.read ? 'text-white/60' : 'text-white/85')}>
                          {ann.title}
                        </p>
                        <p className="text-[11px] text-white/30 mt-0.5 line-clamp-1">{ann.body}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <CategoryBadge category={ann.category} />
                          <span className="text-[10px] text-white/25">{new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                      {!ann.read && <CircleDot className="size-2.5 text-amber-400 flex-shrink-0 mt-1" />}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* ── Third row: Recent Feedback + Quick Actions ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Feedback */}
        <Card className="lg:col-span-2 border-white/8 bg-white/[0.02]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 text-purple-400" />
              <CardTitle className="text-base text-white/85">Recent Teacher Feedback</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {unreadFeedback.length === 0 && store.feedback.length === 0 ? (
              <EmptyState title="No feedback yet" description="Teacher feedback will appear here." />
            ) : (
              <div className="space-y-2">
                {store.feedback.slice(0, 4).map(fb => {
                  const subj = fb.subjectId ? store.getSubject(fb.subjectId) : null;
                  return (
                    <div key={fb.id} className={cn(
                      'rounded-xl border p-3 transition-all cursor-pointer',
                      fb.read ? 'border-white/6 bg-white/[0.01]' : 'border-purple-500/10 bg-purple-500/[0.03]',
                    )} onClick={() => store.markFeedbackRead(fb.id)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white/70">{fb.from}</span>
                            {subj && <Badge variant="outline" className="text-[9px] border-white/10 text-white/40">{subj.name}</Badge>}
                            <FeedbackTypeBadge type={fb.type} />
                          </div>
                          <p className="text-[12px] text-white/50 mt-1 line-clamp-2">{fb.message}</p>
                        </div>
                        {!fb.read && <CircleDot className="size-2.5 text-purple-400 flex-shrink-0 mt-1" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-white/8 bg-white/[0.02]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ArrowRight className="size-4 text-cyan-400" />
              <CardTitle className="text-base text-white/85">Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.slice(0, expandedQuickActions ? undefined : 6).map(qa => (
                <button key={qa.label} onClick={qa.action} className="group flex items-center gap-2.5 rounded-xl border border-white/6 bg-white/[0.02] p-3 transition-all hover:bg-white/[0.05] hover:border-white/10 text-left">
                  <div className="flex size-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${qa.color}15`, color: qa.color }}>
                    <qa.icon className="size-4" />
                  </div>
                  <span className="text-xs text-white/50 group-hover:text-white/70">{qa.label}</span>
                </button>
              ))}
            </div>
            {quickActions.length > 6 && (
              <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-white/30 hover:text-white/50"
                onClick={() => setExpandedQuickActions(v => !v)}>
                {expandedQuickActions ? 'Show Less' : `Show All (${quickActions.length})`}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Attendance Overview Strip ── */}
      <Card className="border-white/8 bg-white/[0.02]">
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <CalendarCheck className="size-5 text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-white/80">Attendance Summary</p>
                <p className="text-[11px] text-white/35">Last 30 school days</p>
              </div>
            </div>
            <Separator orientation="vertical" className="hidden sm:block h-8 bg-white/6" />
            <div className="flex flex-wrap gap-4">
              <AttendancePill label="Present" count={attendanceStats.present} color="#34d399" />
              <AttendancePill label="Late" count={attendanceStats.late} color="#fbbf24" />
              <AttendancePill label="Absent" count={attendanceStats.absent} color="#f43f5e" />
              <AttendancePill label="Total Days" count={attendanceStats.total} color="#818cf8" />
            </div>
            <div className="sm:ml-auto flex items-center gap-2">
              <span className="text-lg font-bold text-white/90">{attendanceStats.rate}%</span>
              <Progress value={attendanceStats.rate} className="w-24 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Mini helpers ── */
function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <Card className="border-white/8 bg-white/[0.02]">
      <CardContent className="flex items-center gap-3 py-3 px-4">
        <div className="flex size-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}15`, color }}>
          {icon}
        </div>
        <div>
          <p className="text-lg font-bold text-white/90">{value}</p>
          <p className="text-[10px] text-white/35">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AttendancePill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="size-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs text-white/50">{label}:</span>
      <span className="text-xs font-semibold text-white/70">{count}</span>
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, string> = {
    urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
    exam: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    academic: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    event: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    general: 'bg-white/5 text-white/40 border-white/10',
  };
  return <Badge variant="outline" className={cn('text-[9px] capitalize', map[category] ?? map.general)}>{category}</Badge>;
}

function FeedbackTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    praise: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    improvement: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    warning: 'bg-red-500/10 text-red-400 border-red-500/20',
    general: 'bg-white/5 text-white/40 border-white/10',
  };
  return <Badge variant="outline" className={cn('text-[9px] capitalize', map[type] ?? map.general)}>{type}</Badge>;
}
